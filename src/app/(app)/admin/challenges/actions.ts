"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createChallenge(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title"));
  const description = String(formData.get("description"));
  const start = new Date(String(formData.get("startDate")));
  const end = new Date(String(formData.get("endDate")));
  await prisma.challenge.create({
    data: {
      slug: title.toLowerCase().replace(/\s+/g, "-").slice(0, 60) + "-" + Math.random().toString(36).slice(2, 6),
      title,
      description,
      targetCo2Saved: Number(formData.get("targetCo2Saved")),
      rewardPoints: Number(formData.get("rewardPoints")),
      startDate: start,
      endDate: end,
      status: start <= new Date() ? "ACTIVE" : "UPCOMING",
    },
  });
  revalidatePath("/admin/challenges");
  revalidatePath("/challenges");
}

export async function deleteChallenge(formData: FormData) {
  await requireAdmin();
  await prisma.challenge.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/challenges");
  revalidatePath("/challenges");
}
