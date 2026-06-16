"use client";
import * as React from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  Bike, Car, Flame, Leaf, Plug, Salad, ShoppingBag, Sparkles, Sun,
  TrendingDown, Wind,
} from "lucide-react";

/**
 * Story-section visuals. Each piece:
 *   • Triggers its scroll-into-view animation once via IntersectionObserver
 *     (via Framer's `useInView`, ~0.3 amount).
 *   • Respects prefers-reduced-motion — looping animations fall back to
 *     static positions, count-ups jump to their end value.
 *   • Uses transform/opacity only — GPU friendly, no layout thrash.
 */

// ───── shared utilities ─────────────────────────────────────────────────────

interface CountUpOptions {
  duration?: number;
  decimals?: number;
  reduce?: boolean;
}

function useCountUp(to: number, trigger: boolean, opts: CountUpOptions = {}): number {
  const { duration = 1400, decimals = 0, reduce = false } = opts;
  const [value, setValue] = React.useState<number>(reduce ? to : 0);

  React.useEffect(() => {
    if (!trigger) return;
    if (reduce) { setValue(to); return; }
    let raf = 0;
    const start = performance.now();
    const factor = 10 ** decimals;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const v = to * eased;
      setValue(Math.round(v * factor) / factor);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [trigger, to, duration, decimals, reduce]);

  return value;
}

function useRevealRef() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion() ?? false;
  return { ref, inView, reduce };
}

// ───── 1) Civic atlas — planet over starfield ────────────────────────────────

