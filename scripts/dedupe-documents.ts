// One-off: removes Document rows that share the same (title, source).
// Keeps the one with the most embeddings, deletes the rest (cascade clears
// orphan Embedding rows automatically).

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const docs = await prisma.document.findMany({
    include: { _count: { select: { embeddings: true } } },
  });

  const groups = new Map<string, typeof docs>();
  for (const d of docs) {
    const key = `${d.title}::${d.source ?? ""}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(d);
  }

  let removed = 0;
  for (const [, group] of groups) {
    if (group.length < 2) continue;
    // Keep the one with the most embeddings
    group.sort((a, b) => b._count.embeddings - a._count.embeddings);
    const [keep, ...drop] = group;
    console.log(`Group "${keep.title}" — keeping ${keep.id} (${keep._count.embeddings} chunks), dropping ${drop.length} dupes`);
    for (const d of drop) {
      await prisma.document.delete({ where: { id: d.id } });
      removed++;
    }
  }
  console.log(`Removed ${removed} duplicate document(s).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
