import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/dashboard/top-bar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { addDocument, reindexDocument, deleteDocument } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminKnowledgePage() {
  const docs = await prisma.document.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { embeddings: true } } },
  });

  return (
    <>
      <TopBar title="Knowledge Base" />
      <main className="grid gap-6 p-4 md:p-8 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Add document</CardTitle>
            <CardDescription>Paste an article or report. Chunks + embeds automatically.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={addDocument} className="space-y-3">
              <div className="space-y-1">
                <Label>Title</Label>
                <Input name="title" required />
              </div>
              <div className="space-y-1">
                <Label>Source</Label>
                <Input name="source" placeholder="EPA / IEA / URL" />
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <Input name="category" defaultValue="general" />
              </div>
              <div className="space-y-1">
                <Label>Content</Label>
                <Textarea name="content" rows={8} required />
              </div>
              <Button type="submit" variant="gradient" className="w-full">Add & index</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Indexed documents ({docs.length})</CardTitle>
            <CardDescription>Re-index after edits to refresh embeddings</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {docs.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{d.title}</p>
                      <Badge variant="secondary">{d.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{d._count.embeddings} chunks · {d.source ?? "—"}</p>
                  </div>
                  <div className="flex gap-2">
                    <form action={reindexDocument}>
                      <input type="hidden" name="id" value={d.id} />
                      <Button type="submit" variant="outline" size="sm">Re-index</Button>
                    </form>
                    <form action={deleteDocument}>
                      <input type="hidden" name="id" value={d.id} />
                      <Button type="submit" variant="destructive" size="sm">Delete</Button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
