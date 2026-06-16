import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import type { User } from "@prisma/client";

const ADMIN_IDS = (process.env.ADMIN_USER_IDS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export async function requireUser(): Promise<User> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? `${userId}@greensteps.local`;
  const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || null;

  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    create: {
      clerkId: userId,
      email,
      name,
      imageUrl: clerkUser?.imageUrl,
      role: ADMIN_IDS.includes(userId) ? "ADMIN" : "USER",
    },
    update: {
      email,
      name,
      imageUrl: clerkUser?.imageUrl,
      role: ADMIN_IDS.includes(userId) ? "ADMIN" : undefined,
    },
  });

  if (user.bannedAt) redirect("/banned");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}

export async function getOptionalUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { clerkId: userId } });
}
