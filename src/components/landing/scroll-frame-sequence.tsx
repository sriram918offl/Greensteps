"use client";
import * as React from "react";
import { motion, useMotionValue, useTransform, MotionValue } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { cn } from "@/lib/utils";
import { useLowPower } from "@/components/fx/use-media";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ----------------------------------------------------------------------------
// Scroll progress context — overlays subscribe to a single MotionValue (0..1).
// ----------------------------------------------------------------------------

const ScrollProgressContext = React.createContext<MotionValue<number> | null>(null);

export function useScrollFrameProgress() {
  const v = React.useContext(ScrollProgressContext);
  if (!v) throw new Error("useScrollFrameProgress must be used inside <QuoteScrollSection>");
  return v;
}

// ----------------------------------------------------------------------------
// Overlay quote — fades + slides in/out within a scroll-progress window.
// Cinematic positioning: large hero text, center/left/right.
// ----------------------------------------------------------------------------

export type OverlaySide = "center" | "left" | "right";

export interface ScrollOverlayProps {
  /** Visible window in scroll progress (0..1). */
  range: [number, number];
  side?: OverlaySide;
  /** Big quote/title. */
  title: string;
  /** Smaller subtitle below. */
  subtitle?: string;
  /** Optional attribution shown below the subtitle. */
  attribution?: string;
}

export function ScrollOverlay({
  range, side = "center", title, subtitle, attribution,
}: ScrollOverlayProps) {
  const progress = useScrollFrameProgress();
  const [start, end] = range;
  // Build a piecewise opacity that ramps up at the start and down at the end.
  const fadeIn = Math.min(0.06, (end - start) * 0.25);
  const fadeOut = Math.min(0.08, (end - start) * 0.3);

  const opacity = useTransform(
    progress,
    [start - 0.01, start + fadeIn, end - fadeOut, end + 0.01],
    [0, 1, 1, 0],
  );
  const y = useTransform(
    progress,
    [start, start + fadeIn, end - fadeOut, end],
    [40, 0, 0, -40],
  );
  const scale = useTransform(
    progress,
    [start, start + fadeIn, end - fadeOut, end],
    [0.96, 1, 1, 0.96],
  );

  // Mobile + tablet always centered for readability — only switch to
  // edge-aligned at lg+ where the viewport is wide enough to make the side
  // positioning feel intentional rather than ragged.
  const align =
    side === "left"
      ? "items-center text-center lg:items-start lg:text-left lg:pl-[7vw]"
      : side === "right"
        ? "items-center text-center lg:items-end lg:text-right lg:pr-[7vw]"
        : "items-center text-center";

  return (
    <motion.div
      style={{ opacity, y, scale }}
      className={cn(
        "pointer-events-none absolute inset-0 z-10 flex flex-col justify-center px-6",
        align,
      )}
      aria-hidden={false}
    >
      <h2
        className={cn(
          "text-balance font-semibold leading-[1.1] tracking-tight text-white/95",
          // Apple-scale: ~28px mobile → ~60px desktop max
          "text-[clamp(1.6rem,4vw,3.75rem)]",
          // Soft readability shadow — replaces heavy drop-shadow
          "[text-shadow:0_2px_18px_rgba(0,0,0,0.45)]",
          "max-w-[820px]",
        )}
        style={{ textWrap: "balance" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 max-w-[640px] text-balance text-sm leading-relaxed text-white/75 md:text-base lg:text-lg [text-shadow:0_1px_10px_rgba(0,0,0,0.4)]">
          {subtitle}
        </p>
      )}
      {attribution && (
        <p className="mt-3 text-xs uppercase tracking-[0.3em] text-white/55">
          — {attribution}
        </p>
      )}
    </motion.div>
  );
}

// ----------------------------------------------------------------------------
// HeroScene — the first "scene" of the pinned narrative.
//
// Unlike ScrollOverlay (which fades IN then OUT), HeroScene starts at full
// opacity (matching the initial page-load look) and only fades OUT as the
// user scrolls past `until`. Use this for the hero content (badge, headline,
// subtitle, CTAs) so it owns the first ~18% of the timeline.
// ----------------------------------------------------------------------------

export interface HeroSceneProps {
  /** Scroll progress at which the hero finishes fading out. */
  until: number;
  /** Hero content — typically badge + h1 + subtitle + CTAs. */
  children: React.ReactNode;
}

export function HeroScene({ until, children }: HeroSceneProps) {
  const progress = useScrollFrameProgress();
  const fadeOut = Math.min(0.08, until * 0.4);

  const opacity = useTransform(progress, [0, until - fadeOut, until], [1, 1, 0]);
  const y = useTransform(progress, [0, until - fadeOut, until], [0, 0, -50]);
  const scale = useTransform(progress, [0, until - fadeOut, until], [1, 1, 0.95]);

  return (
    <motion.div
      style={{ opacity, y, scale }}
      className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
    >
      <div className="pointer-events-auto flex flex-col items-center">
        {children}
      </div>
    </motion.div>
  );
}

// ----------------------------------------------------------------------------
// QuoteScrollSection — pinned scroll-driven narrative.
//
// One continuous experience: hero + 4 (or more) quotes share the same pinned
// viewport. Background is an ambient composition (deep emerald gradient +
// floating leaves + soft orbs + slow conic light rays + radial vignette).
//
// Drop HeroScene as the first child, then ScrollOverlay children — each
// fades in/out based on its scroll-progress range.
// ----------------------------------------------------------------------------

