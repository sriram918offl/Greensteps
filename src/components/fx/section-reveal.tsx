"use client";
import * as React from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Scroll-driven section entrance — opacity 0 → 1, translateY `distance` → 0,
 * mapped to the section's own position relative to the viewport.
 *
 * Unlike `useInView` (which snaps in/out at threshold), this interpolates
 * continuously so the section visibly "emerges" as you scroll past it. Pair
 * it with a pinned section above so the new content reveals while the
 * previous one is still releasing — no harsh cut.
 *
 * Performance:
 *   • `transform` + `opacity` only — GPU-composited, no layout cost.
 *   • `will-change` is applied via class so the layer promotes once on
 *     mount and the browser drops it after the transition settles.
 *   • Honors prefers-reduced-motion — renders content statically.
 */
export function SectionReveal({
  children,
  distance = 40,
  className,
}: {
  children: React.ReactNode;
  distance?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Interpolates from when the section's top first touches the viewport
  // bottom (start) to when its top hits ~25% from the viewport top (end).
  // Tuned to feel like one continuous scroll, not a snap.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.25"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [distance, 0]);

  if (reduce) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      className={cn("will-change-[opacity,transform]", className)}
    >
      {children}
    </motion.div>
  );
}
