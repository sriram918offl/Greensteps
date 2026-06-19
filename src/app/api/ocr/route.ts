import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { RATE_LIMITS, identifierFromRequest, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const apiKey =
  process.env.GEMINI_API_KEY ??
  process.env.GOOGLE_AI_API_KEY ??
  process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const MODEL =
  process.env.GEMINI_MODEL ?? process.env.GEMINI_CHAT_MODEL ?? "gemini-1.5-flash";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/heic"]);

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit (expensive endpoint)
  const rl = await rateLimit(identifierFromRequest(req, userId), RATE_LIMITS.ocr);
  if (!rl.success) return rateLimitResponse(rl);

  const form = await req.formData();
  const file = form.get("bill") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File too large (max 4 MB)" }, { status: 413 });
  if (!ALLOWED_MIME.has(file.type)) return NextResponse.json({ error: "Unsupported image type" }, { status: 415 });
  if (!apiKey) return NextResponse.json({ error: "Gemini not configured" }, { status: 500 });

  const bytes = Buffer.from(await file.arrayBuffer()).toString("base64");
  const mime = file.type || "image/jpeg";

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: MODEL,
    systemInstruction:
      `You extract data from electricity bill images. Reply with ONLY a JSON object:
{
  "kwh": <units consumed, number>,
  "billingPeriod": "<YYYY-MM to YYYY-MM>",
  "amount": <total cost, number or null>,
  "currency": "<ISO code or null>"
}`,
  });

  try {
    const res = await model.generateContent([
      { inlineData: { data: bytes, mimeType: mime } },
      { text: "Extract the data from this electricity bill." },
    ]);
    const raw = res.response.text().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(raw);
    // Carbon estimate: 0.4 kg CO2 per kWh average grid factor
    const estimatedCo2 = Number(parsed.kwh ?? 0) * 0.4;
    return NextResponse.json({ ...parsed, estimatedCo2 });
  } catch (e) {
    logger.error("ocr.extraction_failed", { mime, bytes: file.size }, e);
    return NextResponse.json({ error: "Failed to extract data" }, { status: 500 });
  }
}
