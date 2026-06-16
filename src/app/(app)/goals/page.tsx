import { Target, Trophy } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/dashboard/top-bar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GoalDialog } from "./goal-dialog";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const user = await requireUser();
  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    orderBy: [{ status: "asc" }, { startDate: "desc" }],
  });

  return (
    <>
      <TopBar title="Goals" />
      <main className="space-y-6 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Sustainability goals</h2>
            <p className="text-sm text-muted-foreground">Set targets. Earn rewards. Reduce your footprint.</p>
          </div>
          <GoalDialog />
        </div>

        {goals.length === 0 ? (
          <Card className="glass-strong">
            <CardContent className="grid place-items-center gap-3 py-16 text-center">
              <Target className="h-10 w-10 text-emerald-500" />
              <h3 className="text-lg font-semibold">No goals yet</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Start with something concrete — like "Reduce my monthly footprint by 15%" or "No flights this quarter".
              </p>
              <GoalDialog />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {goals.map((g) => {
              const pct = Math.min(100, Math.round((g.currentCo2 / g.targetCo2) * 100));
              return (
                <Card key={g.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="line-clamp-1">{g.title}</CardTitle>
                        {g.description && <CardDescription className="line-clamp-2">{g.description}</CardDescription>}
                      </div>
                      <Badge
                        variant={
                          g.status === "COMPLETED" ? "success" : g.status === "ABANDONED" ? "destructive" : "secondary"
                        }
                      >
                        {g.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{g.currentCo2.toFixed(0)} / {g.targetCo2.toFixed(0)} kg saved</span>
                      <span>{pct}%</span>
                    </div>
                    <Progress value={pct} />
                    <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                      <span>Ends {g.endDate.toLocaleDateString()}</span>
                      <span className="inline-flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-amber-500" /> +{g.reward} pts
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
