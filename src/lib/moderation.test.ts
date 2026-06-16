import { describe, expect, it } from "vitest";
import { localModerate } from "./moderation";

describe("localModerate", () => {
  it("accepts normal pledges", () => {
    const r = localModerate("I will cycle to work twice a week for the next 3 months.");
    expect(r.allow).toBe(true);
  });

  it("rejects empty messages", () => {
    expect(localModerate("").allow).toBe(false);
    expect(localModerate("   ").allow).toBe(false);
  });

  it("rejects messages over 280 chars", () => {
    expect(localModerate("a".repeat(281)).allow).toBe(false);
  });

  it("rejects spam patterns", () => {
    expect(localModerate("Buy viagra cheap!").allow).toBe(false);
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

  it("allows messages with one link", () => {
    expect(localModerate("My blog: https://example.com — read more").allow).toBe(true);
  });

  it("rejects messages with multiple links", () => {
    const r = localModerate("Visit https://a.com and also https://b.com and https://c.com");
    expect(r.allow).toBe(false);
    expect(r.reason).toBe("too_many_links");
  });
});
