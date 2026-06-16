"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { calculatePublic, makeSlug } from "@/lib/public-carbon";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const Schema = z.object({
  countryCode: z.string().min(2).max(3),
  citySlug: z.string().optional(),
  name: z.string().max(40).optional(),
  carKmPerMonth: z.coerce.number().min(0).max(20000),
  fuelType: z.enum(["PETROL", "DIESEL", "HYBRID", "ELECTRIC", "CNG"]),
  publicTransportPerWeek: z.coerce.number().min(0).max(100),
  flightsPerYear: z.coerce.number().int().min(0).max(100),
  electricityKwhPerMonth: z.coerce.number().min(0).max(20000),
  acHoursPerDay: z.coerce.number().min(0).max(24),
  renewablePct: z.coerce.number().min(0).max(100),
  diet: z.enum(["VEGAN", "VEGETARIAN", "MIXED", "HEAVY_MEAT"]),
  shoppingScore: z.coerce.number().int().min(0).max(5),
});

async function getIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-real-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("cf-connecting-ip") ??
    "anonymous"
  );
}

export async function savePublicCalculation(input: z.infer<typeof Schema>) {
  const parsed = Schema.parse(input);
  const { userId } = await auth();
  const ip = await getIp();

  // Rate limit
  const rl = await rateLimit(userId ? `u:${userId}` : `ip:${ip}`, RATE_LIMITS.discover);
  if (!rl.success) {
    logger.warn("discover.rate_limited", { ip, userId });
    throw new Error("Too many requests. Try again shortly.");
  }

  const result = calculatePublic(parsed);

  // Try a few times in the (vanishingly unlikely) event of a slug collision
  let slug = "";
  for (let i = 0; i < 5; i++) {
    slug = makeSlug();
    const exists = await prisma.publicCalculation.findUnique({ where: { slug }, select: { id: true } });
    if (!exists) break;
  }

  await prisma.publicCalculation.create({
    data: {
      slug,
      name: parsed.name || (userId ? "GreenSteps user" : "Anonymous"),
      citySlug: parsed.citySlug,
      countryCode: parsed.countryCode,
      carKmPerMonth: parsed.carKmPerMonth,
      fuelType: parsed.fuelType,
      publicTransportPerWeek: parsed.publicTransportPerWeek,
      flightsPerYear: parsed.flightsPerYear,
      electricityKwhPerMonth: parsed.electricityKwhPerMonth,
      acHoursPerDay: parsed.acHoursPerDay,
      renewablePct: parsed.renewablePct,
      diet: parsed.diet,
      shoppingScore: parsed.shoppingScore,
      transportationCo2: result.transportationCo2,
      energyCo2: result.energyCo2,
      foodCo2: result.foodCo2,
      shoppingCo2: result.shoppingCo2,
      totalCo2: result.totalCo2,
      grade: result.grade,
    },
  });

  return { slug, ...result };
}

export async function incrementShareCount(slug: string) {
  await prisma.publicCalculation.update({
    where: { slug },
    data: { shareCount: { increment: 1 } },
  });
}
