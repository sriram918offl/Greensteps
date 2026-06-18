"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function approvePledge(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.pledge.update({ where: { id }, data: { approved: true, reportCount: 0 } });
  await prisma.auditLog.create({ data: { actorId: admin.id, action: "pledge.approved", target: id } });
  logger.info("admin.pledge.approved", { actorId: admin.id, target: id });
  revalidatePath("/admin/pledges");
  revalidatePath("/pledge");
  revalidatePath("/");
}

export async function deletePledge(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.pledge.delete({ where: { id } });
  await prisma.auditLog.create({ data: { actorId: admin.id, action: "pledge.deleted", target: id } });
  logger.info("admin.pledge.deleted", { actorId: admin.id, target: id });
  revalidatePath("/admin/pledges");
  revalidatePath("/pledge");
  revalidatePath("/");
}
