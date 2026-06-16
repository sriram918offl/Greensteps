import { prisma } from "./prisma";

export async function awardBadgesIfEligible(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { carbonSaved: true, greenPoints: true },
  });
  if (!user) return [];

  const candidates = await prisma.badge.findMany({
    where: { threshold: { lte: Math.max(user.carbonSaved, user.greenPoints) } },
  });

  const earned: string[] = [];
  for (const b of candidates) {
    const existing = await prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId: b.id } },
    });
    if (!existing) {
      await prisma.userBadge.create({ data: { userId, badgeId: b.id } });
      earned.push(b.name);
    }
  }
  return earned;
}
