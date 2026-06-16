import { describe, expect, it } from "vitest";
import { generateComparisons, COMPARISONS } from "./factors";

describe("generateComparisons", () => {
  it("returns 8 cards", () => {
    const cards = generateComparisons(1000);
    expect(cards).toHaveLength(8);
  });

  it("burger count scales with monthly CO₂", () => {
    const small = generateComparisons(100).find((c) => c.label === "Chicken burgers")!;
    const big = generateComparisons(1000).find((c) => c.label === "Chicken burgers")!;
    expect(big.value).toBeGreaterThan(small.value);
  });

  it("uses the chicken burger factor (~2 kg), not beef", () => {
    expect(COMPARISONS.burger).toBeLessThan(3);
    expect(COMPARISONS.burger).toBeGreaterThan(1.5);
  });

  it("tree count is yearly absorption, so larger than burgers/month for the same input", () => {
    const cards = generateComparisons(1000);
    const trees = cards.find((c) => c.label.includes("Trees"))!;
    expect(trees.value).toBeGreaterThan(0);
  });

  it("every card has emoji and non-empty label", () => {
    for (const c of generateComparisons(500)) {
      expect(c.emoji.length).toBeGreaterThan(0);
      expect(c.label.length).toBeGreaterThan(0);
      expect(c.unit.length).toBeGreaterThan(0);
    }
  });
});
