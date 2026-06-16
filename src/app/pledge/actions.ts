"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { aiModerate } from "@/lib/moderation";
import { logger } from "@/lib/logger";

const Schema = z.object({
  name: z.string().min(2).max(40),
  city: z.string().max(40).optional(),
  message: z.string().min(8).max(280),
  category: z.enum(["transport", "energy", "food", "shopping", "general"]),
  estCo2: z.coerce.number().min(0).max(2000).optional(),
});

const CATEGORY_DEFAULT_KG: Record<string, number> = {
  transport: 25,
  energy: 35,
  food: 22,
  shopping: 15,
  general: 10,
};

export type CreatePledgeResult =
  | { ok: true }
  | { ok: false; error: string };

async function getIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-real-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("cf-connecting-ip") ??
    "anonymous"
  );
}

export async function createPledge(input: z.infer<typeof Schema>): Promise<CreatePledgeResult> {
  const parsed = Schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const ip = await getIp();

  // Rate limit by IP (3 pledges/minute)
  const rl = await rateLimit(`ip:${ip}`, RATE_LIMITS.pledge);
  if (!rl.success) {
    logger.warn("pledge.rate_limited", { ip });
    return { ok: false, error: "Too many requests. Try again in a minute." };
  }

  // Moderation
  const moderation = await aiModerate(parsed.data.message);
  if (!moderation.allow) {
    logger.warn("pledge.blocked", { ip, reason: moderation.reason });
    await prisma.auditLog
      .create({
        data: {
          action: "pledge.blocked",
          ip,
          meta: { reason: moderation.reason, severity: moderation.severity },
        },
      })
      .catch((e) => logger.error("audit.write_failed", {}, e));
    return { ok: false, error: "Your pledge looks like it might violate our community rules." };
  }

  const est =
    parsed.data.estCo2 && parsed.data.estCo2 > 0
      ? parsed.data.estCo2
      : CATEGORY_DEFAULT_KG[parsed.data.category];

  try {
    await prisma.pledge.create({
      data: {
        name: parsed.data.name,
        city: parsed.data.city,
        message: parsed.data.message,
        category: parsed.data.category,
        estCo2: est,
        approved: true,
      },
    });
    revalidatePath("/pledge");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    logger.error("pledge.create_failed", { ip }, e);
    return { ok: false, error: "Server error" };
  }
}
