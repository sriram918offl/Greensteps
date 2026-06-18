"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { moderatePledge } from "@/lib/moderation";
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

// How many community reports before a live pledge auto-hides for re-review.
const REPORT_HIDE_THRESHOLD = 2;

export type CreatePledgeResult =
  | { ok: true; status: "published" | "pending" }
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

  // Hybrid moderation across ALL visible fields (name + city + message).
  const mod = await moderatePledge({
    name: parsed.data.name,
    city: parsed.data.city,
    message: parsed.data.message,
  });

  // Hard reject — never stored.
  if (mod.verdict === "block") {
    logger.warn("pledge.blocked", { ip, reason: mod.reason });
    await prisma.auditLog
      .create({ data: { action: "pledge.blocked", ip, meta: { reason: mod.reason } } })
      .catch((e) => logger.error("audit.write_failed", {}, e));
    return {
      ok: false,
      error: "Your pledge looks like it violates our community rules. Please reword it.",
    };
  }

  const est =
    parsed.data.estCo2 && parsed.data.estCo2 > 0
      ? parsed.data.estCo2
      : CATEGORY_DEFAULT_KG[parsed.data.category];

  // allow → publish instantly (approved). hold → save hidden for review.
  const approved = mod.verdict === "allow";

  try {
    const pledge = await prisma.pledge.create({
      data: {
        name: parsed.data.name,
        city: parsed.data.city,
        message: parsed.data.message,
        category: parsed.data.category,
        estCo2: est,
        approved,
      },
    });

    if (!approved) {
      logger.info("pledge.held_for_review", { ip, reason: mod.reason, pledgeId: pledge.id });
      await prisma.auditLog
        .create({ data: { action: "pledge.held", target: pledge.id, ip, meta: { reason: mod.reason } } })
        .catch((e) => logger.error("audit.write_failed", {}, e));
    }

    revalidatePath("/pledge");
    revalidatePath("/");
    return { ok: true, status: approved ? "published" : "pending" };
  } catch (e) {
    logger.error("pledge.create_failed", { ip }, e);
    return { ok: false, error: "Server error" };
  }
}

export type ReportPledgeResult = { ok: boolean };

/**
 * Community report. Increments the report count; once it crosses the
 * threshold the pledge auto-hides (approved=false) and lands back in the
 * admin review queue. Rate-limited per IP so reporting can't be weaponized
 * en masse.
 */
export async function reportPledge(pledgeId: string): Promise<ReportPledgeResult> {
  const ip = await getIp();

  const rl = await rateLimit(`ip:${ip}`, { bucket: "report", limit: 10, windowSec: 60 });
  if (!rl.success) return { ok: false };

  try {
    const pledge = await prisma.pledge.update({
      where: { id: pledgeId },
      data: { reportCount: { increment: 1 } },
      select: { id: true, reportCount: true, approved: true },
    });

    await prisma.auditLog
      .create({ data: { action: "pledge.reported", target: pledgeId, ip, meta: { count: pledge.reportCount } } })
      .catch(() => {});

    // Auto-hide once enough reports accumulate.
    if (pledge.approved && pledge.reportCount >= REPORT_HIDE_THRESHOLD) {
      await prisma.pledge.update({ where: { id: pledgeId }, data: { approved: false } });
      logger.warn("pledge.auto_hidden", { pledgeId, reportCount: pledge.reportCount });
      revalidatePath("/pledge");
      revalidatePath("/");
    }

    return { ok: true };
  } catch (e) {
    logger.error("pledge.report_failed", { pledgeId }, e);
    return { ok: false };
  }
}
