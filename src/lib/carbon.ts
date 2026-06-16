// ----------------------------------------------------------------------------
// Carbon emission engine
// All factors are approximate, sourced from IPCC, EPA, and DEFRA averages.
// Returned values are kg CO₂-equivalent per month unless stated otherwise.
// ----------------------------------------------------------------------------

import type { DietType, FuelType } from "@prisma/client";

export const FUEL_FACTORS: Record<FuelType, number> = {
  PETROL: 0.192, // kg CO₂ / km
  DIESEL: 0.171,
  HYBRID: 0.109,
  ELECTRIC: 0.053,
  CNG: 0.143,
};

export const DIET_FACTORS: Record<DietType, number> = {
  VEGAN: 90,
  VEGETARIAN: 130,
  MIXED: 200,
  HEAVY_MEAT: 320,
};

export const FACTORS = {
  publicTransportPerTrip: 1.2, // kg CO₂ per trip
  flightShortHaul: 250, // kg CO₂ per flight
  electricityPerKwh: 0.4, // kg CO₂ / kWh
  acPerHour: 1.5, // kg CO₂ / hour
  clothingPerItem: 10, // kg CO₂ / item
  electronicsPerItem: 50, // kg CO₂ / item
  onlineOrder: 0.5, // kg CO₂ / order
};

export interface CarbonInput {
  carMilesPerMonth: number;
  fuelType: FuelType;
  publicTransportPerWeek: number;
  flightsPerMonth: number;
  electricityKwhPerMonth: number;
  acHoursPerDay: number;
  renewablePct: number; // 0–100
  diet: DietType;
  clothingPerMonth: number;
  electronicsPerMonth: number;
  onlineOrdersPerMonth: number;
}

export interface CarbonResult {
  transportationCo2: number;
  energyCo2: number;
  foodCo2: number;
  shoppingCo2: number;
  totalCo2: number;
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  breakdown: Array<{ name: string; value: number; color: string }>;
}

export function calculateCarbon(input: CarbonInput): CarbonResult {
  // Transportation
  // miles → km (* 1.609)
  const km = input.carMilesPerMonth * 1.609;
  const carCo2 = km * FUEL_FACTORS[input.fuelType];
  const ptCo2 = input.publicTransportPerWeek * 4.3 * FACTORS.publicTransportPerTrip;
  const flightCo2 = input.flightsPerMonth * FACTORS.flightShortHaul;
  const transportationCo2 = carCo2 + ptCo2 + flightCo2;

  // Energy
  const renewableFactor = 1 - Math.min(Math.max(input.renewablePct, 0), 100) / 100;
  const electricityCo2 = input.electricityKwhPerMonth * FACTORS.electricityPerKwh * renewableFactor;
  const acCo2 = input.acHoursPerDay * 30 * FACTORS.acPerHour * renewableFactor;
  const energyCo2 = electricityCo2 + acCo2;

  // Food
  const foodCo2 = DIET_FACTORS[input.diet];

  // Shopping
  const shoppingCo2 =
    input.clothingPerMonth * FACTORS.clothingPerItem +
    input.electronicsPerMonth * FACTORS.electronicsPerItem +
    input.onlineOrdersPerMonth * FACTORS.onlineOrder;

  const totalCo2 = transportationCo2 + energyCo2 + foodCo2 + shoppingCo2;

  return {
    transportationCo2: round(transportationCo2),
    energyCo2: round(energyCo2),
    foodCo2: round(foodCo2),
    shoppingCo2: round(shoppingCo2),
    totalCo2: round(totalCo2),
    grade: gradeFor(totalCo2),
    breakdown: [
      { name: "Transportation", value: round(transportationCo2), color: "#10b981" },
      { name: "Energy", value: round(energyCo2), color: "#3b82f6" },
      { name: "Food", value: round(foodCo2), color: "#f59e0b" },
      { name: "Shopping", value: round(shoppingCo2), color: "#ef4444" },
    ],
  };
}

function round(n: number) {
  return Math.round(n * 10) / 10;
}

function gradeFor(total: number): CarbonResult["grade"] {
  if (total < 200) return "A+";
  if (total < 400) return "A";
  if (total < 700) return "B";
  if (total < 1000) return "C";
  if (total < 1500) return "D";
  return "F";
}

// ---------- Activity emission helpers ----------

export function activityCo2(
  category: "TRANSPORTATION" | "ENERGY" | "FOOD" | "SHOPPING",
  type: string,
  quantity: number,
): number {
  switch (category) {
    case "TRANSPORTATION": {
      const map: Record<string, number> = {
        car: 0.192, // per km
        bus: 0.105,
        train: 0.041,
        bicycle: 0,
        flight: 250, // per flight
      };
      return round((map[type] ?? 0.15) * quantity);
    }
    case "ENERGY": {
      const map: Record<string, number> = {
        electricity: 0.4, // kg/kWh
        gas: 2.0, // kg/m³
      };
      return round((map[type] ?? 0.4) * quantity);
    }
    case "FOOD": {
      const map: Record<string, number> = {
        beef: 27,
        chicken: 6.9,
        fish: 6.1,
        vegetarian: 2,
        vegan: 1,
      };
      return round((map[type] ?? 3) * quantity);
    }
    case "SHOPPING": {
      const map: Record<string, number> = {
        clothing: 10,
        electronics: 50,
        groceries: 1.5,
      };
      return round((map[type] ?? 5) * quantity);
    }
  }
}

// ---------- Scenario simulation ----------

export interface Scenario {
  id: string;
  title: string;
  description: string;
  monthlySaving: number; // kg CO₂
  annualCostSaving: number; // $
  timeToImpactMonths: number;
}

export const PRESET_SCENARIOS: Scenario[] = [
  {
    id: "ev",
    title: "Buy an electric vehicle",
    description: "Switch from a gasoline car to an EV charged on a typical grid.",
    monthlySaving: 95,
    annualCostSaving: 1400,
    timeToImpactMonths: 1,
  },
  {
    id: "solar",
    title: "Install rooftop solar",
    description: "Cover ~80% of home electricity with rooftop solar.",
    monthlySaving: 180,
    annualCostSaving: 1800,
    timeToImpactMonths: 3,
  },
  {
    id: "diet",
    title: "Reduce meat consumption by 50%",
    description: "Swap half your meat meals for plant-based alternatives.",
    monthlySaving: 60,
    annualCostSaving: 600,
    timeToImpactMonths: 1,
  },
  {
    id: "transit",
    title: "Take public transit twice a week",
    description: "Replace 2 weekly car commutes with bus/train.",
    monthlySaving: 18,
    annualCostSaving: 240,
    timeToImpactMonths: 1,
  },
  {
    id: "led",
    title: "Switch all lights to LED",
    description: "Replace incandescent bulbs with LEDs throughout the home.",
    monthlySaving: 12,
    annualCostSaving: 130,
    timeToImpactMonths: 1,
  },
];
