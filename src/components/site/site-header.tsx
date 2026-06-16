"use client";
import * as React from "react";
import Link from "@/components/ui/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Leaf, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/discover", label: "Discover" },
  { href: "/city", label: "City atlas" },
  { href: "/pledge", label: "Pledges" },
  { href: "/chat", label: "Ask AI" },
];

export function SiteHeader() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all",
        scrolled ? "border-b border-border/60 backdrop-blur-xl bg-background/70" : "bg-transparent",
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-gradient">GreenSteps</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <SignedOut>
            <Button asChild variant="gradient" size="sm" className="rounded-full">
              <Link href="/discover">Discover yours</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <UserButton />
          </SignedIn>
        </div>

        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="border-b border-border bg-background md:hidden">
          <div className="container mx-auto flex flex-col gap-3 py-4">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm font-medium" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 pt-2">
              <ThemeToggle />
              <SignedOut>
                <Button asChild variant="gradient" size="sm" className="flex-1">
                  <Link href="/discover">Discover yours</Link>
                </Button>
              </SignedOut>
              <SignedIn>
                <Button asChild variant="gradient" size="sm" className="flex-1">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
