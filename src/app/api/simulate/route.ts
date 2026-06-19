import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateText } from "@/lib/gemini";
import { RATE_LIMITS, identifierFromRequest, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { localModerate } from "@/lib/moderation";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const MAX_PROMPT_LEN = 500;

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  // Rate limit (allow anonymous use of simulator preview)
  const rl = await rateLimit(identifierFromRequest(req, userId), RATE_LIMITS.simulate);
  if (!rl.success) return rateLimitResponse(rl);

  const { prompt } = await req.json();
  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }
  if (prompt.length > MAX_PROMPT_LEN) {
    return NextResponse.json({ error: "Prompt too long" }, { status: 413 });
  }
  const mod = localModerate(prompt);
  if (!mod.allow) {
    return NextResponse.json({ error: "Prompt blocked", reason: mod.reason }, { status: 400 });
  }

  const system = `You are a carbon-footprint scenario calculator.
Given a "what if" lifestyle change, you reply ONLY with a JSON object — no prose, no markdown:
{
  "title": "<short title under 50 chars>",
  "description": "<one sentence>",
  "monthlySaving": <kg CO2 saved per month, number>,
  "annualCostSaving": <USD saved per year, number>,
  "timeToImpactMonths": <months until full impact, integer>
}
Use IPCC, EPA and IEA-aligned estimates. Be realistic — single-digit savings are normal.`;

  try {
    const raw = await generateText(prompt, system);
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch (e) {
    logger.error("simulate.scenario_failed", { promptLen: prompt.length }, e);
    return NextResponse.json({
      title: "Custom scenario",
      description: prompt,
      monthlySaving: 25,
      annualCostSaving: 200,
      timeToImpactMonths: 2,
    });
  }
}
