import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/dashboard/top-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { banUser, unbanUser } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      greenPoints: true,
      carbonSaved: true,
      bannedAt: true,
      createdAt: true,
    },
  });

  return (
    <>
      <TopBar title="Manage Users" />
      <main className="p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>All users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3 text-left">User</th>
                  <th className="py-3 text-left">Role</th>
                  <th className="py-3 text-right">Points</th>
                  <th className="py-3 text-right">Saved</th>
                  <th className="py-3 text-left">Joined</th>
                  <th className="py-3 text-right">Status</th>
                  <th className="py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3">
                      <p className="font-medium">{u.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </td>
                    <td className="py-3">
                      <Badge variant={u.role === "ADMIN" ? "success" : "secondary"}>{u.role}</Badge>
                    </td>
                    <td className="py-3 text-right font-mono">{u.greenPoints}</td>
                    <td className="py-3 text-right font-mono">{u.carbonSaved.toFixed(0)} kg</td>
                    <td className="py-3 text-xs text-muted-foreground">{u.createdAt.toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      {u.bannedAt ? <Badge variant="destructive">Banned</Badge> : <Badge variant="success">Active</Badge>}
                    </td>
                    <td className="py-3 text-right">
                      <form action={u.bannedAt ? unbanUser : banUser}>
                        <input type="hidden" name="userId" value={u.id} />
                        <Button type="submit" size="sm" variant={u.bannedAt ? "outline" : "destructive"}>
                          {u.bannedAt ? "Unban" : "Ban"}
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
