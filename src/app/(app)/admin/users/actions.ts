"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function banUser(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId"));
  await prisma.user.update({ where: { id: userId }, data: { bannedAt: new Date() } });
  await prisma.auditLog.create({
    data: { actorId: admin.id, action: "user.ban", target: userId },
  });
  logger.info("admin.user.ban", { actorId: admin.id, target: userId });
  revalidatePath("/admin/users");
}

export async function unbanUser(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId"));
  await prisma.user.update({ where: { id: userId }, data: { bannedAt: null } });
  await prisma.auditLog.create({
    data: { actorId: admin.id, action: "user.unban", target: userId },
  });
  logger.info("admin.user.unban", { actorId: admin.id, target: userId });
  revalidatePath("/admin/users");
}