interface QuoteScrollSectionProps {
  /** How many viewport-heights tall the pinned region is. Default 6 — gives
   * each of 5 quotes ~1.2 vh of scroll. */
  scrollLength?: number;
  /** Quote overlays (ScrollOverlay) and any optional foreground content. */
  children?: React.ReactNode;
  /** Screen-reader label for the region. */
  ariaLabel?: string;
}

export function QuoteScrollSection({
  scrollLength = 6,
  children,
  ariaLabel = "Scroll-driven story",
}: QuoteScrollSectionProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const stickyRef = React.useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);
  // Touch / narrow viewport / data-saver users get a stripped composition.
  const lowPower = useLowPower();

  // The wrapper height MUST match the pin length, otherwise scroll past the
  // pin shows empty space. Starts at the prop (matches SSR), then the effect
  // trims it for mobile/tablet on mount.
  const [effectiveLength, setEffectiveLength] = React.useState(scrollLength);

  // Scroll-tied orb parallax — disabled on low-power devices where the
  // perf cost outweighs the depth cue.
  const orbX = useTransform(progress, [0, 1], ["0%", "-12%"]);
  const orbY = useTransform(progress, [0, 1], ["0%", "8%"]);

  React.useEffect(() => {
    const wrap = wrapRef.current;
    const sticky = stickyRef.current;
    if (!wrap || !sticky) return;

    // Shorter pin on small screens so users reach the chapters faster.
    const computeLength = () => {
      const w = window.innerWidth;
      if (w < 640) return Math.min(scrollLength, 3);  // phones
      if (w < 1024) return Math.min(scrollLength, 4); // tablets
      return scrollLength;
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      // No pin/scroll narrative — collapse the wrapper to one viewport and
      // show the hero scene. No empty scroll space.
      setEffectiveLength(0);
      progress.set(0);
      return;
    }

    // Keep wrapper height in lockstep with the pin length (fixes the empty
    // gap after the hero on mobile, where the pin ends before the wrapper did).
    setEffectiveLength(computeLength());

    const trigger = ScrollTrigger.create({
      trigger: wrap,
      start: "top top",
      end: () => `+=${computeLength() * window.innerHeight}`,
      pin: sticky,
      // Default "transform" pinType — far faster than "fixed" on iOS Safari.
      anticipatePin: 1,
      scrub: 0.6,
      fastScrollEnd: true,
      onUpdate: (self) => progress.set(self.progress),
      invalidateOnRefresh: true,
    });

    // ─── Robust re-measure (fixes "scroll dead until refresh" on mobile) ──
    // The <IntroSplash> locks body scroll (overflow:hidden) for ~2.4s on the
    // first visit. If ScrollTrigger measures the pin during that window the
    // dimensions are wrong and scrolling looks frozen until a manual reload
    // (which skips the splash via sessionStorage). Re-measuring after fonts
    // load, after window 'load', and once past the splash window makes the
    // very first load behave like a refreshed one.
    const refresh = () => ScrollTrigger.refresh();
    const onResize = () => {
      setEffectiveLength(computeLength());
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("load", refresh);
    if (document.fonts?.ready) document.fonts.ready.then(refresh).catch(() => {});
    const t1 = setTimeout(refresh, 400);
    const t2 = setTimeout(refresh, 2700); // after the intro splash unlocks scroll

    return () => {
      trigger.kill();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", refresh);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [scrollLength, progress]);

  return (
    <ScrollProgressContext.Provider value={progress}>
      <div
        ref={wrapRef}
        className="relative"
        // Height tracks the (possibly mobile-trimmed) pin length + 1 viewport
        // for the exit. svh keeps it stable as mobile chrome shows/hides.
        style={{ height: `${(effectiveLength + 1) * 100}svh` }}
        aria-label={ariaLabel}
        role="region"
      >
        <div
          ref={stickyRef}
          className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden"
        >
          {/* The full ambient backdrop lives globally as <AmbientBackdrop />
              (fixed-position behind the whole page). We only render the
              section-specific overlays here so the quote text always reads
              against a slightly-darker centre + softer edges. */}

          {/* Pin-tied parallax orbs — these are NOT in the global backdrop
              because their drift is tied to the pinned scroll progress
              (not the document scroll). Gives the hero a richer feel during
              its 5-vh pin window. Desktop only. */}
          {!lowPower && (
            <motion.div
              aria-hidden
              className="absolute inset-0 overflow-hidden will-change-transform"
              style={{ x: orbX, y: orbY }}
            >
              <div className="absolute left-[18%] top-[22%] h-[44vmin] w-[44vmin] rounded-full bg-emerald-400/18 blur-[100px]" />
              <div className="absolute right-[14%] top-[60%] h-[36vmin] w-[36vmin] rounded-full bg-teal-300/16 blur-[100px]" />
            </motion.div>
          )}

          {/* Vignette intentionally removed — it darkened the sticky element's
              edges which created a visible "hero floor" line when the pin
              released. Quote text already has a built-in shadow for contrast
              against the global backdrop. */}

          {/* Quote overlays + optional foreground content */}
          {children}
        </div>
      </div>
    </ScrollProgressContext.Provider>
  );
}
