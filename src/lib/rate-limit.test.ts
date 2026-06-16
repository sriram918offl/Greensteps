import { describe, expect, it, beforeEach } from "vitest";
import { rateLimit, RATE_LIMITS } from "./rate-limit";

beforeEach(() => {
  // reset the global store between tests
  (globalThis as Record<string, unknown>).__greensteps_rl_store = new Map();
});

describe("rateLimit", () => {
  it("allows up to the configured limit", async () => {
    for (let i = 0; i < RATE_LIMITS.chat.limit; i++) {
      const r = await rateLimit("ip:test", RATE_LIMITS.chat);
      expect(r.success).toBe(true);
    }
  });

  it("blocks the request immediately after the limit is reached", async () => {
    for (let i = 0; i < RATE_LIMITS.chat.limit; i++) {
      await rateLimit("ip:test", RATE_LIMITS.chat);
    }
    const r = await rateLimit("ip:test", RATE_LIMITS.chat);
    expect(r.success).toBe(false);
    expect(r.remaining).toBe(0);
  });

  it("isolates buckets by identifier", async () => {
    for (let i = 0; i < RATE_LIMITS.chat.limit; i++) {
      await rateLimit("ip:a", RATE_LIMITS.chat);
    }
    const r = await rateLimit("ip:b", RATE_LIMITS.chat);
    expect(r.success).toBe(true);
  });

  it("isolates buckets by bucket name (chat vs pledge)", async () => {
    for (let i = 0; i < RATE_LIMITS.chat.limit; i++) {
      await rateLimit("ip:c", RATE_LIMITS.chat);
    }
    const pledge = await rateLimit("ip:c", RATE_LIMITS.pledge);
    expect(pledge.success).toBe(true);
  });

  it("computes remaining count correctly", async () => {
    const r1 = await rateLimit("ip:d", RATE_LIMITS.chat);
    expect(r1.remaining).toBe(RATE_LIMITS.chat.limit - 1);
    const r2 = await rateLimit("ip:d", RATE_LIMITS.chat);
    expect(r2.remaining).toBe(RATE_LIMITS.chat.limit - 2);
  });
});
