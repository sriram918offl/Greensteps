import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const activities = await prisma.activity.findMany({
    where: { userId: user.id },
    orderBy: { loggedAt: "desc" },
  });

  const rows = [
    ["loggedAt", "category", "type", "description", "quantity", "unit", "co2Kg"],
    ...activities.map((a) => [
      a.loggedAt.toISOString(),
      a.category,
      a.type,
      (a.description ?? "").replace(/"/g, '""'),
      a.quantity,
      a.unit,
      a.co2Kg,
    ]),
  ];

  const csv = rows.map((r) => r.map((v) => `"${String(v)}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="greensteps-activities-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
