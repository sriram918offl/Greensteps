"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const Schema = z.object({
  title: z.string().min(2).max(80),
  description: z.string().max(300).optional(),
  targetCo2: z.coerce.number().positive().max(10000),
  endDate: z.coerce.date(),
});

export async function createGoal(input: z.infer<typeof Schema>) {
  const user = await requireUser();
  const parsed = Schema.parse(input);
  await prisma.goal.create({
    data: {
      userId: user.id,
      title: parsed.title,
      description: parsed.description,
      targetCo2: parsed.targetCo2,
      endDate: parsed.endDate,
    },
  });
  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

export async function updateGoalProgress(goalId: string, current: number) {
  const user = await requireUser();
  const goal = await prisma.goal.findFirst({ where: { id: goalId, userId: user.id } });
  if (!goal) return;
  const status = current >= goal.targetCo2 ? "COMPLETED" : goal.status;
  await prisma.goal.update({ where: { id: goalId }, data: { currentCo2: current, status } });
  if (status === "COMPLETED") {
    await prisma.user.update({
      where: { id: user.id },
      data: { greenPoints: { increment: goal.reward } },
    });
  }
  revalidatePath("/goals");
}
