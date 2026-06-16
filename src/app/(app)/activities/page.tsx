import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/dashboard/top-bar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityForm } from "./activity-form";
import { BillScanner } from "./bill-scanner";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Link from "@/components/ui/link";
import { formatKg } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  const user = await requireUser();
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const activities = await prisma.activity.findMany({
    where: { userId: user.id },
    orderBy: { loggedAt: "desc" },
    take: 50,
  });

  const dailyTotal = activities
    .filter((a) => sameDay(a.loggedAt, new Date()))
    .reduce((sum, a) => sum + a.co2Kg, 0);
  const weeklyTotal = activities
    .filter((a) => withinDays(a.loggedAt, 7))
    .reduce((sum, a) => sum + a.co2Kg, 0);
  const monthlyTotal = activities.reduce((sum, a) => sum + a.co2Kg, 0);

  return (
    <>
      <TopBar title="Activity Tracker" />
      <main className="space-y-6 p-4 md:p-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <Summary title="Today" value={dailyTotal} count={activities.filter((a) => sameDay(a.loggedAt, new Date())).length} />
          <Summary title="This week" value={weeklyTotal} count={activities.filter((a) => withinDays(a.loggedAt, 7)).length} />
          <Summary title="Last 30 days" value={monthlyTotal} count={activities.length} />
        </div>

        <div className="flex justify-end">
          <Button asChild variant="outline" size="sm">
            <Link href="/api/export/activities"><Download className="h-4 w-4" /> Export CSV</Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-1">
            <ActivityForm />
            <BillScanner />
          </div>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Last 50 entries</CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="grid place-items-center rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
                  No activity logged yet. Use the form to add your first entry.
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {activities.map((a) => (
                    <li key={a.id} className="flex items-center justify-between py-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{a.category}</Badge>
                          <span className="text-sm font-medium capitalize">{a.type}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {a.quantity} {a.unit} • {a.loggedAt.toLocaleString()}
                        </p>
                      </div>
                      <span className="text-sm font-mono font-semibold text-emerald-600 dark:text-emerald-300">
                        {a.co2Kg.toFixed(1)} kg
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

function Summary({ title, value, count }: { title: string; value: number; count: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
        <p className="mt-1 text-3xl font-bold">{formatKg(value)}</p>
        <p className="text-xs text-muted-foreground">{count} entries</p>
      </CardContent>
    </Card>
  );
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function withinDays(d: Date, n: number) {
  return Date.now() - d.getTime() < n * 86_400_000;
}
