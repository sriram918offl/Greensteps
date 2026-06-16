"use client";
import * as React from "react";
import Link from "@/components/ui/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Bike, Leaf, Recycle, Sun, TreePine, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FloatingLeaves } from "./floating-leaves";
import { LiveCounter } from "./live-counter";
import { ScrollIndicator } from "./scroll-indicator";

/**
 * Ambient hero — no video. Layered backgrounds:
 *   1. Animated gradient mesh (CSS only, ~zero CPU)
 *   2. Floating leaf canvas (lightweight)
 *   3. Conic light rays (CSS, slow rotation)
 *   4. Drifting sustainability icons at low opacity (Framer Motion)
 *   5. Subtle dot-grid for tactile depth
 *
 * Everything pauses with prefers-reduced-motion and is GPU composited.
 */
export function AmbientHero() {
  const reduce = useReducedMotion();

  return (
    <section
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden"
      aria-labelledby="hero-headline"
    >
      {/* Base background tint that reads well on both themes */}
      <div className="absolute inset-0 -z-50 bg-gradient-to-b from-white via-emerald-50/40 to-white dark:from-slate-950 dark:via-emerald-950/40 dark:to-slate-950" />

      {/* Layer 1: animated gradient mesh (orbs that slowly drift) */}
      <div className="absolute inset-0 -z-40 overflow-hidden">
        <motion.div
          className="absolute -left-[10%] top-[15%] h-[55vmin] w-[55vmin] rounded-full bg-emerald-400/35 blur-[110px] dark:bg-emerald-500/25"
          animate={reduce ? undefined : { x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-[8%] top-[45%] h-[50vmin] w-[50vmin] rounded-full bg-sky-400/30 blur-[110px] dark:bg-sky-500/20"
          animate={reduce ? undefined : { x: [0, -25, 0], y: [0, -20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-[28%] bottom-[8%] h-[40vmin] w-[40vmin] rounded-full bg-teal-300/35 blur-[110px] dark:bg-teal-500/25"
          animate={reduce ? undefined : { x: [0, 15, 0], y: [0, 25, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
        <motion.div
          className="absolute right-[35%] top-[8%] h-[28vmin] w-[28vmin] rounded-full bg-lime-300/30 blur-[100px] dark:bg-lime-500/20"
          animate={reduce ? undefined : { x: [0, -20, 0], y: [0, 18, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Layer 2: dot-grid for tactile depth */}
      <div
        className="absolute inset-0 -z-30 opacity-[0.18] dark:opacity-[0.10]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(16,185,129,0.45) 1px, transparent 0)",
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(circle at center, black 35%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 35%, transparent 78%)",
        }}
        aria-hidden
      />

      {/* Layer 3: slow conic light rays (~zero CPU) */}
      {!reduce && (
        <motion.div
          className="absolute left-1/2 top-1/2 -z-20 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 opacity-25 dark:opacity-15"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(16,185,129,0.30) 8deg, transparent 18deg, transparent 90deg, rgba(20,184,166,0.25) 98deg, transparent 108deg, transparent 180deg, rgba(56,189,248,0.22) 188deg, transparent 198deg, transparent 270deg, rgba(132,204,22,0.22) 278deg, transparent 288deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          aria-hidden
        />
      )}

      {/* Layer 4: floating leaves (canvas) */}
      <FloatingLeaves
        density={28}
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
      />

      {/* Layer 5: drifting sustainability icons at low opacity */}
      <DriftingIcons />

      {/* ── Foreground content ─────────────────────────────────────────── */}
      <div className="container relative mx-auto px-4 pt-28 text-center md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto inline-flex"
        >
          <Badge variant="success" className="rounded-full px-3 py-1">
            <Leaf className="mr-1.5 h-3 w-3" /> Carbon Footprint Awareness Platform
          </Badge>
        </motion.div>

        <motion.h1
          id="hero-headline"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mx-auto mt-6 max-w-5xl text-balance text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-[68px]"
          style={{ textWrap: "balance" }}
        >
          Every Step Leaves a Mark.{" "}
          <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 bg-clip-text text-transparent">
            Make Yours Green.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted-foreground md:text-lg"
        >
          Track, understand, and reduce your carbon footprint through
          awareness-driven insights and sustainable actions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <Button
            asChild
            size="xl"
            variant="gradient"
            className="rounded-full shadow-xl shadow-emerald-500/40"
          >
            <Link href="/discover">
              Calculate My Footprint <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="glass"
            className="rounded-full"
          >
            <Link href="/chat">Ask the AI assistant</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-10 flex justify-center"
        >
          <LiveCounter />
        </motion.div>
      </div>

      <ScrollIndicator label="Scroll to begin the story" />
    </section>
  );
}

// ---------------------------------------------------------------------------
// Drifting icons — small, very low opacity, gentle bobbing.
// ---------------------------------------------------------------------------

const DRIFT_ICONS = [
  { Icon: Sun,      top: "12%", left: "12%", delay: 0,   duration: 10 },
  { Icon: Wind,     top: "22%", left: "82%", delay: 1.5, duration: 12 },
  { Icon: Recycle,  top: "70%", left: "8%",  delay: 3,   duration: 11 },
  { Icon: Bike,     top: "78%", left: "84%", delay: 0.6, duration: 13 },
  { Icon: TreePine, top: "55%", left: "92%", delay: 2.2, duration: 14 },
  { Icon: Leaf,     top: "62%", left: "4%",  delay: 1,   duration: 10 },
  { Icon: Sun,      top: "85%", left: "48%", delay: 4,   duration: 12 },
];

function DriftingIcons() {
  const reduce = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
      {DRIFT_ICONS.map(({ Icon, top, left, delay, duration }, i) => (
        <motion.div
          key={i}
          className="absolute text-emerald-500/15 dark:text-emerald-300/15"
          style={{ top, left }}
          animate={
            reduce
              ? undefined
              : { y: [0, -14, 0], rotate: [0, 6, 0], opacity: [0.5, 1, 0.5] }
          }
          transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Icon className="h-10 w-10 md:h-14 md:w-14" strokeWidth={1.5} />
        </motion.div>
      ))}
    </div>
  );
}
