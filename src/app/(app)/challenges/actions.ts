"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function joinChallenge(challengeId: string) {
  const user = await requireUser();
  await prisma.challengeParticipant.upsert({
    where: { userId_challengeId: { userId: user.id, challengeId } },
    create: { userId: user.id, challengeId },
    update: {},
  });
  revalidatePath("/challenges");
}

export async function leaveChallenge(challengeId: string) {
  const user = await requireUser();
  await prisma.challengeParticipant.deleteMany({
    where: { userId: user.id, challengeId },
  });
  revalidatePath("/challenges");
}
