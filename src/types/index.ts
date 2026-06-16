// ----------------------------------------------------------------------------
// Shared type definitions. Single source of truth for cross-module contracts.
// ----------------------------------------------------------------------------

export type Grade = "A+" | "A" | "B" | "C" | "D" | "F";

export interface Citation {
  index: number;
  documentId: string;
  title: string;
  source: string | null;
  snippet: string;
  score: number;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  monthlySaving: number;
  annualCostSaving: number;
  timeToImpactMonths: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impactKg: number;
  difficulty: "Easy" | "Medium" | "Hard";
  costSaving: number;
  category: "Transportation" | "Energy" | "Food" | "Shopping" | "Lifestyle";
}

export interface BreakdownItem {
  name: string;
  value: number;
  color: string;
}

export interface ComparisonCard {
  emoji: string;
  label: string;
  value: number;
  unit: string;
  category: "shocking" | "everyday" | "positive";
}

export const COUNTRY_CODES = ["IN", "US", "EU", "GB", "CN", "GLOBAL"] as const;
export type CountryCode = (typeof COUNTRY_CODES)[number];
