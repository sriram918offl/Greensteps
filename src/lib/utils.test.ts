import { describe, expect, it } from "vitest";
import { cn, formatKg, formatNumber, grade } from "./utils";

describe("cn", () => {
  it("merges tailwind classes correctly", () => {
    expect(cn("p-2", "p-4")).toBe("p-4"); // tailwind-merge takes the later
    expect(cn("text-red", "text-emerald")).toBe("text-emerald");
  });
  it("handles falsy values", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });
});

describe("formatKg", () => {
  it("renders kg under 1000", () => {
    expect(formatKg(500.5)).toMatch(/kg/);
  });
  it("renders tons over 1000", () => {
    expect(formatKg(1500)).toMatch(/t$/);
  });
});

describe("formatNumber", () => {
  it("uses k suffix for thousands", () => {
    expect(formatNumber(1500)).toMatch(/k$/);
  });
});

describe("grade", () => {
  it("strict ordering across thresholds", () => {
    expect(grade(100)).toBe("A+");
    expect(grade(250)).toBe("A");
    expect(grade(500)).toBe("B");
    expect(grade(800)).toBe("C");
    expect(grade(1200)).toBe("D");
    expect(grade(2000)).toBe("F");
  });
});
