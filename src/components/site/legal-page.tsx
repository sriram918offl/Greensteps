import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

/**
 * Shared shell for static legal/info pages (Privacy, Terms, Contact).
 * Keeps the header + footer consistent and gives the content a readable,
 * centered measure on the same ambient-friendly dark surface as the rest
 * of the marketing site.
 */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen bg-background">
      <SiteHeader />
      <section className="hero-gradient relative pt-28 pb-10">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="container relative mx-auto max-w-3xl px-4">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            <span className="text-gradient">{title}</span>
          </h1>
          {updated && (
            <p className="mt-3 text-sm text-muted-foreground">Last updated {updated}</p>
          )}
        </div>
      </section>

      <section className="container mx-auto max-w-3xl px-4 pb-24">
        <div className="prose prose-emerald max-w-none dark:prose-invert prose-headings:font-semibold prose-h2:mt-10 prose-h2:text-xl prose-a:text-emerald-600 dark:prose-a:text-emerald-400">
          {children}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
