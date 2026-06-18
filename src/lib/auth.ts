import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import type { User } from "@prisma/client";

// Admins can be allow-listed by Clerk user ID (ADMIN_USER_IDS) OR by email
// address (ADMIN_EMAILS). Email is the easier one to manage — you know your
// own email without digging through the Clerk dashboard. Either match grants
// the ADMIN role on the next request.
const ADMIN_IDS = (process.env.ADMIN_USER_IDS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

function isAdmin(userId: string, email: string): boolean {
  return ADMIN_IDS.includes(userId) || ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function requireUser(): Promise<User> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? `${userId}@greensteps.local`;
  const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || null;
  const admin = isAdmin(userId, email);

  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    create: {
      clerkId: userId,
      email,
      name,
      imageUrl: clerkUser?.imageUrl,
      role: admin ? "ADMIN" : "USER",
    },
    update: {
      email,
      name,
      imageUrl: clerkUser?.imageUrl,
      // Only force ADMIN on match; never silently demote here.
      role: admin ? "ADMIN" : undefined,
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
