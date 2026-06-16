import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { DiscoverWizard } from "./discover-wizard";

export const metadata = {
  title: "Discover your carbon footprint in 60 seconds",
  description: "Free. No signup. See how your daily life compares to your city, country, and the planet.",
};

export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  const cities = await prisma.city.findMany({ orderBy: { name: "asc" } });
  return (
    <main className="relative min-h-screen">
      <SiteHeader />
      <section className="hero-gradient relative pt-28 pb-12">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="container relative mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            Free · 60 seconds · No signup
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            What does your{" "}
            <span className="text-gradient">carbon footprint</span> look like?
          </h1>
          <p className="mt-4 text-muted-foreground">
            Answer a few questions. See the surprising things that drive your impact —
            and how you compare to people in your city.
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-3xl px-4 pb-20">
        <DiscoverWizard cities={cities.map((c) => ({ slug: c.slug, name: c.name, countryCode: c.countryCode }))} />
      </section>

      <SiteFooter />
    </main>
  );
}
