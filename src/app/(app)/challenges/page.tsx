import { Trophy, Users, Calendar } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/dashboard/top-bar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChallengeActions } from "./challenge-actions";
import { formatKg } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ChallengesPage() {
  const user = await requireUser();
  const challenges = await prisma.challenge.findMany({
    where: { status: { in: ["ACTIVE", "UPCOMING"] } },
    orderBy: { startDate: "asc" },
    include: {
      _count: { select: { participants: true } },
      participants: { where: { userId: user.id }, take: 1 },
    },
  });

  const leaderboard = await prisma.user.findMany({
    orderBy: { greenPoints: "desc" },
    take: 10,
    select: { id: true, name: true, greenPoints: true, carbonSaved: true, imageUrl: true },
  });

  return (
    <>
      <TopBar title="Community Challenges" />
      <main className="space-y-6 p-4 md:p-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {challenges.map((c) => {
              const joined = c.participants.length > 0;
              return (
                <Card key={c.id} className="overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle>{c.title}</CardTitle>
                          <Badge variant={c.status === "ACTIVE" ? "success" : "secondary"}>{c.status}</Badge>
                        </div>
                        <CardDescription className="mt-1">{c.description}</CardDescription>
                      </div>
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                        <Trophy className="h-5 w-5" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      <Stat label="Target" value={formatKg(c.targetCo2Saved)} />
                      <Stat label="Reward" value={`+${c.rewardPoints}`} />
                      <Stat label="Participants" value={String(c._count.participants)} icon={Users} />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" /> {c.startDate.toLocaleDateString()} – {c.endDate.toLocaleDateString()}
                      </div>
                      <ChallengeActions challengeId={c.id} joined={joined} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>Top 10 by green points</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {leaderboard.map((u, i) => (
                  <li key={u.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                        i === 0 ? "bg-amber-500/20 text-amber-600" :
                        i === 1 ? "bg-slate-400/20 text-slate-500" :
                        i === 2 ? "bg-orange-500/20 text-orange-600" :
                        "bg-secondary text-muted-foreground"
                      }`}>
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium">{u.name ?? "Anonymous"}</span>
                    </div>
                    <span className="font-mono text-xs">{u.greenPoints} pts</span>
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

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof Users }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold">
        {Icon && <Icon className="h-3 w-3" />} {value}
      </p>
    </div>
  );
}
