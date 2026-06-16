// ----------------------------------------------------------------------------
// Localized emission factors. Sources noted inline.
// All factors are kg CO₂-equivalent unless stated.
// ----------------------------------------------------------------------------

import type { DietType, FuelType } from "@prisma/client";

// Grid factors (kg CO₂ / kWh) by country / region.
// India: CEA CO₂ Baseline Database, 2023 — 0.82 kg/kWh
// USA: EPA eGRID 2022 — 0.387 kg/kWh
// EU: EEA 2023 — 0.231 kg/kWh
// Global avg: IEA 2023 — 0.475 kg/kWh
export const GRID_FACTORS: Record<string, number> = {
  IN: 0.82,
  US: 0.387,
  EU: 0.231,
  GB: 0.207,
  CN: 0.581,
  GLOBAL: 0.475,
};

// Per-capita national footprint (tonnes CO₂ / year, 2023 figures).
// Source: Our World in Data / Global Carbon Project.
export const PERCAPITA_TONS_YR: Record<string, number> = {
  IN: 1.9,
  US: 14.4,
  EU: 6.2,
  GB: 4.7,
  CN: 7.8,
  GLOBAL: 4.7,
};

// Vehicle factors (kg CO₂ / km) by fuel.
// Source: DEFRA 2023 + ICCT India report.
export const FUEL_FACTORS: Record<FuelType, number> = {
  PETROL: 0.192,
  DIESEL: 0.171,
  HYBRID: 0.109,
  ELECTRIC: 0.053, // grid-dependent — overridden below per region
  CNG: 0.143,
};

// Diet (kg CO₂ / month).
// Source: Poore & Nemecek (2018), Science.
export const DIET_FACTORS: Record<DietType, number> = {
  VEGAN: 90,
  VEGETARIAN: 130,
  MIXED: 200,
  HEAVY_MEAT: 320,
};

// Flight: average short-haul return = 250 kg CO₂. (atmosfair / DEFRA)
export const FLIGHT_KG = 250;

// Public transport trip avg (urban India bus): 1.2 kg
export const TRANSIT_TRIP_KG = 1.2;

// Shopping lifestyle (kg CO₂ / month) on a 0..5 scale.
// 0 = minimal/secondhand, 5 = heavy retail + electronics
export const SHOPPING_LIFESTYLE_KG = [10, 35, 80, 140, 220, 320];

// ----------------------------------------------------------------------------
// Comparison "aha moment" constants. Each = 1 kg CO₂ ≈ … of these.
// Sources: Our World in Data, IPCC AR6.
// ----------------------------------------------------------------------------

export const COMPARISONS = {
  // Chicken burger: ~2.0 kg CO₂ per quarter-pounder (chicken = 6.9 kg CO₂/kg meat;
  // a 113g patty + bun + cheese works out to ~2.0 kg CO₂e). Source: Poore & Nemecek 2018.
  burger: 2.0,
  smartphoneCharge: 0.0084,  // per full charge
  treesYearAbsorption: 21,   // 1 mature tree absorbs ~21 kg CO₂/yr
  litreOfPetrol: 2.31,
  kmInCar: 0.192,
  longShower10min: 2.6,      // electric water heater
  netflixHour: 0.036,        // SD streaming
  jeans: 33.4,               // 1 new pair (Levi's LCA)
  tShirt: 7,                 // average cotton tee
  zoomCallHour: 0.157,
  acHour: 1.5,
  flightShortHaul: 250,
  meatMeal: 3.5,
  plantMeal: 0.9,
  laptopManufacture: 300,    // embodied
};

export type { ComparisonCard } from "@/types";
import type { ComparisonCard } from "@/types";

export function generateComparisons(monthlyKg: number): ComparisonCard[] {
  const yearKg = monthlyKg * 12;

  return [
    {
      emoji: "🍔",
      label: "Chicken burgers",
      value: Math.round(monthlyKg / COMPARISONS.burger),
      unit: "burgers/mo",
      category: "shocking",
    },
    {
      emoji: "🌳",
      label: "Trees needed to offset",
      value: Math.round(yearKg / COMPARISONS.treesYearAbsorption),
      unit: "mature trees/yr",
      category: "positive",
    },
    {
      emoji: "✈️",
      label: "Mumbai → Delhi flights",
      value: +(monthlyKg / COMPARISONS.flightShortHaul).toFixed(1),
      unit: "flights/mo",
      category: "shocking",
    },
    {
      emoji: "🚗",
      label: "Kilometers driven",
      value: Math.round(monthlyKg / COMPARISONS.kmInCar),
      unit: "km/mo",
      category: "everyday",
    },
    {
      emoji: "📱",
      label: "Smartphone charges",
      value: Math.round(monthlyKg / COMPARISONS.smartphoneCharge),
      unit: "charges/mo",
      category: "everyday",
    },
    {
      emoji: "👖",
      label: "New pairs of jeans",
      value: +(monthlyKg / COMPARISONS.jeans).toFixed(1),
      unit: "jeans/mo",
      category: "everyday",
    },
    {
      emoji: "🛋",
      label: "Netflix hours",
      value: Math.round(monthlyKg / COMPARISONS.netflixHour),
      unit: "hrs/mo",
      category: "everyday",
    },
    {
      emoji: "🚿",
      label: "10-min hot showers",
      value: Math.round(monthlyKg / COMPARISONS.longShower10min),
      unit: "showers/mo",
      category: "everyday",
    },
  ];
}
