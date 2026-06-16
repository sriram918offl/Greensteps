"use client";
import * as React from "react";
import { motion, useMotionValue, useAnimationFrame, useReducedMotion } from "framer-motion";
import { Pause, Play, Quote } from "lucide-react";

const VOICES = [
  { quote: "There is no Planet B.", author: "Ban Ki-moon", role: "Former UN Secretary-General" },
  { quote: "We are the first generation to feel the impact of climate change, and the last that can do something about it.", author: "Barack Obama", role: "44th US President" },
  { quote: "The greatest threat to our planet is the belief that someone else will save it.", author: "Robert Swan", role: "Polar explorer" },
  { quote: "We do not inherit the earth from our ancestors; we borrow it from our children.", author: "Native American proverb", role: "" },
  { quote: "The Earth is what we all have in common.", author: "Wendell Berry", role: "Poet & farmer" },
  { quote: "I want you to act as if our house is on fire. Because it is.", author: "Greta Thunberg", role: "Climate activist" },
  { quote: "We don't have time to sit on our hands as our planet burns.", author: "Leonardo DiCaprio", role: "UN Messenger of Peace" },
  { quote: "Climate change is the defining issue of our time.", author: "António Guterres", role: "UN Secretary-General" },
];

export function VoicesMarquee() {
  const reel = React.useMemo(() => [...VOICES, ...VOICES], []);
  const reduceMotion = useReducedMotion();
  const [paused, setPaused] = React.useState(reduceMotion ?? false);
  const x = useMotionValue(0);
  const widthRef = React.useRef<HTMLDivElement>(null);
  const speedPxPerMs = 0.04; // ~145 px/s

  useAnimationFrame((_t, delta) => {
    if (paused) return;
    const w = widthRef.current?.scrollWidth ?? 0;
    if (!w) return;
    const half = w / 2;
    const next = x.get() - delta * speedPxPerMs;
    x.set(next <= -half ? 0 : next);
  });

  return (
    <div className="relative overflow-hidden py-2">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        className="absolute right-3 top-3 z-20 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/70 text-foreground shadow ring-1 ring-border backdrop-blur transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        aria-label={paused ? "Resume quote marquee" : "Pause quote marquee"}
        aria-pressed={paused}
      >
        {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
      </button>

      <motion.div
        ref={widthRef}
        className="flex gap-5"
        style={{ x }}
        role="region"
        aria-label="Climate leader quotes"
        onMouseEnter={() => !reduceMotion && setPaused(true)}
        onMouseLeave={() => !reduceMotion && setPaused(false)}
      >
        {reel.map((v, i) => (
          <article key={i} className="glass shrink-0 w-[340px] rounded-2xl border border-border/50 p-5">
            <Quote className="h-5 w-5 text-emerald-500" aria-hidden />
            <p className="mt-2 text-sm leading-relaxed">&ldquo;{v.quote}&rdquo;</p>
            <p className="mt-3 text-xs">
              <span className="font-semibold">{v.author}</span>
              {v.role && <span className="text-muted-foreground"> · {v.role}</span>}
            </p>
          </article>
        ))}
      </motion.div>
    </div>
  );
}
