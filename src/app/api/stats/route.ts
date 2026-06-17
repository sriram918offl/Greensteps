import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
// Force dynamic — without this Next tries to PRERENDER the response at
// build time, which hits the DB and fails if Neon is in a cold-start
// or build-side networking is restricted. The route is cheap so we
// just render on each request + use Cache-Control headers below for
// CDN-level reuse.
export const dynamic = "force-dynamic";

export async function GET() {
  const [calcSum, pledgeSum, cityCount, pledgeCount] = await Promise.all([
    prisma.publicCalculation.aggregate({ _sum: { totalCo2: true }, _count: true }),
    prisma.pledge.aggregate({ _sum: { estCo2: true }, _count: true, where: { approved: true } }),
    prisma.city.count(),
    prisma.pledge.count({ where: { approved: true } }),
  ]);

  // Approximation: each calculation reveals ~monthly footprint × 12 of awareness.
  const co2Revealed = Math.round((calcSum._sum.totalCo2 ?? 0) * 12);
  const co2Pledged = Math.round((pledgeSum._sum.estCo2 ?? 0) * 12);

  return NextResponse.json(
    {
      calculations: calcSum._count,
      pledges: pledgeCount,
      cities: cityCount,
      co2RevealedKg: co2Revealed,
      co2PledgedKg: co2Pledged,
    },
    {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    },
  );
}
