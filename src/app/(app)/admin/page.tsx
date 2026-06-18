import Link from "@/components/ui/link";
import { Users, Trophy, BookOpen, BarChart3, Leaf, Cloud, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/dashboard/top-bar";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatKg } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [userCount, activityCount, totalSaved, totalEmissionsAgg, topUsers, recentSignups, pledgeQueue] = await Promise.all([
    prisma.user.count(),
    prisma.activity.count(),
    prisma.user.aggregate({ _sum: { carbonSaved: true } }),
    prisma.activity.aggregate({ _sum: { co2Kg: true } }),
    prisma.user.findMany({
      orderBy: { greenPoints: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, greenPoints: true, carbonSaved: true },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    prisma.pledge.count({ where: { OR: [{ approved: false }, { reportCount: { gt: 0 } }] } }),
  ]);

  return (
    <>
      <TopBar title="Admin Panel" />
      <main className="space-y-6 p-4 md:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total users" value={String(userCount)} icon={Users} />
          <StatCard label="Activities logged" value={String(activityCount)} icon={Cloud} accent="blue" />
          <StatCard label="Carbon saved" value={formatKg(totalSaved._sum.carbonSaved ?? 0)} icon={Leaf} accent="amber" />
          <StatCard label="Emissions tracked" value={formatKg(totalEmissionsAgg._sum.co2Kg ?? 0)} icon={BarChart3} accent="rose" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <AdminLink
            href="/admin/pledges"
            title="Pledge moderation"
            desc={pledgeQueue > 0 ? `${pledgeQueue} awaiting review` : "Review held & reported pledges"}
            icon={ShieldCheck}
            badge={pledgeQueue > 0 ? pledgeQueue : undefined}
          />
          <AdminLink href="/admin/users" title="Manage users" desc="View, edit, and ban users" icon={Users} />
          <AdminLink href="/admin/challenges" title="Manage challenges" desc="Create, edit, delete community challenges" icon={Trophy} />
          <AdminLink href="/admin/knowledge" title="Knowledge base" desc="Upload, edit, re-index RAG documents" icon={BookOpen} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top contributors</CardTitle>
              <CardDescription>By green points</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm">
                {topUsers.map((u, i) => (
                  <li key={u.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <div>
                      <span className="font-semibold">#{i + 1}</span>{" "}
                      <span className="font-medium">{u.name ?? u.email}</span>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{u.greenPoints} pts · {formatKg(u.carbonSaved)}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent signups</CardTitle>
              <CardDescription>Newest 5 users</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm">
                {recentSignups.map((u) => (
                  <li key={u.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <div>
                      <span className="font-medium">{u.name ?? u.email}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{u.createdAt.toLocaleDateString()}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

function AdminLink({
  href,
  title,
  desc,
  icon: Icon,
  badge,
}: {
  href: string;
  title: string;
  desc: string;
  icon: typeof Users;
  badge?: number;
}) {
  return (
    <Card className="relative transition-transform hover:-translate-y-0.5">
      {badge !== undefined && badge > 0 && (
        <span className="absolute right-4 top-4 grid h-6 min-w-6 place-items-center rounded-full bg-amber-500 px-1.5 text-xs font-bold text-white">
          {badge}
        </span>
      )}
      <CardHeader>
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
          <Icon className="h-5 w-5" />
        </div>
        <CardTitle className="mt-3">{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline" className="w-full">
          <Link href={href}>Open</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
