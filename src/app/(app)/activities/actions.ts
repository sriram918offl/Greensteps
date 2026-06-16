"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { activityCo2 } from "@/lib/carbon";

const Schema = z.object({
  category: z.enum(["TRANSPORTATION", "ENERGY", "FOOD", "SHOPPING"]),
  type: z.string().min(1),
  quantity: z.coerce.number().min(0),
  unit: z.string().min(1),
  description: z.string().optional(),
});

export async function logActivity(input: z.infer<typeof Schema>) {
  const user = await requireUser();
  const parsed = Schema.parse(input);
  const co2 = activityCo2(parsed.category, parsed.type, parsed.quantity);

  await prisma.activity.create({
    data: {
      userId: user.id,
      category: parsed.category,
      type: parsed.type,
      quantity: parsed.quantity,
      unit: parsed.unit,
      description: parsed.description,
      co2Kg: co2,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { greenPoints: { increment: 5 } },
  });

  revalidatePath("/activities");
  revalidatePath("/dashboard");
  return { co2 };
}
