import { describe, expect, it, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

// Public route: auth() may return a null user. Gemini is mocked; the rate
// limiter and local moderation run for real.
vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn(async () => ({ userId: null })) }));
vi.mock("@/lib/gemini", () => ({ generateText: vi.fn() }));

import { POST } from "./route";
import { generateText } from "@/lib/gemini";

const mockGen = vi.mocked(generateText);

beforeEach(() => {
  vi.clearAllMocks();
  // Clear the limiter's captured store in place (see pledge actions test).
  (globalThis.__greensteps_rl_store as Map<string, unknown> | undefined)?.clear();
});

// Minimal request stub — the handler only reads req.json() and req.headers.
function stubReq(body: unknown, ip = "9.9.9.9"): NextRequest {
  return {
    headers: new Headers({ "x-real-ip": ip, "content-type": "application/json" }),
    json: async () => body,
  } as unknown as NextRequest;
}

describe("POST /api/simulate", () => {
  it("400s when the prompt is missing", async () => {
    const res = await POST(stubReq({}));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "Missing prompt" });
    expect(mockGen).not.toHaveBeenCalled();
  });

  it("413s when the prompt is too long", async () => {
    const res = await POST(stubReq({ prompt: "a".repeat(501) }));
    expect(res.status).toBe(413);
    expect(mockGen).not.toHaveBeenCalled();
  });

  it("400s when local moderation blocks the prompt", async () => {
    const res = await POST(stubReq({ prompt: "buy viagra cheap" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "Prompt blocked" });
    expect(mockGen).not.toHaveBeenCalled();
  });

  it("returns the parsed scenario JSON on success", async () => {
    mockGen.mockResolvedValue(
      '```json\n{"title":"Go vegetarian","description":"d","monthlySaving":40,"annualCostSaving":120,"timeToImpactMonths":1}\n```',
    );
    const res = await POST(stubReq({ prompt: "what if I go vegetarian" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ title: "Go vegetarian", monthlySaving: 40 });
  });

  it("degrades to a fallback scenario when Gemini fails", async () => {
    mockGen.mockRejectedValue(new Error("model down"));
    const res = await POST(stubReq({ prompt: "what if I bike everywhere" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ title: "Custom scenario" });
  });

  it("429s once the per-minute limit is exceeded", async () => {
    mockGen.mockResolvedValue('{"title":"x","monthlySaving":1,"annualCostSaving":1,"timeToImpactMonths":1}');
    // RATE_LIMITS.simulate = 20/min from one IP.
    let last = await POST(stubReq({ prompt: "tip" }, "1.1.1.1"));
    for (let i = 0; i < 25; i++) {
      last = await POST(stubReq({ prompt: "tip" }, "1.1.1.1"));
    }
    expect(last.status).toBe(429);
  });
});
