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
  if (!v) throw new Error("useScrollFrameProgress must be used inside <ScrollFrameSequence>");
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

  // Scroll-tied orb parallax — disabled on low-power devices where the
  // perf cost outweighs the depth cue.
  const orbX = useTransform(progress, [0, 1], ["0%", "-12%"]);
  const orbY = useTransform(progress, [0, 1], ["0%", "8%"]);

  React.useEffect(() => {
    const wrap = wrapRef.current;
    const sticky = stickyRef.current;
    if (!wrap || !sticky) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      // No pin — show all overlays "static" by holding progress at midpoint
      progress.set(0.5);
      return;
    }

    // ─── Mobile / tablet tuning ──────────────────────────────────────
    // 1) Use 100svh (small viewport) so address-bar collapse on iOS / Android
    //    doesn't yank the pin's end position mid-scroll.
    // 2) Trim scrollLength on narrow screens so the pin doesn't drag forever —
    //    users get to the storyline content faster.
    // 3) `pinType: "fixed"` is more reliable than transform-based pinning on
    //    mobile WebKit where layout shifts can desync the sticky element.
    const computeLength = () => {
      const w = window.innerWidth;
      if (w < 640) return Math.min(scrollLength, 3);  // phones: short pin
      if (w < 1024) return Math.min(scrollLength, 4); // tablets
      return scrollLength;
    };

    const trigger = ScrollTrigger.create({
      trigger: wrap,
      start: "top top",
      end: () => `+=${computeLength() * window.innerHeight}`,
      pin: sticky,
      // `pinType: "transform"` (default) is materially faster than "fixed"
      // on iOS Safari — fixed positioning forces layer thrash on every
      // scroll event. Reliability is fine because we already use 100svh.
      anticipatePin: 1,
      scrub: 0.6,
      fastScrollEnd: true,
      onUpdate: (self) => progress.set(self.progress),
      invalidateOnRefresh: true,
    });

    return () => { trigger.kill(); };
  }, [scrollLength, progress]);

  return (
    <ScrollProgressContext.Provider value={progress}>
      <div
        ref={wrapRef}
        className="relative"
        // Use svh so the wrap height stays stable as mobile chrome shows/hides.
        // Add 1 extra viewport for the pin's exit phase.
        style={{ height: `${(scrollLength + 1) * 100}svh` }}
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

          {/* Soft radial vignette: clear at centre for the quote, gentle
              dimming at edges so detail in the global backdrop doesn't
              compete with the headline. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 42%, rgba(2,6,23,0.30) 78%, rgba(2,6,23,0.55) 100%)",
            }}
          />

          {/* Quote overlays + optional foreground content */}
          {children}
        </div>
      </div>
    </ScrollProgressContext.Provider>
  );
}

// ----------------------------------------------------------------------------
// ScrollFrameSequence — main component.
// ----------------------------------------------------------------------------

interface ScrollFrameSequenceProps {
  /** Total number of frames. */
  frameCount: number;
  /** Folder containing the frames, e.g. "/frames". */
  framesDir: string;
  /** Base filename without extension or number, e.g. "frame_". */
  framePrefix?: string;
  /** Extension including dot, e.g. ".webp". */
  frameExt?: string;
  /** Zero-pad width — frame numbers are padded to this many digits. */
  framePadding?: number;
  /** Native frame width in px. */
  width: number;
  /** Native frame height in px. */
  height: number;
  /**
   * How many viewport-heights tall the pinned scroll region is.
   * Higher = slower / longer animation.
   */
  scrollLength?: number;
  /**
   * "cover" fills the viewport (may crop edges) — Apple style.
   * "contain" letterboxes — legacy fallback.
   */
  fit?: "cover" | "contain";
  /** Optional overlay children rendered above the canvas. */
  children?: React.ReactNode;
  /** Label for screen readers. */
  ariaLabel?: string;
}

