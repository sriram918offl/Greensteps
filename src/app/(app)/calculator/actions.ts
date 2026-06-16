"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateCarbon } from "@/lib/carbon";
import { awardBadgesIfEligible } from "@/lib/badges";

const Schema = z.object({
  carMilesPerMonth: z.coerce.number().min(0).max(20000),
  fuelType: z.enum(["PETROL", "DIESEL", "HYBRID", "ELECTRIC", "CNG"]),
  publicTransportPerWeek: z.coerce.number().min(0).max(100),
  flightsPerMonth: z.coerce.number().int().min(0).max(50),
  electricityKwhPerMonth: z.coerce.number().min(0).max(20000),
  acHoursPerDay: z.coerce.number().min(0).max(24),
  renewablePct: z.coerce.number().min(0).max(100),
  diet: z.enum(["VEGAN", "VEGETARIAN", "MIXED", "HEAVY_MEAT"]),
  clothingPerMonth: z.coerce.number().int().min(0).max(100),
  electronicsPerMonth: z.coerce.number().int().min(0).max(50),
  onlineOrdersPerMonth: z.coerce.number().int().min(0).max(200),
});

export async function saveCalculation(input: z.infer<typeof Schema>) {
  const user = await requireUser();
  const parsed = Schema.parse(input);
  const result = calculateCarbon(parsed);

  const previous = await prisma.carbonCalculation.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const calc = await prisma.carbonCalculation.create({
    data: {
      userId: user.id,
      ...parsed,
      transportationCo2: result.transportationCo2,
      energyCo2: result.energyCo2,
      foodCo2: result.foodCo2,
      shoppingCo2: result.shoppingCo2,
      totalCo2: result.totalCo2,
      grade: result.grade,
    },
  });

  // Update cumulative savings if reduction observed
  if (previous && previous.totalCo2 > result.totalCo2) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        carbonSaved: { increment: previous.totalCo2 - result.totalCo2 },
        greenPoints: { increment: 25 },
      },
    });
    await awardBadgesIfEligible(user.id);
  } else if (!previous) {
    await prisma.user.update({
      where: { id: user.id },
      data: { greenPoints: { increment: 50 } },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/calculator");
  return { id: calc.id, ...result };
}
