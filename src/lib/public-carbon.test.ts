import { describe, expect, it } from "vitest";
import { calculatePublic, makeSlug } from "./public-carbon";
import { GRID_FACTORS } from "./factors";

const BASE = {
  countryCode: "IN",
  carKmPerMonth: 0,
  fuelType: "PETROL" as const,
  publicTransportPerWeek: 0,
  flightsPerYear: 0,
  electricityKwhPerMonth: 0,
  acHoursPerDay: 0,
  renewablePct: 0,
  diet: "MIXED" as const,
  shoppingScore: 0,
};

describe("calculatePublic", () => {
  it("zero inputs produce a positive footprint (diet + shopping floor)", () => {
    const r = calculatePublic(BASE);
    expect(r.totalCo2).toBeGreaterThan(0);
  });

  it("Indian grid is roughly 2× European for the same kWh", () => {
    const indianGrid = calculatePublic({ ...BASE, countryCode: "IN", electricityKwhPerMonth: 300 }).energyCo2;
    const euGrid = calculatePublic({ ...BASE, countryCode: "EU", electricityKwhPerMonth: 300 }).energyCo2;
    expect(indianGrid).toBeGreaterThan(euGrid * 2.5);
  });

  it("vsNationalAvg < 1 when total is below the country's monthly per-capita", () => {
    const r = calculatePublic({ ...BASE, countryCode: "IN", diet: "VEGAN" });
    expect(r.vsNationalAvg).toBeLessThan(1);
  });

  it("breakdown values match the four output fields", () => {
    const r = calculatePublic({ ...BASE, carKmPerMonth: 200, electricityKwhPerMonth: 100 });
    expect(r.breakdown[0].value).toBe(r.transportationCo2);
    expect(r.breakdown[1].value).toBe(r.energyCo2);
    expect(r.breakdown[2].value).toBe(r.foodCo2);
    expect(r.breakdown[3].value).toBe(r.shoppingCo2);
  });

  it("higher shopping score → strictly higher shopping CO₂", () => {
    const a = calculatePublic({ ...BASE, shoppingScore: 0 }).shoppingCo2;
    const b = calculatePublic({ ...BASE, shoppingScore: 4 }).shoppingCo2;
    expect(b).toBeGreaterThan(a);
  });

  it("falls back to GLOBAL grid factor for unknown country", () => {
    const r = calculatePublic({ ...BASE, countryCode: "ZZ", electricityKwhPerMonth: 100 });
    // Should produce SOME energy emissions (not zero)
    expect(r.energyCo2).toBeGreaterThan(0);
    // And less than India's (since IN > GLOBAL)
    const inResult = calculatePublic({ ...BASE, countryCode: "IN", electricityKwhPerMonth: 100 });
    expect(r.energyCo2).toBeLessThan(inResult.energyCo2);
  });
});

describe("makeSlug", () => {
  it("returns an 8-character url-safe slug", () => {
    const s = makeSlug();
    expect(s).toHaveLength(8);
    expect(s).toMatch(/^[a-z0-9]+$/);
  });

  it("is reasonably unique across 5000 generations", () => {
    const set = new Set<string>();
    for (let i = 0; i < 5000; i++) set.add(makeSlug());
    expect(set.size).toBeGreaterThan(4990);
  });
});

describe("GRID_FACTORS", () => {
  it("India is the dirtiest, EU is the cleanest among major economies", () => {
    expect(GRID_FACTORS.IN).toBeGreaterThan(GRID_FACTORS.US);
    expect(GRID_FACTORS.US).toBeGreaterThan(GRID_FACTORS.EU);
  });
});
