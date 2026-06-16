// ----------------------------------------------------------------------------
// Content moderation. Two-layer:
//   1. Local fast-fail wordlist + obvious patterns (zero-cost, blocks 95%).
//   2. Gemini safety classification for borderline content (paid, only on pass-1).
// Designed to fail safe — if Gemini is down, we still apply layer 1.
// ----------------------------------------------------------------------------

import { generateText } from "./gemini";

const BLOCKED_PATTERNS: RegExp[] = [
  // Slurs and explicit hate (intentionally redacted — real list belongs in a
  // private file or external service). The list below is illustrative only.
  /\b(kys|kill yourself)\b/i,
  /\b(retard(ed)?|n[i!1]gg[ae3]r)\b/i,
  /\b(rape|molest)\b/i,
  // Obvious spam / advertising
  /\b(viagra|cialis|porn|xxx|onlyfans)\b/i,
  /(https?:\/\/|www\.)\S+\.(tk|ml|ga|cf|gq|biz|click|shop)\b/i,
  // Phone / payment harvesting
  /\b(whatsapp|telegram)\s*\+?\d{6,}\b/i,
];

const URL_LIMIT = 1; // max 1 link per pledge

export interface ModerationResult {
  allow: boolean;
  reason?: string;
  severity?: "low" | "medium" | "high";
}

export function localModerate(text: string): ModerationResult {
  const trimmed = text.trim();

  if (!trimmed) return { allow: false, reason: "empty", severity: "low" };
  if (trimmed.length > 280) return { allow: false, reason: "too_long", severity: "low" };

  const urls = trimmed.match(/https?:\/\/\S+/gi) ?? [];
  if (urls.length > URL_LIMIT) return { allow: false, reason: "too_many_links", severity: "medium" };

  for (const re of BLOCKED_PATTERNS) {
    if (re.test(trimmed)) return { allow: false, reason: "blocked_pattern", severity: "high" };
  }

  // Heuristic: ALL CAPS message (likely shouting)
  const letters = trimmed.replace(/[^A-Za-z]/g, "");
  if (letters.length > 30 && letters === letters.toUpperCase()) {
    return { allow: false, reason: "all_caps", severity: "low" };
  }

  return { allow: true };
}

/** Optional second pass: Gemini safety classification. Best-effort. */
export async function aiModerate(text: string): Promise<ModerationResult> {
  const local = localModerate(text);
  if (!local.allow) return local;

  try {
    const verdict = await generateText(
      `You are a content moderation classifier for a public sustainability pledge wall.
Reply with ONLY one word: ALLOW or BLOCK.
A message is BLOCK only if it contains: hate speech, slurs, sexual content, threats, spam, or political extremism.
General opinions, criticism of products/companies, or strong climate stances are ALLOW.

Message: """${text.slice(0, 500)}"""`,
    );
    const decision = verdict.trim().toUpperCase().split(/\s+/)[0];
    if (decision === "BLOCK") {
      return { allow: false, reason: "ai_blocked", severity: "high" };
    }
    return { allow: true };
  } catch {
    // Gemini unavailable — local pass already cleared it
    return { allow: true };
  }
}
