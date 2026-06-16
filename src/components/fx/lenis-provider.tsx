"use client";
import * as React from "react";
import Lenis from "lenis";

/**
 * Lenis smooth-scroll wrapper.
 *
 * - Disables itself for users who opt out via prefers-reduced-motion.
 * - Disables itself on touch devices (iOS handles momentum natively, Lenis fights it).
 * - Cleans up on unmount to avoid duplicate RAFs on hot-reload.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (prefersReduce || isTouch) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      lerp: 0.1,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
