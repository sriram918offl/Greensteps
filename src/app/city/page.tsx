import Link from "@/components/ui/link";
import { MapPin, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "City Carbon Atlas — Civic emissions dashboards",
  description: "Explore real, localized emission factors and per-capita climate data for major cities.",
};

export const dynamic = "force-dynamic";

export default async function CityIndexPage() {
  const cities = await prisma.city.findMany({ orderBy: { name: "asc" } });

  return (
    <main>
      <SiteHeader />
      <section className="hero-gradient relative pt-28 pb-12">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="container relative mx-auto max-w-4xl text-center">
          <Badge variant="success" className="rounded-full px-3 py-1">
            <MapPin className="mr-1.5 h-3 w-3" /> Civic carbon atlas
          </Badge>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Your city has a <span className="text-gradient">carbon fingerprint</span>
          </h1>
          <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
            Real grid factors, real per-capita data, real local actions — sourced from CEA, IEA, and Global Carbon Project.
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((c) => (
            <Link key={c.slug} href={`/city/${c.slug}`}>
              <Card className="group h-full transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.countryCode}</p>
                      <h3 className="mt-1 text-2xl font-bold">{c.name}</h3>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-500" />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-emerald-500/10 p-2">
                      <p className="text-muted-foreground">Grid factor</p>
                      <p className="font-semibold">{c.gridFactor.toFixed(2)} kg/kWh</p>
                    </div>
                    <div className="rounded-lg bg-blue-500/10 p-2">
                      <p className="text-muted-foreground">Per capita</p>
                      <p className="font-semibold">{c.percapitaTonsYr.toFixed(1)} t/yr</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
