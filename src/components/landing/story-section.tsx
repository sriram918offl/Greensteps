"use client";
import * as React from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StorySectionProps {
  index: number;                       // 1-based — used for the chapter mark
  side: "left" | "right";              // which side the *visual* sits on
  eyebrow: string;
  quote: string;
  attribution?: string;
  body: React.ReactNode;
  visual: React.ReactNode;
  accent?: "emerald" | "sky" | "lime" | "teal";
}

const ACCENTS = {
  emerald: { ring: "ring-emerald-400/40", text: "text-emerald-500", glow: "bg-emerald-400/20" },
  sky:     { ring: "ring-sky-400/40",     text: "text-sky-500",     glow: "bg-sky-400/20"     },
  lime:    { ring: "ring-lime-400/40",    text: "text-lime-500",    glow: "bg-lime-400/20"    },
  teal:    { ring: "ring-teal-400/40",    text: "text-teal-500",    glow: "bg-teal-400/20"    },
} as const;

/**
 * Alternating chapter section. Text + visual columns swap sides via `side`.
 *
 * Text alignment rules (per latest brief):
 *   • Always left-aligned for readability, on mobile AND desktop.
 *   • Constrained to `max-w-xl` so line lengths are consistent across chapters.
 *   • On lg+, when the text column lives on the right (i.e. `side="left"` would
 *     place the visual on the left → text on the right), the text block hugs
 *     the right edge via `lg:ml-auto`. Reading direction stays left-to-right.
 *
 * Reveal animation: each child of the text column fades+slides in with a small
 * stagger, so the user feels the section assemble rather than appear flat.
 */
export function StorySection({
  index, side, eyebrow, quote, attribution, body, visual, accent = "emerald",
}: StorySectionProps) {
  const reduce = useReducedMotion() ?? false;
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  const a = ACCENTS[accent];
  const visualOnLeft = side === "left";
  // Text lives on the opposite side of the visual.
  const textOnRight = visualOnLeft === false ? false : true;
  // (Above is just a clarification — when `side="left"` the visual is left
  //  and the text is right. The `lg:[&>*:first-child]:order-2` keeps the
  //  first DOM child — the text — in column 2 on lg+.)
  const _textIsRight = side === "left";

  // Stagger settings — keep transforms small (≤16 px) to avoid layout jitter.
  const easeOut = [0.22, 0.61, 0.36, 1] as const;
  const revealUp = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    animate: inView
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: reduce ? 0 : 16 },
    transition: { delay: reduce ? 0 : delay, duration: 0.6, ease: easeOut },
  });

  return (
    <section ref={ref} className="relative py-24 md:py-32">
      {/* Off-screen accent glow */}
      <div
        aria-hidden
        className={cn(
          "absolute -z-10 h-[60vmin] w-[60vmin] rounded-full blur-3xl",
          a.glow,
          visualOnLeft ? "left-[-20vmin] top-1/4" : "right-[-20vmin] top-1/4",
        )}
      />

      <div className="container mx-auto px-4">
        <div
          className={cn(
            "grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
            // Put the visual on the LEFT when side="left", which means the
            // text (first DOM child) needs to be visually in column 2.
            visualOnLeft && "lg:[&>*:first-child]:order-2",
          )}
        >
          {/* ─── Text column ─────────────────────────────────────────────── */}
          <div
            className={cn(
              "max-w-xl space-y-5 text-left",
              // When the text sits in the right column on desktop, hug the
              // right edge so the block lines up with the visual.
              _textIsRight && "lg:ml-auto",
            )}
          >
            {/* Chapter mark */}
            <motion.div
              {...revealUp(0)}
              className={cn(
                "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]",
                a.text,
              )}
            >
              <span className="font-mono">Chapter {String(index).padStart(2, "0")}</span>
              <span aria-hidden className="h-px w-8 bg-current opacity-50" />
              {eyebrow}
            </motion.div>

            {/* Quote glyph */}
            <motion.div {...revealUp(0.08)}>
              <Quote className={cn("h-8 w-8", a.text)} aria-hidden />
            </motion.div>

            {/* Headline */}
            <motion.h2
              {...revealUp(0.16)}
              className="text-balance text-3xl font-bold leading-[1.15] tracking-tight md:text-4xl lg:text-[42px]"
              style={{ textWrap: "balance" }}
            >
              &ldquo;{quote}&rdquo;
            </motion.h2>

            {attribution && (
              <motion.p
                {...revealUp(0.22)}
                className="text-sm text-muted-foreground"
              >
                — {attribution}
              </motion.p>
            )}

            {/* Body copy (may include CTA buttons via `body` prop) */}
            <motion.div
              {...revealUp(0.28)}
              className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert md:prose-base"
            >
              {body}
            </motion.div>
          </div>

          {/* ─── Visual column ───────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: reduce ? 1 : 0.94 }}
            animate={
              inView
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: reduce ? 1 : 0.94 }
            }
            transition={{ duration: 0.85, ease: easeOut, delay: reduce ? 0 : 0.12 }}
            className={cn("relative rounded-3xl ring-1 ring-offset-0", a.ring)}
          >
            {visual}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
