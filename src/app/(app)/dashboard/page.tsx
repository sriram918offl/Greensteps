import Link from "@/components/ui/link";
import { Cloud, Leaf, Target, Trophy, ArrowRight, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatKg } from "@/lib/utils";
import { TopBar } from "@/components/dashboard/top-bar";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { BreakdownChart } from "@/components/charts/breakdown-chart";
import { ProgressChart } from "@/components/charts/progress-chart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();

  const [latest, calcsThisYear, activeGoals, rank] = await Promise.all([
    prisma.carbonCalculation.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.carbonCalculation.findMany({
      where: { userId: user.id, createdAt: { gte: monthsAgo(11) } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.goal.count({ where: { userId: user.id, status: "ACTIVE" } }),
    prisma.user.count({ where: { greenPoints: { gt: user.greenPoints } } }),
  ]);

  const breakdown = latest?.totalCo2
    ? [
        { name: "Transportation", value: latest.transportationCo2, color: "#10b981" },
        { name: "Energy", value: latest.energyCo2, color: "#3b82f6" },
        { name: "Food", value: latest.foodCo2, color: "#f59e0b" },
        { name: "Shopping", value: latest.shoppingCo2, color: "#ef4444" },
      ]
    : DEMO_BREAKDOWN;

  const trend = buildTrend(calcsThisYear);
  const goalsData = await buildGoalsChart(user.id);

  return (
    <>
      <TopBar title="Dashboard" />
      <main className="space-y-6 p-4 md:p-8">
        {/* Welcome banner */}
        <section className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-6 text-white shadow-xl shadow-emerald-500/20 md:p-8">
          <div className="absolute -top-16 -right-10 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-white/80">Welcome back,</p>
              <h2 className="text-3xl font-bold">{user.name || "Eco friend"} 🌿</h2>
              <p className="mt-2 max-w-lg text-sm text-white/85">
                You've saved <strong>{formatKg(user.carbonSaved)}</strong> of CO₂ to date — keep the streak going.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white/10 px-5 py-3 text-center backdrop-blur">
                <p className="text-xs uppercase tracking-wider text-white/80">Carbon score</p>
                <p className="text-2xl font-bold">{latest ? Math.round(latest.totalCo2) : "—"}</p>
                <p className="text-[10px] text-white/70">kg / month</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-5 py-3 text-center backdrop-blur">
                <p className="text-xs uppercase tracking-wider text-white/80">Grade</p>
                <p className="text-2xl font-bold">{latest?.grade ?? "—"}</p>
                <p className="text-[10px] text-white/70">sustainability</p>
              </div>
            </div>
          </div>
        </section>

        {/* KPI cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Monthly footprint"
            value={latest ? `${Math.round(latest.totalCo2)} kg` : "—"}
            sub={latest ? `Grade ${latest.grade}` : "Run the calculator"}
            icon={Cloud}
            accent="emerald"
          />
          <StatCard
            label="Carbon saved"
            value={formatKg(user.carbonSaved)}
            sub="Cumulative impact"
            icon={Leaf}
            accent="blue"
          />
          <StatCard
            label="Active goals"
            value={String(activeGoals)}
            sub={activeGoals ? "In progress" : "Create your first"}
            icon={Target}
            accent="amber"
          />
          <StatCard
            label="Community rank"
            value={`#${rank + 1}`}
            sub={`${user.greenPoints} green points`}
            icon={Trophy}
            accent="rose"
          />
        </section>

        {/* Charts */}
        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Carbon trend</CardTitle>
              <CardDescription>Monthly CO₂ emissions over the past year</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendChart data={trend} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Activity breakdown</CardTitle>
              <CardDescription>Where your emissions come from</CardDescription>
            </CardHeader>
            <CardContent>
              <BreakdownChart data={breakdown} />
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Reduction progress</CardTitle>
                <CardDescription>Target vs. achieved CO₂ savings per goal</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/goals">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              {goalsData.length ? (
                <ProgressChart data={goalsData} />
              ) : (
                <div className="flex h-64 flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
                  <Target className="h-8 w-8 text-emerald-500" />
                  Set your first goal to see progress here.
                  <Button asChild variant="gradient" size="sm">
                    <Link href="/goals">Create a goal</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="glass-strong">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-500" /> AI Insight
              </CardTitle>
              <CardDescription>Personalized for your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                {latest
                  ? `Your largest category this month is ${biggestCategory(latest)}. Swapping just 2 weekly car trips for transit could save ~18 kg CO₂ — that's roughly ${Math.round((18 / latest.totalCo2) * 100)}% of your footprint.`
                  : "Run the calculator to unlock personalized AI insights."}
              </p>
              <div className="mt-4 flex gap-2">
                <Badge variant="success">Easy</Badge>
                <Badge variant="success">High impact</Badge>
                <Badge variant="success">Saves $60/mo</Badge>
              </div>
              <Button asChild variant="gradient" className="mt-5 w-full">
                <Link href="/coach">Get full coaching <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}

const DEMO_BREAKDOWN = [
  { name: "Transportation", value: 0, color: "#10b981" },
  { name: "Energy", value: 0, color: "#3b82f6" },
  { name: "Food", value: 0, color: "#f59e0b" },
  { name: "Shopping", value: 0, color: "#ef4444" },
];

function monthsAgo(n: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(1);
  return d;
}

function buildTrend(calcs: { createdAt: Date; totalCo2: number }[]) {
  const months: Array<{ month: string; co2: number }> = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("en-US", { month: "short" });
    const inMonth = calcs.filter(
      (c) => c.createdAt.getFullYear() === d.getFullYear() && c.createdAt.getMonth() === d.getMonth(),
    );
    const avg = inMonth.length
      ? inMonth.reduce((a, b) => a + b.totalCo2, 0) / inMonth.length
      : i === 0 && calcs.length
        ? calcs[calcs.length - 1].totalCo2
        : 0;
    months.push({ month: label, co2: Math.round(avg) });
  }
  // If user has no data yet, return a soft demo curve so the chart isn't blank
  if (months.every((m) => m.co2 === 0)) {
    return months.map((m, i) => ({ month: m.month, co2: 800 - i * 25 + (i % 3) * 20 }));
  }
  return months;
}

async function buildGoalsChart(userId: string) {
  const goals = await prisma.goal.findMany({
    where: { userId, status: { in: ["ACTIVE", "COMPLETED"] } },
    take: 6,
    orderBy: { startDate: "desc" },
  });
  return goals.map((g) => ({
    name: g.title.length > 14 ? g.title.slice(0, 14) + "…" : g.title,
    target: Math.round(g.targetCo2),
    achieved: Math.round(g.currentCo2),
  }));
}

function biggestCategory(c: {
  transportationCo2: number;
  energyCo2: number;
  foodCo2: number;
  shoppingCo2: number;
}) {
  const entries: Array<[string, number]> = [
    ["transportation", c.transportationCo2],
    ["energy", c.energyCo2],
    ["food", c.foodCo2],
    ["shopping", c.shoppingCo2],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}
