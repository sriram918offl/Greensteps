"use client";
import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FloatingLeaves } from "./floating-leaves";
import { useLowPower } from "@/components/fx/use-media";

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
  const { scrollYProgress } = useScroll();

  // Scroll-driven orb drift — gentle, only on desktop to keep mobile cheap.
  const drift1Y = useTransform(scrollYProgress, [0, 1], lowPower ? ["0%", "0%"] : ["0%", "-14%"]);
  const drift1X = useTransform(scrollYProgress, [0, 1], lowPower ? ["0%", "0%"] : ["0%", "4%"]);
  const drift2Y = useTransform(scrollYProgress, [0, 1], lowPower ? ["0%", "0%"] : ["0%", "10%"]);
  const drift2X = useTransform(scrollYProgress, [0, 1], lowPower ? ["0%", "0%"] : ["0%", "-6%"]);

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

      {/* L5 — Floating leaves canvas, page-wide. */}
      <FloatingLeaves
        density={lowPower ? 8 : 22}
        className="absolute inset-0 h-full w-full"
      />

      {/* Soft top tint so the SiteHeader doesn't sit on a flat black band. */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-950/40 to-transparent" />
    </div>
  );
}
