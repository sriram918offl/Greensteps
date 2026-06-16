// ----------------------------------------------------------------------------
// AI Sustainability Coach — generates personalized recommendations from a
// carbon profile. Falls back to deterministic heuristics if Gemini is offline.
// ----------------------------------------------------------------------------

import type { CarbonResult, CarbonInput } from "./carbon";
import { FUEL_FACTORS } from "./carbon";
import { generateText, SUSTAINABILITY_COACH_SYSTEM } from "./gemini";

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impactKg: number; // monthly kg CO₂ saved
  difficulty: "Easy" | "Medium" | "Hard";
  costSaving: number; // $ / month
  category: "Transportation" | "Energy" | "Food" | "Shopping" | "Lifestyle";
}

export function heuristicRecommendations(
  input: CarbonInput,
  result: CarbonResult,
): Recommendation[] {
  const recs: Recommendation[] = [];

  if (result.transportationCo2 > 200) {
    const carCo2 = input.carMilesPerMonth * 1.609 * FUEL_FACTORS[input.fuelType];
    recs.push({
      id: "transit",
      title: "Switch 2 weekly car trips to public transport",
      description:
        "Replacing 2 short commutes per week with bus or train could cut transportation emissions noticeably.",
      impactKg: Math.round(carCo2 * 0.15),
      difficulty: "Easy",
      costSaving: 60,
      category: "Transportation",
    });
  }

  if (input.flightsPerMonth >= 1) {
    recs.push({
      id: "flights",
      title: "Replace one flight per quarter with rail or video",
      description: "Even one fewer short-haul flight per quarter can save ~80 kg CO₂.",
      impactKg: 80,
      difficulty: "Medium",
      costSaving: 120,
      category: "Transportation",
    });
  }

  if (input.acHoursPerDay > 4) {
    recs.push({
      id: "ac",
      title: "Reduce AC usage by 1 hour daily",
      description: "Set AC to 24°C and cut 1 hour off your daily run-time.",
      impactKg: Math.round(1 * 30 * 1.5),
      difficulty: "Easy",
      costSaving: 18,
      category: "Energy",
    });
  }

  if (input.renewablePct < 50) {
    recs.push({
      id: "renewable",
      title: "Switch to a green energy tariff",
      description: "Most utilities offer a 100% renewable plan at little or no premium.",
      impactKg: Math.round(input.electricityKwhPerMonth * 0.4 * 0.7),
      difficulty: "Easy",
      costSaving: 0,
      category: "Energy",
    });
  }

  if (input.diet === "HEAVY_MEAT" || input.diet === "MIXED") {
    recs.push({
      id: "diet",
      title: "Try 2 plant-based dinners per week",
      description: "Swapping just 2 meat dinners weekly can save ~25 kg CO₂/month.",
      impactKg: 25,
      difficulty: "Medium",
      costSaving: 40,
      category: "Food",
    });
  }

  if (input.clothingPerMonth >= 3) {
    recs.push({
      id: "clothing",
      title: "Buy second-hand or rent for occasions",
      description: "Cutting new clothing purchases in half could save ~15 kg CO₂/month.",
      impactKg: 15,
      difficulty: "Easy",
      costSaving: 30,
      category: "Shopping",
    });
  }

  if (input.onlineOrdersPerMonth >= 6) {
    recs.push({
      id: "bundle",
      title: "Bundle online orders into one shipment",
      description: "Consolidating deliveries cuts packaging and last-mile emissions.",
      impactKg: 4,
      difficulty: "Easy",
      costSaving: 0,
      category: "Shopping",
    });
  }

  return recs.sort((a, b) => b.impactKg - a.impactKg).slice(0, 6);
}

export async function aiCoachInsights(input: CarbonInput, result: CarbonResult): Promise<string> {
  try {
    const prompt = `Here is a user's monthly carbon profile (kg CO₂):
- Transportation: ${result.transportationCo2}
- Energy: ${result.energyCo2}
- Food: ${result.foodCo2}
- Shopping: ${result.shoppingCo2}
- Total: ${result.totalCo2} (grade ${result.grade})

Diet: ${input.diet}. Fuel: ${input.fuelType}. AC hours/day: ${input.acHoursPerDay}. Renewable %: ${input.renewablePct}.

Write a 3-sentence personalized insight: 1 honest assessment, 1 specific quantified suggestion, 1 motivational nudge.`;
    return await generateText(prompt, SUSTAINABILITY_COACH_SYSTEM);
  } catch {
    return `Your monthly footprint of ${result.totalCo2} kg CO₂ sits at grade ${result.grade}. Focus first on your largest category — small consistent changes there add up faster than perfect ones elsewhere. Every kilo counts.`;
  }
}