export function VisualResponsibility() {
  const { ref, inView, reduce } = useRevealRef();

  // Predeclare star positions so they don't shift between renders.
  const stars = React.useMemo(
    () =>
      Array.from({ length: 44 }, (_, i) => ({
        left: `${(i * 73) % 100}%`,
        top: `${(i * 31) % 100}%`,
        size: 1 + (i % 3),
        baseOpacity: 0.25 + ((i % 5) / 14),
        twinkleDur: 2.2 + ((i * 7) % 11) * 0.3,
        twinkleDelay: (i % 9) * 0.25,
      })),
    [],
  );

  return (
    <div
      ref={ref}
      className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-8 shadow-2xl"
    >
      {/* Twinkling stars */}
      {stars.map((s, i) => (
        <motion.span
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            background: "white",
            borderRadius: 9999,
            opacity: s.baseOpacity,
          }}
          animate={reduce ? undefined : { opacity: [s.baseOpacity, 0.95, s.baseOpacity] }}
          transition={{
            duration: s.twinkleDur,
            delay: s.twinkleDelay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Outer glow pulse */}
      {!reduce && (
        <motion.div
          className="absolute inset-1/4 rounded-full bg-emerald-400/30 blur-2xl"
          animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.65, 0.35] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Planet: rotation + breathing scale */}
      <motion.div
        className="absolute inset-1/4 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 shadow-[0_0_80px_rgba(16,185,129,0.5)]"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={
          reduce
            ? { scale: 1, opacity: 1 }
            : inView
              ? { scale: [1, 1.04, 1], rotate: 360, opacity: 1 }
              : { scale: 0.92, opacity: 0 }
        }
        transition={{
          scale:   { duration: 6,  repeat: Infinity, ease: "easeInOut" },
          rotate:  { duration: 40, repeat: Infinity, ease: "linear" },
          opacity: { duration: 0.6, ease: "easeOut" },
        }}
      >
        <div className="absolute inset-3 rounded-full bg-gradient-to-tr from-emerald-300/30 to-blue-500/40 blur-md" />
      </motion.div>

      {/* Atmosphere ring */}
      <motion.div
        className="absolute inset-1/4 rounded-full border border-emerald-300/30"
        animate={reduce ? undefined : { scale: [1, 1.09, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// ───── 2) Small actions — 4 tiles with stagger + hover ──────────────────────

export function VisualSmallActions() {
  const { ref, inView, reduce } = useRevealRef();

  const items = [
    { icon: Bike, label: "Cycle", grad: "from-emerald-400 to-emerald-600", glow: "shadow-emerald-500/40" },
    { icon: Wind, label: "Wind",  grad: "from-sky-400 to-sky-600",         glow: "shadow-sky-500/40"     },
    { icon: Sun,  label: "Solar", grad: "from-amber-400 to-amber-600",     glow: "shadow-amber-500/40"   },
    { icon: Leaf, label: "Plant", grad: "from-lime-400 to-lime-600",       glow: "shadow-lime-500/40"    },
  ];

  return (
    <div
      ref={ref}
      className="relative grid aspect-square grid-cols-2 gap-4 rounded-3xl bg-gradient-to-br from-sky-50 to-emerald-50 p-8 shadow-2xl dark:from-sky-950/40 dark:to-emerald-950/40"
    >
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <motion.div
            key={it.label}
            initial={{ y: 24, opacity: 0, scale: 0.92 }}
            animate={
              inView
                ? { y: 0, opacity: 1, scale: 1 }
                : { y: 24, opacity: 0, scale: 0.92 }
            }
            transition={{ delay: i * 0.12, duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
            whileHover={
              reduce
                ? undefined
                : { y: -6, scale: 1.04, transition: { duration: 0.25 } }
            }
            className={`group relative flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${it.grad} p-6 text-white shadow-xl ${it.glow} transition-shadow hover:shadow-2xl`}
          >
            <Icon className="h-10 w-10 transition-transform duration-300 group-hover:scale-110" />
            <p className="mt-2 text-sm font-semibold">{it.label}</p>
            {/* Glow halo on hover */}
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br ${it.grad} opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-60`}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

// ───── 3) Impact bars + total + biggest lever + sparkline (FILLED) ──────────

interface BarSource {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  pct: number;
  color: string;
}

export function VisualImpactBars() {
  const { ref, inView, reduce } = useRevealRef();

  const sources: BarSource[] = [
    { icon: Car,         label: "Transport", pct: 27, color: "bg-emerald-500" },
    { icon: Plug,        label: "Energy",    pct: 39, color: "bg-sky-500"     },
    { icon: Salad,       label: "Food",      pct: 18, color: "bg-amber-500"   },
    { icon: ShoppingBag, label: "Shopping",  pct: 16, color: "bg-rose-500"    },
  ];
  const biggest = sources.reduce((acc, s) => (s.pct > acc.pct ? s : acc), sources[0]);
  const BiggestIcon = biggest.icon;

  const total = useCountUp(842, inView, { reduce });
  const trendPct = useCountUp(18, inView, { reduce, duration: 1100 });

  return (
    <div
      ref={ref}
      className="relative flex aspect-square flex-col rounded-3xl bg-card p-6 shadow-2xl md:p-7"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Where emissions come from
        </p>
        <Flame className="h-5 w-5 text-orange-500" aria-hidden />
      </div>

      {/* Bars */}
      <div className="mt-5 space-y-3.5">
        {sources.map((s, i) => (
          <BarRow key={s.label} src={s} delayBase={0.1 + i * 0.09} inView={inView} reduce={reduce} />
        ))}
      </div>

      {/* Divider */}
      <div className="my-4 h-px bg-border/80" />

      {/* Total + Biggest lever callout */}
      <div className="flex flex-wrap items-stretch justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Total / month
          </p>
          <p className="mt-0.5 font-mono text-3xl font-bold leading-none tracking-tight">
            {total.toLocaleString()}
            <span className="ml-1 text-xs font-medium text-muted-foreground">kg CO₂</span>
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
          transition={{ delay: 0.6, duration: 0.55 }}
          className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2"
        >
          <p className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-sky-700 dark:text-sky-300">
            <Sparkles className="h-3 w-3" /> Biggest lever
          </p>
          <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-semibold">
            <BiggestIcon className="h-3.5 w-3.5 text-sky-500" />
            {biggest.label} · −20% saves ~66 kg
          </p>
        </motion.div>
      </div>

      {/* Sparkline */}
      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          <span>6-month trend</span>
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <TrendingDown className="h-3 w-3" /> −{trendPct}%
          </span>
        </div>
        <Sparkline inView={inView} reduce={reduce} />
      </div>
    </div>
  );
}

interface BarRowProps {
  src: BarSource;
  delayBase: number;
  inView: boolean;
  reduce: boolean;
}

function BarRow({ src, delayBase, inView, reduce }: BarRowProps) {
  const pct = useCountUp(src.pct, inView, { reduce, duration: 1100 });
  const Icon = src.icon;
  return (
    <div>
      <div className="flex items-center justify-between text-sm font-medium">
        <span className="inline-flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {src.label}
        </span>
        <span className="font-mono tabular-nums">{pct}%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${src.pct}%` } : { width: 0 }}
          transition={{ delay: delayBase, duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
          className={`h-full rounded-full ${src.color}`}
        />
      </div>
    </div>
  );
}

interface SparklineProps {
  inView: boolean;
  reduce: boolean;
}

function Sparkline({ inView, reduce }: SparklineProps) {
  // Last 7 monthly readings, gentle downward trend.
  const data = [78, 76, 70, 67, 63, 58, 52];
  const W = 200;
  const H = 36;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(1, max - min);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return { x, y };
  });
  const line = pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  const area = `${line} L ${W} ${H} L 0 ${H} Z`;
  const last = pts[pts.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-1.5 h-9 w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <motion.path
        d={area}
        fill="url(#spark-fill)"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: reduce ? 0 : 1.4, duration: 0.6 }}
      />
      {/* Line */}
      <motion.path
        d={line}
        fill="none"
        stroke="rgb(16, 185, 129)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ delay: reduce ? 0 : 0.7, duration: 1.2, ease: "easeOut" }}
      />
      {/* End dot */}
      <motion.circle
        cx={last.x}
        cy={last.y}
        r="2.5"
        fill="rgb(16, 185, 129)"
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ delay: reduce ? 0 : 1.7, duration: 0.4 }}
      />
    </svg>
  );
}

// ───── 4) Awareness — 842 kg + progress ring + equivalences (FILLED) ────────

export function VisualAwareness() {
  const { ref, inView, reduce } = useRevealRef();

  const kg = useCountUp(842, inView, { reduce });
  const belowPct = useCountUp(17, inView, { reduce, duration: 1100 });

  const rows: { label: string; value: string }[] = [
    { label: "🍔 Chicken burgers",       value: "421" },
    { label: "🌳 Trees to offset",       value: "32"  },
    { label: "✈️ Mumbai → Delhi flights", value: "3.4" },
  ];

  return (
    <div
      ref={ref}
      className="relative flex aspect-square flex-col rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-6 text-white shadow-2xl md:p-7"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wider text-white/70">CO₂ revealed</p>
        <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
          Your monthly
        </span>
      </div>

      {/* Hero number + donut ring (uses the same row to fill the upper half) */}
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-5xl font-bold leading-[0.95] md:text-6xl">
            {kg.toLocaleString()}
            <span className="ml-1 text-xl font-medium md:text-2xl">kg</span>
          </p>
          <p className="mt-2 text-sm text-white/85">
            <span className="font-semibold">{belowPct}%</span> below India average
          </p>
        </div>

        <div className="relative h-20 w-20 shrink-0 md:h-24 md:w-24">
          <ProgressRing inView={inView} reduce={reduce} fill={0.83} />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="font-mono text-base font-bold leading-none">{belowPct}%</p>
            <p className="text-[8px] uppercase tracking-widest text-white/75">below avg</p>
          </div>
        </div>
      </div>

      {/* Spacer + horizontal label so middle isn't dead air */}
      <div className="mt-5 flex items-center gap-2">
        <span className="h-px flex-1 bg-white/25" />
        <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/55">
          Or in plain English
        </span>
        <span className="h-px flex-1 bg-white/25" />
      </div>

      {/* Equivalence rows — stagger fade-in. Use mt-auto + space-y so they
          distribute downward and the middle of the card never gaps out. */}
      <div className="mt-4 flex flex-col gap-2.5">
        {rows.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ delay: reduce ? 0 : 0.55 + i * 0.12, duration: 0.5 }}
            className="flex items-center justify-between rounded-xl bg-white/15 px-3 py-2 backdrop-blur"
          >
            <span className="text-sm">{c.label}</span>
            <span className="font-mono text-sm font-bold tabular-nums">{c.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

interface ProgressRingProps {
  inView: boolean;
  reduce: boolean;
  fill: number; // 0..1
}

function ProgressRing({ inView, reduce, fill }: ProgressRingProps) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
      <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="9" />
      <motion.circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="white"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: reduce ? circumference * (1 - fill) : circumference }}
        animate={
          inView
            ? { strokeDashoffset: circumference * (1 - fill) }
            : { strokeDashoffset: circumference }
        }
        transition={{ delay: reduce ? 0 : 0.35, duration: 1.4, ease: [0.22, 0.61, 0.36, 1] }}
      />
    </svg>
  );
}

// ───── 5) Future — sunset, drifting hills, silhouettes ─────────────────────

export function VisualFuture() {
  const { ref, inView, reduce } = useRevealRef();

  return (
    <div
      ref={ref}
      className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-b from-sky-300 via-amber-200 to-emerald-200 shadow-2xl dark:from-indigo-900 dark:via-rose-900 dark:to-emerald-900"
    >
      {/* Sun — bobbing + glow pulse */}
      <motion.div
        className="absolute left-1/2 top-[28%] h-28 w-28 -translate-x-1/2"
        animate={reduce ? undefined : { y: [-5, 5, -5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-200 to-orange-400"
          animate={
            reduce
              ? undefined
              : {
                  boxShadow: [
                    "0 0 50px rgba(251,191,36,0.45)",
                    "0 0 110px rgba(251,191,36,0.75)",
                    "0 0 50px rgba(251,191,36,0.45)",
                  ],
                }
          }
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Soft halo */}
        {!reduce && (
          <motion.div
            className="absolute -inset-6 rounded-full bg-amber-300/30 blur-2xl"
            animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </motion.div>

      {/* Three hill layers with slow opposing drift = parallax wave */}
      <motion.svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
        animate={reduce ? undefined : { x: [0, -10, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M0 200 V120 Q 100 60 200 100 T 400 90 V200 Z" fill="#10b981" opacity="0.85" />
      </motion.svg>
      <motion.svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
        animate={reduce ? undefined : { x: [0, 8, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <path d="M0 200 V150 Q 80 100 180 130 T 400 130 V200 Z" fill="#047857" opacity="0.9" />
      </motion.svg>
      <motion.svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
        animate={reduce ? undefined : { x: [0, -6, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <path d="M0 200 V170 Q 100 140 220 160 T 400 160 V200 Z" fill="#064e3b" />
      </motion.svg>

      {/* Children silhouettes — appear on reveal */}
      <motion.svg
        className="absolute bottom-12 left-1/2 w-24 -translate-x-1/2"
        viewBox="0 0 100 60"
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ delay: 0.55, duration: 0.7 }}
        aria-hidden
      >
        <circle cx="32" cy="20" r="8" fill="#0f172a" />
        <path d="M32 28 L32 48 M22 38 L42 38 M28 60 L26 48 M36 60 L38 48" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" fill="none" />
        <circle cx="68" cy="22" r="6" fill="#0f172a" />
        <path d="M68 28 L68 44 M60 36 L76 36 M64 56 L62 44 M72 56 L74 44" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
      </motion.svg>
    </div>
  );
}