export function ScrollFrameSequence({
  frameCount,
  framesDir,
  framePrefix = "frame_",
  frameExt = ".webp",
  framePadding = 3,
  width,
  height,
  scrollLength = 5,
  fit = "cover",
  children,
  ariaLabel = "Eco-footprint animation",
}: ScrollFrameSequenceProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const stickyRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [loadedCount, setLoadedCount] = React.useState(0);
  const [ready, setReady] = React.useState(false);
  const framesRef = React.useRef<HTMLImageElement[]>([]);
  const currentFrameRef = React.useRef(0);

  // Single MotionValue shared with overlays via context.
  const progress = useMotionValue(0);

  const framePath = React.useCallback(
    (i: number) => `${framesDir}/${framePrefix}${String(i).padStart(framePadding, "0")}${frameExt}`,
    [framesDir, framePrefix, frameExt, framePadding],
  );

  // 1. Preload every frame.
  React.useEffect(() => {
    let cancelled = false;
    const imgs: HTMLImageElement[] = new Array(frameCount);
    let done = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const bump = () => {
      if (cancelled) return;
      done++;
      setLoadedCount(done);
      if (done >= frameCount) setReady(true);
    };

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = framePath(i + 1);
      let settled = false;
      const settle = () => {
        if (settled) return;
        settled = true;
        bump();
      };
      img.onload = settle;
      img.onerror = () => {
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.warn(`[ScrollFrameSequence] frame ${i + 1} failed: ${img.src}`);
        }
        settle();
      };
      timers.push(setTimeout(settle, 8000));
      imgs[i] = img;
    }
    framesRef.current = imgs;

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [frameCount, framePath]);

  // 2. Canvas sizing + first paint.
  React.useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const sticky = stickyRef.current;
    if (!canvas || !sticky) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = sticky.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFrame(currentFrameRef.current);
    };

    function drawFrame(idx: number) {
      const ctxLocal = canvas?.getContext("2d", { alpha: false });
      if (!canvas || !ctxLocal) return;
      const safe = Math.max(0, Math.min(frameCount - 1, Math.round(idx)));
      const img = framesRef.current[safe];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      const cw = canvas.width / (window.devicePixelRatio || 1);
      const ch = canvas.height / (window.devicePixelRatio || 1);
      // cover (fill, may crop) vs contain (letterbox)
      const ratio = fit === "cover"
        ? Math.max(cw / width, ch / height)
        : Math.min(cw / width, ch / height);
      const dw = width * ratio;
      const dh = height * ratio;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;
      ctxLocal.fillStyle = "#020617";
      ctxLocal.fillRect(0, 0, cw, ch);
      ctxLocal.drawImage(img, dx, dy, dw, dh);
    }

    (canvas as unknown as { _draw: typeof drawFrame })._draw = drawFrame;

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [ready, frameCount, width, height, fit]);

  // 3. ScrollTrigger drives frame index AND the shared progress MotionValue.
  React.useEffect(() => {
    if (!ready) return;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const sticky = stickyRef.current;
    if (!wrap || !canvas || !sticky) return;

    const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduce) {
      const drawer = (canvas as unknown as { _draw?: (i: number) => void })._draw;
      if (drawer) drawer(frameCount - 1);
      progress.set(1);
      return;
    }

    const state = { frame: 0 };

    const trigger = ScrollTrigger.create({
      trigger: wrap,
      start: "top top",
      end: `+=${scrollLength * window.innerHeight}`,
      pin: sticky,
      anticipatePin: 1,
      scrub: 0.6,
      onUpdate: (self) => {
        state.frame = self.progress * (frameCount - 1);
        progress.set(self.progress);
      },
      invalidateOnRefresh: true,
    });

    let raf = 0;
    const drawer = (canvas as unknown as { _draw?: (i: number) => void })._draw;
    function loop() {
      const target = Math.round(state.frame);
      if (target !== currentFrameRef.current) {
        currentFrameRef.current = target;
        if (drawer) drawer(target);
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      trigger.kill();
    };
  }, [ready, frameCount, scrollLength, progress]);

  const pct = Math.round((loadedCount / frameCount) * 100);

  return (
    <ScrollProgressContext.Provider value={progress}>
      <div
        ref={wrapRef}
        className="relative bg-slate-950"
        style={{ height: `${(scrollLength + 1) * 100}vh` }}
        aria-label={ariaLabel}
        role="region"
      >
        <div
          ref={stickyRef}
          className="sticky top-0 h-[100svh] w-full overflow-hidden bg-slate-950"
        >
          {/* Canvas — full-bleed, behind everything */}
          <canvas
            ref={canvasRef}
            aria-hidden
            className="absolute inset-0 block h-full w-full"
          />

          {/* Subtle vignette — softer than before. Radial darkening at edges +
              a gentle bottom fade so CTA reads. No more harsh top/bottom slabs. */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.18) 70%, rgba(0,0,0,0.42) 100%), linear-gradient(to bottom, transparent 75%, rgba(0,0,0,0.35) 100%)",
            }}
          />

          {/* Loader overlay until preload completes */}
          {!ready && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-slate-950 text-white"
            >
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-2xl shadow-emerald-500/40">
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="currentColor">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                </svg>
              </div>
              <div className="w-56">
                <div className="mb-1 flex justify-between text-[10px] uppercase tracking-widest text-emerald-200/70">
                  <span>Loading scene</span>
                  <span className="font-mono">{pct}%</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Overlay content (passed as children) */}
          {children}
        </div>
      </div>
    </ScrollProgressContext.Provider>
  );
}
