import Link from "@/components/ui/link";
import { notFound } from "next/navigation";
import { ArrowRight, Sparkles, MapPin, TrendingDown, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { generateComparisons, GRID_FACTORS, PERCAPITA_TONS_YR } from "@/lib/factors";
import { logger } from "@/lib/logger";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BreakdownChart } from "@/components/charts/breakdown-chart";
import { formatKg } from "@/lib/utils";
import { ShareBar } from "./share-bar";
import { ComparisonGrid } from "./comparison-grid";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const calc = await prisma.publicCalculation.findUnique({ where: { slug } });
  if (!calc) return { title: "Result not found" };
  const url = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const title = `${calc.name ?? "Someone"}'s carbon footprint: ${Math.round(calc.totalCo2)} kg/mo (Grade ${calc.grade})`;
  const description = `See how this compares to the average in their country — and discover yours in 60 seconds.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${url}/result/${slug}`,
      images: [{ url: `${url}/result/${slug}/og`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${url}/result/${slug}/og`],
    },
  };
}

export default async function ResultPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const calc = await prisma.publicCalculation.findUnique({ where: { slug } });
  if (!calc) notFound();

  // Increment view count (fire and forget — logged on failure for observability)
  prisma.publicCalculation
    .update({ where: { slug }, data: { viewCount: { increment: 1 } } })
    .catch((e) => logger.warn("result.view_count_failed", { slug }, e));

  const city = calc.citySlug ? await prisma.city.findUnique({ where: { slug: calc.citySlug } }) : null;

  const breakdown = [
    { name: "Transportation", value: calc.transportationCo2, color: "#10b981" },
    { name: "Energy", value: calc.energyCo2, color: "#3b82f6" },
    { name: "Food", value: calc.foodCo2, color: "#f59e0b" },
    { name: "Shopping", value: calc.shoppingCo2, color: "#ef4444" },
  ];

  const monthlyKg = calc.totalCo2;
  const yearlyTons = (monthlyKg * 12) / 1000;
  const nationalTons = PERCAPITA_TONS_YR[calc.countryCode] ?? PERCAPITA_TONS_YR.GLOBAL;
  const ratio = yearlyTons / nationalTons;
  const above = ratio > 1.05;
  const below = ratio < 0.95;

  const comparisons = generateComparisons(monthlyKg);

  return (
    <main className="relative">
      <SiteHeader />

      {/* Hero result card */}
      <section className="relative pt-28 pb-12">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="container relative mx-auto max-w-4xl">
          <Card className="glass-strong overflow-hidden">
            <CardContent className="grid gap-6 p-8 md:grid-cols-3 md:items-center">
              <div className="md:col-span-2 space-y-4">
                <Badge variant="success">{calc.name ?? "Someone"}&apos;s monthly footprint</Badge>
                <div>
                  <p className="text-6xl font-bold tracking-tight text-gradient md:text-7xl">
                    {formatKg(monthlyKg)}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    of CO₂ each month · {yearlyTons.toFixed(2)} t/year · Grade <strong>{calc.grade}</strong>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {above && (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-sm font-medium text-rose-700 dark:text-rose-300">
                      <TrendingUp className="h-3.5 w-3.5" />
                      {Math.round((ratio - 1) * 100)}% above {countryLabel(calc.countryCode)} average
                    </div>
                  )}
                  {below && (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      <TrendingDown className="h-3.5 w-3.5" />
                      {Math.round((1 - ratio) * 100)}% below {countryLabel(calc.countryCode)} average
                    </div>
                  )}
                  {city && (
                    <Link href={`/city/${city.slug}`} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20">
                      <MapPin className="h-3.5 w-3.5" /> {city.name} civic data
                    </Link>
                  )}
                </div>
                <ShareBar slug={slug} name={calc.name ?? "Someone"} kg={monthlyKg} />
              </div>
              <div>
                <BreakdownChart data={breakdown} />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Aha-moment comparisons */}
      <section className="container mx-auto max-w-6xl px-4 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="success" className="rounded-full px-3 py-1">
            <Sparkles className="mr-1.5 h-3 w-3" /> Aha moments
          </Badge>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            Your monthly footprint = <span className="text-gradient">these</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            CO₂ is invisible. These aren&apos;t.
          </p>
        </div>
        <ComparisonGrid items={comparisons} />
      </section>

      {/* What to do next */}
      <section className="container mx-auto max-w-4xl px-4 py-12">
        <Card className="glass-strong">
          <CardContent className="grid gap-6 p-8 md:grid-cols-3 md:items-center">
            <div className="md:col-span-2">
              <Badge variant="success">Take the next step</Badge>
              <h3 className="mt-2 text-2xl font-bold">Commit to one change.</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Pledge publicly on our wall — research shows public commitments are 65% more likely to stick.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild variant="gradient" size="lg" className="rounded-xl">
                <Link href="/pledge">Make a pledge <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="glass" size="lg" className="rounded-xl">
                <Link href="/chat">Ask the AI assistant</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Context */}
      <section className="container mx-auto max-w-4xl px-4 py-12">
        <div className="grid gap-4 md:grid-cols-3">
          <Stat label="Your grid factor" value={`${(GRID_FACTORS[calc.countryCode] ?? GRID_FACTORS.GLOBAL).toFixed(2)} kg/kWh`} sub={countryLabel(calc.countryCode)} />
          <Stat label="National per-capita" value={`${nationalTons.toFixed(1)} t/yr`} sub={`Avg ${countryLabel(calc.countryCode)} resident`} />
          <Stat label="Paris-aligned target" value="2.0 t/yr" sub="What we all need by 2030" />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

function countryLabel(code: string) {
  const map: Record<string, string> = {
    IN: "India", US: "US", EU: "EU", GB: "UK", CN: "China", GLOBAL: "global",
  };
  return map[code] ?? code;
}
