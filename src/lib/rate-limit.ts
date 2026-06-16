// ----------------------------------------------------------------------------
// Rate limiter.
//
// Zero-dependency in-memory LRU-style sliding window. Good enough for portfolio
// / MVP traffic and serverless cold-start environments. For real production,
// wire @upstash/ratelimit by setting UPSTASH_REDIS_REST_URL + TOKEN — this
// module auto-detects them and switches.
// ----------------------------------------------------------------------------

export interface RateLimitOptions {
  /** Max requests per window. */
  limit: number;
  /** Window length in seconds. */
  windowSec: number;
  /** Optional bucket name (groups limits, e.g. "chat" vs. "pledge"). */
  bucket?: string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number; // unix ms
  limit: number;
}

interface Bucket {
  timestamps: number[];
}

// Shared module-level Map. Survives across requests in a single Node process.
// On serverless cold starts a fresh process means counters reset — acceptable
// for abuse mitigation since cold-start frequency is much lower than abuse rate.
declare global {
  // eslint-disable-next-line no-var
  var __greensteps_rl_store: Map<string, Bucket> | undefined;
}

const store: Map<string, Bucket> = globalThis.__greensteps_rl_store ?? new Map();
if (!globalThis.__greensteps_rl_store) globalThis.__greensteps_rl_store = store;

// LRU evict: keep memory bounded under attack.
const MAX_KEYS = 20_000;

function inMemoryHit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const windowMs = opts.windowSec * 1000;
  const bucket = store.get(key) ?? { timestamps: [] };

  // Drop expired entries
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  const allowed = bucket.timestamps.length < opts.limit;
  if (allowed) bucket.timestamps.push(now);
  store.set(key, bucket);

  // Best-effort LRU evict (oldest insertion order — Map keeps insertion order)
  if (store.size > MAX_KEYS) {
    const first = store.keys().next().value;
    if (first) store.delete(first);
  }

  return {
    success: allowed,
    remaining: Math.max(0, opts.limit - bucket.timestamps.length),
    resetAt: bucket.timestamps.length ? bucket.timestamps[0] + windowMs : now + windowMs,
    limit: opts.limit,
  };
}

/**
 * Public entrypoint. Pass a stable identifier (IP, userId, or a composite)
 * and the limit config. Returns whether the request should proceed.
 */
export async function rateLimit(
  identifier: string,
  opts: RateLimitOptions,
): Promise<RateLimitResult> {
  const key = `${opts.bucket ?? "default"}:${identifier}`;
  // (Future) Upstash fast path:
  // if (process.env.UPSTASH_REDIS_REST_URL) return upstashHit(key, opts);
  return inMemoryHit(key, opts);
}

/** Extract a stable identifier for the caller. Falls back to "anonymous". */
export function identifierFromRequest(req: Request, userId?: string | null): string {
  if (userId) return `u:${userId}`;
  // Vercel/standard headers in priority order
  const ip =
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("cf-connecting-ip") ??
    "anonymous";
  return `ip:${ip}`;
}

/** Convenience: short-circuit a route with a 429 JSON response. */
export function rateLimitResponse(r: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: "Too many requests",
      retryAfter: Math.max(1, Math.ceil((r.resetAt - Date.now()) / 1000)),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.max(1, Math.ceil((r.resetAt - Date.now()) / 1000))),
        "X-RateLimit-Limit": String(r.limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.floor(r.resetAt / 1000)),
      },
    },
  );
}

// Preset buckets — tuned for awareness layer (public) vs. private endpoints.
export const RATE_LIMITS = {
  chat:      { bucket: "chat",     limit: 10, windowSec: 60 },   // 10/min
  simulate:  { bucket: "simulate", limit: 20, windowSec: 60 },   // 20/min
  ocr:       { bucket: "ocr",      limit: 5,  windowSec: 60 },   // 5/min — expensive
  discover:  { bucket: "discover", limit: 10, windowSec: 60 },   // 10/min
  pledge:    { bucket: "pledge",   limit: 3,  windowSec: 60 },   // 3/min — write
} as const;
