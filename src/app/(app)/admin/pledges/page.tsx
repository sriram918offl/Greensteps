import { Flag, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/dashboard/top-bar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { approvePledge, deletePledge } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPledgesPage() {
  const [held, reported, liveCount] = await Promise.all([
    // Awaiting first review (held by moderation, never approved).
    prisma.pledge.findMany({
      where: { approved: false, reportCount: 0 },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    // Auto-hidden after community reports, OR reported while live.
    prisma.pledge.findMany({
      where: { reportCount: { gt: 0 } },
      orderBy: { reportCount: "desc" },
      take: 50,
    }),
    prisma.pledge.count({ where: { approved: true } }),
  ]);

  return (
    <>
      <TopBar title="Pledge Moderation" />
      <main className="space-y-8 p-4 md:p-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Live pledges" value={String(liveCount)} />
          <Stat label="Awaiting review" value={String(held.length)} accent />
          <Stat label="Reported" value={String(reported.length)} accent />
        </div>

        {/* Held for review */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <Clock className="h-4 w-4 text-amber-500" /> Awaiting review ({held.length})
          </h2>
          {held.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing in the queue. 🎉</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {held.map((p) => (
                <PledgeReviewCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </section>

        {/* Reported */}
        {reported.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <Flag className="h-4 w-4 text-rose-500" /> Reported by community ({reported.length})
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {reported.map((p) => (
                <PledgeReviewCard key={p.id} p={p} showReports />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={`mt-1 text-3xl font-bold ${accent ? "text-amber-600 dark:text-amber-400" : ""}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

interface PledgeRow {
  id: string;
  name: string;
  city: string | null;
  message: string;
  category: string;
  approved: boolean;
  reportCount: number;
  createdAt: Date;
}

function PledgeReviewCard({ p, showReports }: { p: PledgeRow; showReports?: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{p.name}</CardTitle>
            <CardDescription>
              {p.city ? `${p.city} · ` : ""}
              {p.category} · {p.createdAt.toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex gap-1.5">
            {p.approved ? (
              <Badge variant="success">Live</Badge>
            ) : (
              <Badge variant="warning">Hidden</Badge>
            )}
            {showReports && (
              <Badge variant="destructive">
                <Flag className="mr-1 h-3 w-3" /> {p.reportCount}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
          &ldquo;{p.message}&rdquo;
        </p>
        <div className="mt-4 flex gap-2">
          <form action={approvePledge}>
            <input type="hidden" name="id" value={p.id} />
            <Button type="submit" variant="gradient" size="sm">
              Approve &amp; publish
            </Button>
          </form>
          <form action={deletePledge}>
            <input type="hidden" name="id" value={p.id} />
            <Button type="submit" variant="destructive" size="sm">
              Delete
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
