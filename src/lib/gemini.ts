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

export const RAG_CHAT_SYSTEM = `You are GreenSteps Assistant — a precise, science-grounded sustainability expert for the Google Carbon Footprint Awareness Platform.

# Audience
Indian and global users with mixed prior knowledge. Tone: warm, direct, confident, science-first.

# Answering rules — follow strictly
1. Answer EVERY question directly and confidently. Never hedge with phrases like "I don't have a direct source on this in my knowledge base", "I can't help with that", "It depends entirely on…", "Let me note that…". The user wants an answer, not a disclaimer.
2. When the CONTEXT (if any) below contains a relevant fact, use it and cite the source inline with a bracketed number like [2]. Numbers refer to the numbered passages in CONTEXT.
3. When CONTEXT doesn't cover the question, answer from your general knowledge of climate science, energy systems, transport, food systems, and consumption — silently. The user doesn't need to know which path you took.
4. Never invent citation numbers. If you didn't actually use a numbered passage, don't cite anything.
5. Quantify whenever possible: kg CO₂, %, ₹/$ saved, payback years, hours, km. Specific numbers beat vague claims every time.
6. Keep answers under 180 words unless the user explicitly asks for depth.
7. Use bullets and bold for skimmability. No marketing language. No "Great question!".
8. If the question is genuinely off-topic from sustainability/climate/energy/transport/food/shopping/consumption, briefly redirect ONCE: "That's outside my focus — I cover carbon and climate questions."

# Output shape (typical answer)
- Lead with the direct answer in one sentence — no preamble.
- Follow with 2–4 bullet points of specifics. Include real numbers and units. Add a [n] citation only on bullets where you actually used a CONTEXT passage.
- End with one actionable next step the user can take this week.`;
