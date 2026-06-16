// ----------------------------------------------------------------------------
// Localized carbon engine for the public /discover flow.
// Simpler inputs than the gated calculator. Localized by countryCode/citySlug.
// ----------------------------------------------------------------------------

import type { DietType, FuelType } from "@prisma/client";
import {
  GRID_FACTORS,
  FUEL_FACTORS,
  DIET_FACTORS,
  FLIGHT_KG,
  TRANSIT_TRIP_KG,
  SHOPPING_LIFESTYLE_KG,
} from "./factors";

export interface PublicCarbonInput {
  countryCode: string;          // IN, US, EU...
  carKmPerMonth: number;
  fuelType: FuelType;
  publicTransportPerWeek: number;
  flightsPerYear: number;
  electricityKwhPerMonth: number;
  acHoursPerDay: number;
  renewablePct: number;
  diet: DietType;
  shoppingScore: number;        // 0..5
}

export interface PublicCarbonResult {
  transportationCo2: number;
  energyCo2: number;
  foodCo2: number;
  shoppingCo2: number;
  totalCo2: number;
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  vsNationalAvg: number;        // ratio: 1.0 = same as avg, 0.5 = half, 2.0 = double
  breakdown: Array<{ name: string; value: number; color: string }>;
}

export function calculatePublic(input: PublicCarbonInput): PublicCarbonResult {
  const gridFactor = GRID_FACTORS[input.countryCode] ?? GRID_FACTORS.GLOBAL;

  // Transportation
  const carCo2 = input.carKmPerMonth * FUEL_FACTORS[input.fuelType];
  const ptCo2 = input.publicTransportPerWeek * 4.3 * TRANSIT_TRIP_KG;
  const flightCo2 = (input.flightsPerYear / 12) * FLIGHT_KG;
  const transportationCo2 = carCo2 + ptCo2 + flightCo2;

  // Energy — uses real grid factor
  const renewableFactor = 1 - Math.min(100, Math.max(0, input.renewablePct)) / 100;
  const elecCo2 = input.electricityKwhPerMonth * gridFactor * renewableFactor;
  const acCo2 = input.acHoursPerDay * 30 * 1.5 * (gridFactor / 0.4) * renewableFactor;
  const energyCo2 = elecCo2 + acCo2;

  // Food
  const foodCo2 = DIET_FACTORS[input.diet];

  // Shopping
  const score = Math.max(0, Math.min(5, Math.round(input.shoppingScore)));
  const shoppingCo2 = SHOPPING_LIFESTYLE_KG[score];

  const totalCo2 = transportationCo2 + energyCo2 + foodCo2 + shoppingCo2;

  // Compare to national avg
  const nationalMonthlyKg = ({
    IN: 1.9, US: 14.4, EU: 6.2, GB: 4.7, CN: 7.8, GLOBAL: 4.7,
  }[input.countryCode] ?? 4.7) * 1000 / 12;

  return {
    transportationCo2: r(transportationCo2),
    energyCo2: r(energyCo2),
    foodCo2: r(foodCo2),
    shoppingCo2: r(shoppingCo2),
    totalCo2: r(totalCo2),
    grade: gradeFor(totalCo2),
    vsNationalAvg: +(totalCo2 / nationalMonthlyKg).toFixed(2),
    breakdown: [
      { name: "Transportation", value: r(transportationCo2), color: "#10b981" },
      { name: "Energy", value: r(energyCo2), color: "#3b82f6" },
      { name: "Food", value: r(foodCo2), color: "#f59e0b" },
      { name: "Shopping", value: r(shoppingCo2), color: "#ef4444" },
    ],
  };
}

function r(n: number) { return Math.round(n * 10) / 10; }

function gradeFor(total: number): PublicCarbonResult["grade"] {
  if (total < 200) return "A+";
  if (total < 400) return "A";
  if (total < 700) return "B";
  if (total < 1000) return "C";
  if (total < 1500) return "D";
  return "F";
}

// Shareable slug generator: 8 url-safe chars
export function makeSlug() {
  const alphabet = "23456789abcdefghjkmnpqrstuvwxyz";
  let out = "";
  for (let i = 0; i < 8; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}
