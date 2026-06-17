"use client";
import * as React from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { FloatingLeaves } from "./floating-leaves";
import { useLowPower } from "@/components/fx/use-media";

/**
 * Track how much of the viewport is currently occupied by content-heavy
 * sections (anything tagged with `data-leaf-density="reduced"`). Returns a
 * 0..1 value where 1 means a content-heavy section fully owns the viewport.
 *
 * We use this to dim the floating leaves so reading cards isn't competing
 * with the ambient motion behind them — leaves stay vivid in the hero,
 * transformation, and CTA moments and quiet down over the story chapters
 * and testimonials. Implemented as opacity modulation (not re-spawning
 * particles) so the transition is buttery and the canvas doesn't reset.
 */
function useContentDensity(): number {
  const [density, setDensity] = React.useState(0);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // The set of sections currently being tracked + their last-seen ratio.
    const ratios = new Map<Element, number>();

    const recompute = () => {
      // Take the max — if multiple content sections overlap during scroll
      // we use the dominant one rather than summing (would clip > 1).
      let max = 0;
      for (const r of ratios.values()) if (r > max) max = r;
      setDensity(max);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        recompute();
      },
      // Many thresholds → smooth interpolation as section enters/exits.
      { threshold: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.0] },
    );

    // Initial sweep + watch for any later-mounted sections (e.g. after
    // route transitions). We re-query on mount only — additions are rare.
    document.querySelectorAll('[data-leaf-density="reduced"]').forEach((el) => {
      observer.observe(el);
      ratios.set(el, 0);
    });

    return () => observer.disconnect();
  }, []);

  return density;
}

/**
 * Persistent ambient backdrop — sits `position: fixed` behind the entire
 * landing so every section inherits the same atmosphere instead of having
 * its own surface.
 *
 * Layer stack (back to front, all at z-index -50 → -49):
 *   L1  Base gradient  emerald-950 → teal-950 → slate-950
 *   L2  Four soft orbs, scroll-driven parallax drift
 *   L3  Dot grid masked to a radial fade (cheap, tactile)
 *   L4  Slow conic light rays (desktop only)
 *   L5  Floating leaves canvas (continuous across the whole page)
 *
 * Performance:
 *   • `position: fixed` keeps it on its own GPU layer — never repaints
 *     during scroll. Orb drift uses transform only.
 *   • `useLowPower` strips L4 entirely and uses cheaper blur on touch.
 *   • Floating leaves density auto-clamps via FloatingLeaves' own gate.
 *   • IntersectionObserver inside FloatingLeaves pauses RAF when truly
 *     off-screen (which here means another fixed element fully covers it,
 *     such as the intro splash).
 */
export function AmbientBackdrop() {
  const lowPower = useLowPower();
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Scroll-driven orb drift — gentle, only on desktop to keep mobile cheap.
  const drift1Y = useTransform(scrollYProgress, [0, 1], lowPower ? ["0%", "0%"] : ["0%", "-14%"]);
  const drift1X = useTransform(scrollYProgress, [0, 1], lowPower ? ["0%", "0%"] : ["0%", "4%"]);
  const drift2Y = useTransform(scrollYProgress, [0, 1], lowPower ? ["0%", "0%"] : ["0%", "10%"]);
  const drift2X = useTransform(scrollYProgress, [0, 1], lowPower ? ["0%", "0%"] : ["0%", "-6%"]);

  // Leaf opacity follows how much of the viewport is content-heavy.
  // Ambient zones (hero, transformation, final CTA) → 1.0
  // Fully-content viewport (story chapter mid-scroll)  → 0.35
  // Smooth Framer transition handles the in-between.
  const contentDensity = useContentDensity();
  const leafOpacity = 1 - 0.65 * Math.min(1, contentDensity);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-50 overflow-hidden"
    >
      {/* L1 — Base gradient. The single defining colour of the experience. */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950" />

      {/* L2 — Four soft orbs in two parallax groups. */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ x: drift1X, y: drift1Y }}
      >
        <div
          className={`absolute left-[10%] top-[8%] h-[58vmin] w-[58vmin] rounded-full bg-emerald-500/22 ${lowPower ? "blur-3xl" : "blur-[120px]"}`}
        />
        <div
          className={`absolute right-[12%] top-[62%] h-[42vmin] w-[42vmin] rounded-full bg-teal-400/20 ${lowPower ? "blur-3xl" : "blur-[110px]"}`}
        />
      </motion.div>
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ x: drift2X, y: drift2Y }}
      >
        <div
          className={`absolute right-[8%] top-[28%] h-[48vmin] w-[48vmin] rounded-full bg-sky-500/20 ${lowPower ? "blur-3xl" : "blur-[120px]"}`}
        />
        <div
          className={`absolute left-[40%] top-[80%] h-[38vmin] w-[38vmin] rounded-full bg-emerald-400/18 ${lowPower ? "blur-3xl" : "blur-[100px]"}`}
        />
      </motion.div>

      {/* L3 — Dot grid, radially masked so it never feels uniform. */}
      <div
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(167, 243, 208, 0.6) 1px, transparent 0)",
          backgroundSize: "26px 26px",
          maskImage:
            "radial-gradient(ellipse at center, black 25%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 25%, transparent 90%)",
        }}
      />

      {/* L4 — Slow conic light rays (desktop only). */}
      {!lowPower && (
        <motion.div
          className="absolute left-1/2 top-1/2 h-[170vmax] w-[170vmax] -translate-x-1/2 -translate-y-1/2 opacity-[0.14]"
          style={{
            background:
              "conic-gradient(from 0deg," +
              " transparent 0deg, rgba(16,185,129,0.32) 10deg, transparent 22deg," +
              " transparent 110deg, rgba(56,189,248,0.28) 122deg, transparent 134deg," +
              " transparent 220deg, rgba(132,204,22,0.24) 232deg, transparent 244deg," +
              " transparent 330deg, rgba(20,184,166,0.28) 342deg, transparent 354deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* L5 — Floating leaves canvas, page-wide. The wrapper's opacity is
          driven by `useContentDensity` so leaves dim over content-heavy
          sections (story chapters, testimonials) and stay vivid in ambient
          zones. Canvas particles keep running at the same density so the
          transition is opacity-only — no re-spawn jitter. */}
      <motion.div
        className="absolute inset-0 will-change-[opacity]"
        animate={{ opacity: reduceMotion ? 1 : leafOpacity }}
        transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <FloatingLeaves
          density={lowPower ? 8 : 22}
          className="absolute inset-0 h-full w-full"
        />
      </motion.div>

      {/* Soft top tint so the SiteHeader doesn't sit on a flat black band. */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-950/40 to-transparent" />
    </div>
  );
}
