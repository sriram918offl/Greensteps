"use client";
import * as React from "react";
import Link from "@/components/ui/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  LayoutDashboard,
  Sparkles,
  Trophy,
  Target,
  ArrowRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * "Members get more" showcase — surfaces the power-user features that live
 * behind sign-in (Dashboard, AI Coach, Challenges, Goals/Simulator) so they
 * aren't buried in the dashboard sidebar. Sits between testimonials and the
 * final CTA. Glass cards over the global ambient backdrop — no surface of
 * its own, so it stays seamless with the rest of the page.
 */

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Sustainability Coach",
    desc: "Personalized, science-backed recommendations generated from your own footprint data — ranked by impact and effort.",
    href: "/coach",
    accent: "from-emerald-400 to-teal-500",
    highlight: true,
  },
  {
    icon: Trophy,
    title: "Community Challenges",
    desc: "Join No-Car Week, Plant-Based Month and more. Compete on the leaderboard and rack up green points with others.",
    href: "/challenges",
    accent: "from-amber-400 to-orange-500",
    highlight: true,
  },
  {
    icon: LayoutDashboard,
    title: "Personal Dashboard",
    desc: "Track your monthly footprint over time with trend charts, category breakdowns, and your sustainability grade.",
    href: "/dashboard",
    accent: "from-sky-400 to-blue-500",
    highlight: false,
  },
  {
    icon: Target,
    title: "Goals & Simulator",
    desc: "Set reduction targets, watch progress bars fill, and simulate 'what if I went electric?' before you commit.",
    href: "/goals",
    accent: "from-lime-400 to-emerald-500",
    highlight: false,
  },
];

const PERKS = [
  "Free forever — no card required",
  "Your data, private by default",
  "Earn badges & green points",
];

export function MembersShowcase() {
  const reduce = useReducedMotion();

  return (
    <section
      className="relative py-24"
      data-leaf-density="reduced"
      aria-labelledby="members-heading"
    >
      <div className="container mx-auto px-4">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <Badge
            variant="success"
            className="rounded-full border-white/10 bg-emerald-500/15 px-3 py-1 text-emerald-100 backdrop-blur"
          >
            <Sparkles className="mr-1.5 h-3 w-3" /> Unlock with a free account
          </Badge>
          <h2
            id="members-heading"
            className="mt-4 text-3xl font-bold tracking-tight text-white md:text-5xl"
          >
            Awareness is the start.
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-sky-300 bg-clip-text text-transparent">
              Members go all the way.
            </span>
          </h2>
          <p className="mt-3 text-balance text-white/65 md:text-lg">
            Sign up free to turn one-time awareness into measurable, tracked
            progress — with an AI coach and community challenges in your corner.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-2">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: reduce ? 0 : 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.55,
                  delay: reduce ? 0 : i * 0.08,
                  ease: [0.22, 0.61, 0.36, 1],
                }}
              >
                <Link
                  href={f.href}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-white/[0.07]"
                >
                  {/* Highlight ribbon for the two features the user wanted surfaced */}
                  {f.highlight && (
                    <span className="absolute right-4 top-4 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                      Popular
                    </span>
                  )}

                  <div
                    className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${f.accent} text-white shadow-lg transition-transform group-hover:scale-110`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-white">{f.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/60">
                    {f.desc}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-300">
                    Explore
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>

                  {/* Soft accent glow on hover */}
                  <div
                    aria-hidden
                    className={`pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${f.accent} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30`}
                  />
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* CTA band */}
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
          className="mx-auto mt-12 max-w-3xl"
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/15 via-emerald-600/10 to-teal-500/15 p-8 backdrop-blur-xl md:p-10">
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Create your free account
                </h3>
                <ul className="mt-3 flex flex-col gap-1.5 text-sm text-white/70 md:flex-row md:gap-5">
                  {PERKS.map((p) => (
                    <li key={p} className="inline-flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-300" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-white text-emerald-700 shadow-lg shadow-emerald-900/30 hover:bg-white/90"
                >
                  <Link href="/sign-up">
                    Sign up free <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="rounded-full text-white hover:bg-white/10"
                >
                  <Link href="/sign-in">Sign in</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
