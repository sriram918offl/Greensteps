import Link from "@/components/ui/link";
import { Github, Leaf, Lock } from "lucide-react";

const REPO_URL = "https://github.com/sriram918offl/Greensteps";

// Public — works without an account.
const EXPLORE = [
  { href: "/discover", label: "Discover your footprint" },
  { href: "/city", label: "City Atlas" },
  { href: "/pledge", label: "Pledge Wall" },
  { href: "/chat", label: "Ask AI" },
];

// Member features — require sign-in. Flagged with a lock so the link
// isn't a surprise dead-end for logged-out visitors.
const PLATFORM = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/coach", label: "AI Coach" },
  { href: "/challenges", label: "Challenges" },
  { href: "/goals", label: "Goals & Simulator" },
];

const RESOURCES = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/10 bg-transparent backdrop-blur-md">
      <div className="container mx-auto py-14">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-gradient">GreenSteps</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Track your carbon footprint and build a greener future with
              AI-powered guidance.
            </p>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-emerald-500/50 hover:text-foreground"
            >
              <Github className="h-3.5 w-3.5" /> Star on GitHub
            </a>
          </div>

          {/* Explore (public) */}
          <div className="md:col-span-3">
            <h4 className="text-sm font-semibold">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {EXPLORE.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform (members) */}
          <div className="md:col-span-3">
            <h4 className="flex items-center gap-1.5 text-sm font-semibold">
              Platform
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-300">
                <Lock className="h-2.5 w-2.5" /> sign in
              </span>
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {PLATFORM.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold">Resources</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {RESOURCES.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  <Github className="h-3.5 w-3.5" /> GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} GreenSteps. Built for a better planet.</p>
          <p>Made with Next.js 15, Prisma, pgvector &amp; Gemini.</p>
        </div>
      </div>
    </footer>
  );
}
