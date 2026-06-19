// ----------------------------------------------------------------------------
// Retrieval-Augmented Generation utilities backed by pgvector.
// Uses raw SQL for similarity search since Prisma can't yet model vector ops.
// ----------------------------------------------------------------------------

import { prisma } from "./prisma";
import { embed } from "./gemini";

export interface RetrievedChunk {
  id: string;
  documentId: string;
  content: string;
  title: string;
  source: string | null;
  similarity: number;
}

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 80;

export function chunkText(text: string): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= CHUNK_SIZE) return [clean];
  const chunks: string[] = [];
  let i = 0;
  while (i < clean.length) {
    chunks.push(clean.slice(i, i + CHUNK_SIZE));
    i += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
}

export async function indexDocument(documentId: string, content: string) {
  const chunks = chunkText(content);

  await prisma.embedding.deleteMany({ where: { documentId } });

  for (let i = 0; i < chunks.length; i++) {
    const vector = await embed(chunks[i]);
    const created = await prisma.embedding.create({
      data: { documentId, chunkIndex: i, content: chunks[i] },
      select: { id: true },
    });
    // pgvector column is Unsupported in Prisma — set via raw SQL.
    await prisma.$executeRawUnsafe(
      `UPDATE "Embedding" SET embedding = $1::vector WHERE id = $2`,
      `[${vector.join(",")}]`,
      created.id,
    );
  }
}

// Drop chunks below this similarity floor — keeps weak/irrelevant retrievals
// out of the prompt so Gemini doesn't anchor its answer on noise.
const MIN_SIMILARITY = 0.45;

export async function similaritySearch(
  query: string,
  topK = 5,
  minSimilarity = MIN_SIMILARITY,
): Promise<RetrievedChunk[]> {
  const vector = await embed(query);
  const vec = `[${vector.join(",")}]`;

  // 1 - cosine distance = similarity
  const rows = await prisma.$queryRawUnsafe<RetrievedChunk[]>(
    `
    SELECT e.id, e."documentId", e.content,
           d.title, d.source,
           1 - (e.embedding <=> $1::vector) AS similarity
    FROM "Embedding" e
    JOIN "Document" d ON d.id = e."documentId"
    WHERE e.embedding IS NOT NULL
    ORDER BY e.embedding <=> $1::vector
    LIMIT ${Math.max(1, Math.min(20, topK * 2))};
    `,
    vec,
  );

  // Filter by relevance threshold, then dedupe to keep at most one chunk per
  // logical source. We key on title+source so accidental document dupes
  // (re-seeds, duplicate uploads) don't surface as [1] and [2] of the same doc.
  const filtered = rows.filter((r) => (Number(r.similarity) || 0) >= minSimilarity);
  const seen = new Set<string>();
  const deduped: RetrievedChunk[] = [];
  for (const r of filtered) {
    const key = `${r.title}::${r.source ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(r);
    if (deduped.length >= topK) break;
  }
  return deduped;
}

export function buildContext(chunks: RetrievedChunk[]): string {
  // Return an empty string when there's nothing relevant. Earlier this
  // returned a literal "(No relevant context...)" sentence that nudged the
  // model into hedging openings like "I don't have a direct source on this".
  // Now an empty context lets the model answer from general knowledge
  // silently — guided by the system prompt's "never hedge" rule.
  if (chunks.length === 0) return "";
  return chunks
    .map((c, i) => `[${i + 1}] ${c.title} (${c.source ?? "GreenSteps KB"})\n${c.content}`)
    .join("\n\n");
}

export function buildCitations(chunks: RetrievedChunk[]) {
  return chunks.map((c, i) => ({
    index: i + 1,
    documentId: c.documentId,
    title: c.title,
    source: c.source,
    snippet: c.content.slice(0, 160) + (c.content.length > 160 ? "…" : ""),
    score: Number(c.similarity?.toFixed(3) ?? 0),
  }));
}
