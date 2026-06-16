import Link from "@/components/ui/link";
import { notFound } from "next/navigation";
import { ArrowRight, MapPin, Users, Zap, Wind, TrendingUp, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CityBreakdown } from "./city-breakdown";
import { PERCAPITA_TONS_YR } from "@/lib/factors";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const city = await prisma.city.findUnique({ where: { slug } });
  if (!city) return { title: "City not found" };
  return {
    title: `${city.name} carbon profile — ${city.percapitaTonsYr.toFixed(1)} t CO₂ / person / year`,
    description: city.context.slice(0, 160),
  };
}

export const dynamic = "force-dynamic";

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [city, pledgeCount, recentPledges, calcCount] = await Promise.all([
    prisma.city.findUnique({ where: { slug } }),
    prisma.pledge.count({ where: { city: { contains: slug, mode: "insensitive" } } }),
    prisma.pledge.findMany({
      where: { city: { contains: slug, mode: "insensitive" } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.publicCalculation.count({ where: { citySlug: slug } }),
  ]);

  if (!city) notFound();

  const nationalAvg = PERCAPITA_TONS_YR[city.countryCode] ?? PERCAPITA_TONS_YR.GLOBAL;
  const vsNational = city.percapitaTonsYr / nationalAvg;
  const sectorData = [
    { name: "Transport",   value: city.transportShare,   color: "#10b981" },
    { name: "Energy",      value: city.energyShare,      color: "#3b82f6" },
    { name: "Industry",    value: city.industryShare,    color: "#f59e0b" },
    { name: "Agriculture", value: city.agricultureShare, color: "#ef4444" },
  ];

  return (
    <main>
      <SiteHeader />

      <section className="hero-gradient relative pt-28 pb-12">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="container relative mx-auto max-w-5xl">
          <Link href="/city" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <MapPin className="h-3.5 w-3.5" /> Carbon atlas
          </Link>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">
            <span className="text-gradient">{city.name}</span>
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {city.population.toLocaleString()} people · {countryLabel(city.countryCode)}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <KPI icon={Users} label="Per capita / year" value={`${city.percapitaTonsYr.toFixed(1)} t`} sub={`${vsNational > 1 ? `${Math.round((vsNational - 1) * 100)}% above` : `${Math.round((1 - vsNational) * 100)}% below`} national avg`} />
            <KPI icon={Zap} label="Grid factor" value={`${city.gridFactor.toFixed(2)}`} sub="kg CO₂ / kWh" />
            <KPI icon={Wind} label="Renewable share" value={`${city.renewableSharePct.toFixed(0)}%`} sub="of generation" />
            <KPI icon={TrendingUp} label="GreenSteps users" value={`${calcCount + pledgeCount}`} sub={`${pledgeCount} pledges`} />
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Where {city.name}&apos;s emissions come from</CardTitle>
              <CardDescription>Share by sector (estimates)</CardDescription>
            </CardHeader>
            <CardContent>
              <CityBreakdown data={sectorData.map((d) => ({ ...d, value: Math.round(d.value * 100) }))} />
              <div className="mt-6 grid gap-2">
                {sectorData.map((s) => (
                  <div key={s.name} className="flex items-center gap-3 text-sm">
                    <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                    <span className="flex-1">{s.name}</span>
                    <span className="font-mono text-muted-foreground">{(s.value * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-strong">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-500" /> Highest-leverage action
              </CardTitle>
              <CardDescription>For residents like you</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed font-medium">{city.topAction}</p>
              <Button asChild variant="gradient" className="mt-5 w-full">
                <Link href="/discover">Calculate my impact <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="mt-2 w-full">
                <Link href={`/pledge`}>Pledge from {city.name}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container mx-auto max-w-5xl px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Local context</CardTitle>
            <CardDescription>What you should know about emissions in {city.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed">{city.context}</p>
            <div className="mt-6 space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Distance from Paris-aligned 2.0 t/yr target</span>
                  <span className="font-mono">{city.percapitaTonsYr.toFixed(1)} t</span>
                </div>
                <Progress value={Math.min(100, (2.0 / city.percapitaTonsYr) * 100)} />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Grid greening progress (50% target)</span>
                  <span className="font-mono">{city.renewableSharePct.toFixed(0)}%</span>
                </div>
                <Progress value={Math.min(100, (city.renewableSharePct / 50) * 100)} />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {recentPledges.length > 0 && (
        <section className="container mx-auto max-w-5xl px-4 py-12">
          <h2 className="mb-4 text-lg font-semibold">Recent pledges from {city.name}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {recentPledges.map((p) => (
              <Card key={p.id}>
                <CardContent className="p-4">
                  <Badge variant="secondary">{p.category}</Badge>
                  <p className="mt-2 text-sm">&ldquo;{p.message}&rdquo;</p>
                  <p className="mt-2 text-xs text-muted-foreground">— {p.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}

function KPI({ icon: Icon, label, value, sub }: { icon: typeof Users; label: string; value: string; sub: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function countryLabel(code: string) {
  const map: Record<string, string> = { IN: "India", US: "United States", EU: "European Union", GB: "United Kingdom", CN: "China" };
  return map[code] ?? code;
}
