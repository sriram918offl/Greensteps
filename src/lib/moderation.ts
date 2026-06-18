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

// ----------------------------------------------------------------------------
// Pledge moderation — 3-tier verdict for the hybrid publish flow.
//   • allow → publish instantly (clean content)
//   • hold  → save but keep hidden (approved=false) for admin review
//             (borderline: AI unsure, links present, weak signals)
//   • block → reject outright (hard slur/spam/threat patterns)
//
// Moderates ALL user-visible fields (name + city + message), not just the
// message — the name field was an unmoderated hole.
// ----------------------------------------------------------------------------

export type PledgeVerdict = "allow" | "hold" | "block";

export interface PledgeModerationResult {
  verdict: PledgeVerdict;
  reason?: string;
}

export async function moderatePledge(fields: {
  name: string;
  city?: string;
  message: string;
}): Promise<PledgeModerationResult> {
  const { name, city, message } = fields;

  // 1) Hard local checks across every visible field. A blocked pattern in
  //    ANY field is an outright reject.
  for (const [field, value] of [["name", name], ["city", city ?? ""], ["message", message]] as const) {
    if (!value) continue;
    for (const re of BLOCKED_PATTERNS) {
      if (re.test(value)) return { verdict: "block", reason: `blocked_pattern:${field}` };
    }
  }

  // 2) Local soft signals → hold for review rather than publish blind.
  const urls = message.match(/https?:\/\/\S+/gi) ?? [];
  if (urls.length > URL_LIMIT) return { verdict: "hold", reason: "too_many_links" };
  // Name should look like a name, not a sentence/handle dump.
  if (name.length > 40 || /https?:\/\//i.test(name)) return { verdict: "hold", reason: "suspicious_name" };

  // 3) AI 3-way classification on the combined visible content. On any API
  //    failure we HOLD (fail safe) rather than allow — a missed review is
  //    cheaper than a public slur.
  try {
    const raw = await generateText(
      `You are a strict content moderator for a PUBLIC sustainability pledge wall where each entry shows a name, city, and a short commitment.

Classify the submission into exactly one word:
  ALLOW  — clearly safe: a genuine eco commitment, normal name/city.
  REVIEW — anything you are even slightly unsure about, off-topic but harmless, ambiguous, or that needs a human glance.
  BLOCK  — hate speech, slurs, sexual content, threats, harassment, doxxing, spam, scams, or gibberish.

Consider ALL fields together. A slur in the NAME is still BLOCK.

NAME: """${name.slice(0, 60)}"""
CITY: """${(city ?? "").slice(0, 60)}"""
COMMITMENT: """${message.slice(0, 400)}"""

Answer with ONLY one word: ALLOW, REVIEW, or BLOCK.`,
    );
    const decision = raw.trim().toUpperCase().replace(/[^A-Z]/g, "");
    if (decision.startsWith("BLOCK")) return { verdict: "block", reason: "ai_blocked" };
    if (decision.startsWith("REVIEW")) return { verdict: "hold", reason: "ai_review" };
    if (decision.startsWith("ALLOW")) return { verdict: "allow" };
    // Unexpected output → hold for safety.
    return { verdict: "hold", reason: "ai_unclear" };
  } catch {
    return { verdict: "hold", reason: "ai_unavailable" };
  }
}
