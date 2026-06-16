import { Quote, Users, Leaf } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PledgeForm } from "./pledge-form";
import { formatKg } from "@/lib/utils";

export const metadata = {
  title: "Pledge Wall — Public climate commitments",
  description:
    "Make a public pledge to reduce your carbon footprint. Research shows public commitments are 65% more likely to stick.",
};

export const dynamic = "force-dynamic";

const CATEGORY_META: Record<string, { label: string; emoji: string; color: string }> = {
  transport: { label: "Transport", emoji: "🚲", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  energy:    { label: "Energy",    emoji: "⚡", color: "bg-blue-500/10 text-blue-700 dark:text-blue-300" },
  food:      { label: "Food",      emoji: "🥗", color: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  shopping:  { label: "Shopping",  emoji: "🛍",  color: "bg-rose-500/10 text-rose-700 dark:text-rose-300" },
  general:   { label: "General",   emoji: "🌍", color: "bg-teal-500/10 text-teal-700 dark:text-teal-300" },
};

export default async function PledgePage() {
  const [pledges, total, totalImpact] = await Promise.all([
    prisma.pledge.findMany({ where: { approved: true }, orderBy: { createdAt: "desc" }, take: 60 }),
    prisma.pledge.count({ where: { approved: true } }),
    prisma.pledge.aggregate({ _sum: { estCo2: true }, where: { approved: true } }),
  ]);

  return (
    <main>
      <SiteHeader />

      <section className="hero-gradient relative pt-28 pb-12">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="container relative mx-auto max-w-4xl text-center">
          <Badge variant="success" className="rounded-full px-3 py-1">
            <Users className="mr-1.5 h-3 w-3" /> Public commitments
          </Badge>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            The <span className="text-gradient">Pledge Wall</span>
          </h1>
          <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
            Public commitments are 65% more likely to stick (Cialdini, 1984). Add yours below — small actions, big chain.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 max-w-xl mx-auto md:grid-cols-3">
            <Stat label="Pledges" value={total.toString()} icon={Quote} />
            <Stat label="Estimated CO₂/mo" value={formatKg(totalImpact._sum.estCo2 ?? 0)} icon={Leaf} />
            <Stat label="Annual impact" value={formatKg((totalImpact._sum.estCo2 ?? 0) * 12)} icon={Leaf} />
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1 lg:sticky lg:top-24 self-start">
            <PledgeForm />
          </div>

          <div className="lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold">Recent pledges</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {pledges.map((p) => {
                const meta = CATEGORY_META[p.category] ?? CATEGORY_META.general;
                return (
                  <Card key={p.id} className="group transition-all hover:-translate-y-0.5">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.color}`}>
                          <span>{meta.emoji}</span> {meta.label}
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          −{p.estCo2.toFixed(0)} kg/mo
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed">&ldquo;{p.message}&rdquo;</p>
                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <div className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/15 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                            {p.name[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium">{p.name}</span>
                          {p.city && <span>· {p.city}</span>}
                        </div>
                        <span>{p.createdAt.toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Quote }) {
  return (
    <div className="glass rounded-2xl px-4 py-3">
      <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
