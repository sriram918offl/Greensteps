import Link from "@/components/ui/link";
import { Sparkles, TrendingDown, Wallet } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { heuristicRecommendations, aiCoachInsights } from "@/lib/coach";
import { TopBar } from "@/components/dashboard/top-bar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CoachPage() {
  const user = await requireUser();
  const latest = await prisma.carbonCalculation.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!latest) {
    return (
      <>
        <TopBar title="AI Sustainability Coach" />
        <main className="grid place-items-center p-12">
          <Card className="glass-strong max-w-md text-center">
            <CardContent className="space-y-3 p-10">
              <Sparkles className="mx-auto h-10 w-10 text-emerald-500" />
              <h3 className="text-xl font-semibold">Run the calculator first</h3>
              <p className="text-sm text-muted-foreground">
                The coach needs a baseline footprint to give you personalized recommendations.
              </p>
              <Button asChild variant="gradient">
                <Link href="/calculator">Start the calculator</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  const input = {
    carMilesPerMonth: latest.carMilesPerMonth,
    fuelType: latest.fuelType,
    publicTransportPerWeek: latest.publicTransportPerWeek,
    flightsPerMonth: latest.flightsPerMonth,
    electricityKwhPerMonth: latest.electricityKwhPerMonth,
    acHoursPerDay: latest.acHoursPerDay,
    renewablePct: latest.renewablePct,
    diet: latest.diet,
    clothingPerMonth: latest.clothingPerMonth,
    electronicsPerMonth: latest.electronicsPerMonth,
    onlineOrdersPerMonth: latest.onlineOrdersPerMonth,
  };
  const result = {
    transportationCo2: latest.transportationCo2,
    energyCo2: latest.energyCo2,
    foodCo2: latest.foodCo2,
    shoppingCo2: latest.shoppingCo2,
    totalCo2: latest.totalCo2,
    grade: latest.grade as "A+" | "A" | "B" | "C" | "D" | "F",
    breakdown: [],
  };

  const recs = heuristicRecommendations(input, result);
  const insight = await aiCoachInsights(input, result);

  return (
    <>
      <TopBar title="AI Sustainability Coach" />
      <main className="space-y-6 p-4 md:p-8">
        <Card className="glass-strong">
          <CardContent className="flex items-start gap-4 p-6">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <Badge variant="success" className="mb-2">Personalized insight</Badge>
              <p className="text-base leading-relaxed">{insight}</p>
            </div>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-xl font-semibold">Recommended actions</h3>
          <p className="text-sm text-muted-foreground">Highest impact first. Pick one to start.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {recs.map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="secondary">{r.category}</Badge>
                    <CardTitle className="mt-2">{r.title}</CardTitle>
                    <CardDescription>{r.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-emerald-500/10 p-3">
                    <TrendingDown className="mx-auto h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                    <p className="mt-1 text-sm font-semibold">−{r.impactKg} kg</p>
                    <p className="text-[10px] text-muted-foreground">per month</p>
                  </div>
                  <div className="rounded-lg bg-amber-500/10 p-3">
                    <Wallet className="mx-auto h-4 w-4 text-amber-600 dark:text-amber-300" />
                    <p className="mt-1 text-sm font-semibold">${r.costSaving}</p>
                    <p className="text-[10px] text-muted-foreground">monthly</p>
                  </div>
                  <div className="rounded-lg bg-blue-500/10 p-3">
                    <p className="text-xs text-blue-600 dark:text-blue-300">Difficulty</p>
                    <p className="text-sm font-semibold">{r.difficulty}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
