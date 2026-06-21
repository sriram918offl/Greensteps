import { describe, expect, it, vi, beforeEach } from "vitest";

// moderatePledge + aiModerate call Gemini via ./gemini. Mock it so the AI
// tier is deterministic and no network/key is required.
vi.mock("./gemini", () => ({ generateText: vi.fn() }));

import { localModerate, aiModerate, moderatePledge } from "./moderation";
import { generateText } from "./gemini";

const mockGen = vi.mocked(generateText);

beforeEach(() => {
  mockGen.mockReset();
});

describe("localModerate", () => {
  it("accepts normal pledges", () => {
    const r = localModerate("I will cycle to work twice a week for the next 3 months.");
    expect(r.allow).toBe(true);
  });

  it("rejects empty messages", () => {
    expect(localModerate("").allow).toBe(false);
    expect(localModerate("   ").allow).toBe(false);
    expect(localModerate("").reason).toBe("empty");
  });

  it("rejects messages over 280 chars", () => {
    const r = localModerate("a".repeat(281));
    expect(r.allow).toBe(false);
    expect(r.reason).toBe("too_long");
  });

  it("accepts a message exactly at the 280-char boundary", () => {
    // 280 lowercase letters: long, but not a pattern and not all-caps.
    expect(localModerate("a".repeat(280)).allow).toBe(true);
  });

  it("rejects spam patterns", () => {
    expect(localModerate("Buy viagra cheap!").allow).toBe(false);
  });

  it("rejects shady-TLD links even when only one", () => {
    const r = localModerate("Free prize here https://totally-legit.tk/win");
    expect(r.allow).toBe(false);
    expect(r.reason).toBe("blocked_pattern");
    expect(r.severity).toBe("high");
  });

  it("rejects messaging-handle + number harvesting", () => {
    expect(localModerate("dm me on whatsapp +1234567").allow).toBe(false);
  });

  it("rejects clearly hateful content", () => {
    const r = localModerate("kys you idiot");
    expect(r.allow).toBe(false);
    expect(r.severity).toBe("high");
  });

  it("rejects all-caps shouting beyond threshold", () => {
    const r = localModerate("WE ARE ALL DOOMED FOREVER UNLESS PEOPLE WAKE UP NOW");
    expect(r.allow).toBe(false);
    expect(r.reason).toBe("all_caps");
  });

  it("allows short all-caps slogans under the letter threshold", () => {
    expect(localModerate("GO GREEN").allow).toBe(true);
  });

  it("allows messages with one link", () => {
    expect(localModerate("My blog: https://example.com — read more").allow).toBe(true);
  });

  it("rejects messages with multiple links", () => {
    const r = localModerate("Visit https://a.com and also https://b.com and https://c.com");
    expect(r.allow).toBe(false);
    expect(r.reason).toBe("too_many_links");
  });
});

describe("moderatePledge — hard local checks (no AI call)", () => {
  it("blocks a slur in the name field outright", async () => {
    const r = await moderatePledge({ name: "kys loser", message: "I will recycle more often" });
    expect(r.verdict).toBe("block");
    expect(r.reason).toBe("blocked_pattern:name");
    expect(mockGen).not.toHaveBeenCalled();
  });

  it("blocks a spam pattern in the message field outright", async () => {
    const r = await moderatePledge({ name: "Sam", message: "buy viagra now cheap deal" });
    expect(r.verdict).toBe("block");
    expect(mockGen).not.toHaveBeenCalled();
  });

  it("holds when the message carries too many links", async () => {
    const r = await moderatePledge({
      name: "Sam",
      message: "see https://a.com and https://b.com for tips",
    });
    expect(r.verdict).toBe("hold");
    expect(r.reason).toBe("too_many_links");
    expect(mockGen).not.toHaveBeenCalled();
  });

  it("holds when the name looks suspicious (too long / a URL)", async () => {
    const r = await moderatePledge({
      name: "x".repeat(50),
      message: "I will compost my food waste",
    });
    expect(r.verdict).toBe("hold");
    expect(r.reason).toBe("suspicious_name");
    expect(mockGen).not.toHaveBeenCalled();
  });
});

describe("moderatePledge — AI tier", () => {
  const clean = { name: "Asha", city: "Delhi", message: "I will switch to LED bulbs this month" };

  it("allows when the classifier returns ALLOW", async () => {
    mockGen.mockResolvedValue("ALLOW");
    expect((await moderatePledge(clean)).verdict).toBe("allow");
    expect(mockGen).toHaveBeenCalledOnce();
  });

  it("holds when the classifier returns REVIEW", async () => {
    mockGen.mockResolvedValue("REVIEW");
    const r = await moderatePledge(clean);
    expect(r.verdict).toBe("hold");
    expect(r.reason).toBe("ai_review");
  });

  it("blocks when the classifier returns BLOCK", async () => {
    mockGen.mockResolvedValue("BLOCK");
    const r = await moderatePledge(clean);
    expect(r.verdict).toBe("block");
    expect(r.reason).toBe("ai_blocked");
  });

  it("holds on unexpected classifier output", async () => {
    mockGen.mockResolvedValue("maybe?");
    const r = await moderatePledge(clean);
    expect(r.verdict).toBe("hold");
    expect(r.reason).toBe("ai_unclear");
  });

  it("fails safe to hold when the classifier throws", async () => {
    mockGen.mockRejectedValue(new Error("gemini down"));
    const r = await moderatePledge(clean);
    expect(r.verdict).toBe("hold");
    expect(r.reason).toBe("ai_unavailable");
  });
});

describe("aiModerate", () => {
  it("short-circuits without calling the model when local fails", async () => {
    const r = await aiModerate("");
    expect(r.allow).toBe(false);
    expect(mockGen).not.toHaveBeenCalled();
  });

  it("blocks when the model returns BLOCK", async () => {
    mockGen.mockResolvedValue("BLOCK");
    const r = await aiModerate("some borderline opinion about a company");
    expect(r.allow).toBe(false);
    expect(r.reason).toBe("ai_blocked");
  });

  it("allows when the model returns ALLOW", async () => {
    mockGen.mockResolvedValue("ALLOW");
    expect((await aiModerate("a strong but civil climate stance")).allow).toBe(true);
  });

  it("fails open to allow when the model throws (local already cleared)", async () => {
    mockGen.mockRejectedValue(new Error("gemini down"));
    expect((await aiModerate("a perfectly normal message")).allow).toBe(true);
  });
});
