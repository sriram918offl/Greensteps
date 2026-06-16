"use client";
import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Leaf } from "lucide-react";

const SHOWN_KEY = "gs.intro.shown";

/**
 * Branded intro splash. Plays once per browser session (sessionStorage) on the
 * landing page only. Skippable via button or Esc. Honors prefers-reduced-motion.
 */
export function IntroSplash() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (reduce) return; // skip animation entirely for accessibility

    // ?intro=1 or #intro forces the splash even within the same session.
    // Useful for showing it to others without clearing storage.
    const params = new URLSearchParams(window.location.search);
    const forced =
      params.has("intro") || window.location.hash === "#intro";
    if (forced) sessionStorage.removeItem(SHOWN_KEY);

    const seen = sessionStorage.getItem(SHOWN_KEY);
    if (seen) return;
    setVisible(true);
    sessionStorage.setItem(SHOWN_KEY, "1");
    const t = setTimeout(() => setVisible(false), 2400);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVisible(false);
    };
    window.addEventListener("keydown", onKey);
    // Stop body scroll while splash is visible
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [reduce]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900"
          aria-label="GreenSteps intro"
          role="status"
        >
          {/* Soft radial glow behind logo */}
          <motion.div
            className="absolute h-[80vmin] w-[80vmin] rounded-full bg-emerald-400/20 blur-[120px]"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.4, 1, 0.9], opacity: [0, 0.9, 0.6] }}
            transition={{ duration: 2, ease: "easeOut" }}
          />

          {/* Orbital particles */}
          <div className="absolute h-[260px] w-[260px]">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.span
                key={i}
                className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-emerald-200"
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  x: Math.cos((i / 5) * Math.PI * 2) * 130,
                  y: Math.sin((i / 5) * Math.PI * 2) * 130,
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 1.8, delay: 0.2 + i * 0.05, ease: "easeOut" }}
              />
            ))}
          </div>

          {/* Logo */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 140, damping: 14, delay: 0.1 }}
            className="relative grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_20px_60px_rgba(16,185,129,0.5)]"
          >
            <Leaf className="h-12 w-12 text-white" strokeWidth={2.2} />
          </motion.div>

          {/* Wordmark + tagline */}
          <div className="absolute bottom-[28vh] flex flex-col items-center gap-2">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-200 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl"
            >
              GreenSteps
            </motion.h1>
            <motion.p
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="text-sm tracking-wide text-emerald-200/80 md:text-base"
            >
              CO₂ is invisible. We make it obvious.
            </motion.p>
          </div>

          {/* Skip button */}
          <button
            onClick={() => setVisible(false)}
            className="absolute bottom-6 right-6 rounded-full bg-white/10 px-4 py-1.5 text-xs text-emerald-50 backdrop-blur transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            aria-label="Skip intro"
          >
            Skip ›
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
