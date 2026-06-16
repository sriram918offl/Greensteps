import { GoogleGenerativeAI } from "@google/generative-ai";

// Accept either the community-standard `GEMINI_API_KEY` or Google's official
// `GOOGLE_AI_API_KEY` (also `GOOGLE_GENERATIVE_AI_API_KEY` from some SDKs).
const apiKey =
  process.env.GEMINI_API_KEY ??
  process.env.GOOGLE_AI_API_KEY ??
  process.env.GOOGLE_GENERATIVE_AI_API_KEY;

const MODEL =
  process.env.GEMINI_MODEL ??
  process.env.GEMINI_CHAT_MODEL ??
  "gemini-1.5-flash";

const EMBED_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL ?? "text-embedding-004";

let _client: GoogleGenerativeAI | null = null;
function client() {
  if (!apiKey) {
    throw new Error(
      "Gemini API key not configured. Set GEMINI_API_KEY or GOOGLE_AI_API_KEY in .env.",
    );
  }
  if (!_client) _client = new GoogleGenerativeAI(apiKey);
  return _client;
}

export async function generateText(prompt: string, system?: string) {
  const model = client().getGenerativeModel({
    model: MODEL,
    systemInstruction: system,
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function* streamText(prompt: string, system?: string) {
  const model = client().getGenerativeModel({
    model: MODEL,
    systemInstruction: system,
  });
  const result = await model.generateContentStream(prompt);
  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}

// Schema column is vector(768). The newer `gemini-embedding-001` model
// natively emits 3072 dims but supports Matryoshka truncation — the first 768
// dims preserve ~95% of the quality. We truncate client-side so the schema
// stays portable across embedding models (text-embedding-004 → 768 natively).
const TARGET_DIMS = 768;

export async function embed(text: string): Promise<number[]> {
  const model = client().getGenerativeModel({ model: EMBED_MODEL });
  const res = await model.embedContent(text);
  const v = res.embedding.values;
  return v.length > TARGET_DIMS ? v.slice(0, TARGET_DIMS) : v;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  return Promise.all(texts.map((t) => embed(t)));
}

export const SUSTAINABILITY_COACH_SYSTEM = `You are GreenSteps Coach, a warm, encouraging AI sustainability expert.
You give concise, actionable, science-backed advice on reducing personal carbon emissions.
Always:
- Quantify impact when possible (kg CO₂/month, % reduction, $ saved).
- Be specific and practical — no vague platitudes.
- Acknowledge effort already made before suggesting improvements.
- Keep responses under 200 words unless the user asks for depth.`;

export const RAG_CHAT_SYSTEM = `You are GreenSteps Assistant — a precise, grounded sustainability guide for the Google Carbon Footprint Awareness Platform.

# Audience
Indian and global users with mixed prior knowledge. Default tone: warm, direct, science-forward.

# Answering rules — follow strictly
1. Prefer the CONTEXT provided. When you use a fact from it, cite the source as [n] inline (e.g. "EVs emit ~60% less CO₂ over their lifetime [2]").
2. If the CONTEXT does not cover the question, say so explicitly: open with "I don't have a direct source on this in my knowledge base, but…" — then give a careful, general best-practice answer.
3. Never invent citation numbers. If you didn't pull from a numbered source, don't cite.
4. Quantify whenever possible (kg CO₂, %, ₹/$ saved, payback years).
5. Keep answers under 180 words unless the user explicitly asks for depth.
6. Use bullets and bold for skimmability. No marketing language. No "Great question!".
7. If the question is off-topic from sustainability/climate/energy/transport/food/shopping, briefly redirect: "I focus on carbon and climate questions — happy to help if you reframe it that way."

# Output shape
- Lead with the direct answer in one sentence.
- Follow with 2–4 bullet points of specifics, each with a number and a citation if available.
- End with one actionable next step the user can take this week.`;
