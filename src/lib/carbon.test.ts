import { describe, expect, it } from "vitest";
import { calculateCarbon, activityCo2, FUEL_FACTORS, DIET_FACTORS } from "./carbon";

const BASELINE = {
  carMilesPerMonth: 0,
  fuelType: "PETROL" as const,
  publicTransportPerWeek: 0,
  flightsPerMonth: 0,
  electricityKwhPerMonth: 0,
  acHoursPerDay: 0,
  renewablePct: 0,
  diet: "MIXED" as const,
  clothingPerMonth: 0,
  electronicsPerMonth: 0,
  onlineOrdersPerMonth: 0,
};

describe("calculateCarbon", () => {
  it("returns the diet floor when all other inputs are zero", () => {
    const r = calculateCarbon(BASELINE);
    expect(r.transportationCo2).toBe(0);
    expect(r.energyCo2).toBe(0);
    expect(r.shoppingCo2).toBe(0);
    expect(r.foodCo2).toBe(DIET_FACTORS.MIXED);
    expect(r.totalCo2).toBe(DIET_FACTORS.MIXED);
  });

  it("scales linearly with car mileage", () => {
    const a = calculateCarbon({ ...BASELINE, carMilesPerMonth: 100 });
    const b = calculateCarbon({ ...BASELINE, carMilesPerMonth: 200 });
    expect(b.transportationCo2).toBeCloseTo(a.transportationCo2 * 2, 1);
  });

  it("applies fuel factor: electric << petrol", () => {
    const petrol = calculateCarbon({ ...BASELINE, carMilesPerMonth: 500, fuelType: "PETROL" });
    const ev = calculateCarbon({ ...BASELINE, carMilesPerMonth: 500, fuelType: "ELECTRIC" });
    expect(ev.transportationCo2).toBeLessThan(petrol.transportationCo2);
    expect(ev.transportationCo2 / petrol.transportationCo2).toBeCloseTo(
      FUEL_FACTORS.ELECTRIC / FUEL_FACTORS.PETROL,
      2,
    );
  });

  it("zero renewable = full grid emissions; 100% renewable = zero electricity emissions", () => {
    const dirty = calculateCarbon({ ...BASELINE, electricityKwhPerMonth: 500, renewablePct: 0 });
    const clean = calculateCarbon({ ...BASELINE, electricityKwhPerMonth: 500, renewablePct: 100 });
    expect(clean.energyCo2).toBe(0);
    expect(dirty.energyCo2).toBeGreaterThan(0);
  });

  it("diet ordering: vegan < vegetarian < mixed < heavy meat", () => {
    const v = calculateCarbon({ ...BASELINE, diet: "VEGAN" }).foodCo2;
    const veg = calculateCarbon({ ...BASELINE, diet: "VEGETARIAN" }).foodCo2;
    const mix = calculateCarbon({ ...BASELINE, diet: "MIXED" }).foodCo2;
    const meat = calculateCarbon({ ...BASELINE, diet: "HEAVY_MEAT" }).foodCo2;
    expect(v).toBeLessThan(veg);
    expect(veg).toBeLessThan(mix);
    expect(mix).toBeLessThan(meat);
  });

  it("grade thresholds — boundaries are exclusive on the upper side", () => {
    // < 200 → A+
    const apl = calculateCarbon(BASELINE); // food only = 200 → not A+, exactly at threshold
    expect(apl.grade).toBe("A");
    const lower = calculateCarbon({ ...BASELINE, diet: "VEGAN" }); // 90 → A+
    expect(lower.grade).toBe("A+");
  });

  it("breakdown sums to total (allowing rounding tolerance)", () => {
    const r = calculateCarbon({
      ...BASELINE,
      carMilesPerMonth: 300,
      electricityKwhPerMonth: 250,
      clothingPerMonth: 2,
    });
    const sum =
      r.transportationCo2 + r.energyCo2 + r.foodCo2 + r.shoppingCo2;
    expect(sum).toBeCloseTo(r.totalCo2, 0);
  });

  it("breakdown has exactly four entries with correct names", () => {
    const r = calculateCarbon(BASELINE);
    expect(r.breakdown).toHaveLength(4);
    expect(r.breakdown.map((b) => b.name)).toEqual(["Transportation", "Energy", "Food", "Shopping"]);
  });
});

describe("activityCo2", () => {
  it("returns zero for cycling", () => {
    expect(activityCo2("TRANSPORTATION", "bicycle", 10)).toBe(0);
  });
  it("scales with quantity", () => {
    expect(activityCo2("TRANSPORTATION", "car", 100)).toBeCloseTo(19.2, 0);
  });
  it("food: beef >> vegan", () => {
    const beef = activityCo2("FOOD", "beef", 1);
    const vegan = activityCo2("FOOD", "vegan", 1);
    expect(beef).toBeGreaterThan(vegan * 10);
  });
  it("falls back to defaults for unknown types", () => {
    expect(activityCo2("ENERGY", "unknown", 100)).toBeGreaterThan(0);
  });
});
