import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/dashboard/top-bar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createChallenge, deleteChallenge } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminChallengesPage() {
  const challenges = await prisma.challenge.findMany({
    orderBy: { startDate: "desc" },
    include: { _count: { select: { participants: true } } },
  });

  return (
    <>
      <TopBar title="Manage Challenges" />
      <main className="grid gap-6 p-4 md:p-8 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>New challenge</CardTitle>
            <CardDescription>Visible to all users</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createChallenge} className="space-y-3">
              <div className="space-y-1">
                <Label>Title</Label>
                <Input name="title" required />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea name="description" rows={3} required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>Target kg saved</Label>
                  <Input name="targetCo2Saved" type="number" defaultValue={30} required />
                </div>
                <div className="space-y-1">
                  <Label>Reward pts</Label>
                  <Input name="rewardPoints" type="number" defaultValue={200} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>Start</Label>
                  <Input name="startDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
                </div>
                <div className="space-y-1">
                  <Label>End</Label>
                  <Input name="endDate" type="date" required defaultValue={(() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().slice(0, 10); })()} />
                </div>
              </div>
              <Button type="submit" variant="gradient" className="w-full">Create</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Existing challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {challenges.map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{c.title}</p>
                      <Badge variant={c.status === "ACTIVE" ? "success" : "secondary"}>{c.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{c._count.participants} participants · {c.startDate.toLocaleDateString()} → {c.endDate.toLocaleDateString()}</p>
                  </div>
                  <form action={deleteChallenge}>
                    <input type="hidden" name="id" value={c.id} />
                    <Button type="submit" variant="destructive" size="sm">Delete</Button>
                  </form>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
