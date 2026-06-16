"use client";
import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Stats {
  calculations: number;
  pledges: number;
  co2RevealedKg: number;
  co2PledgedKg: number;
}

export function LiveCounter() {
  const [stats, setStats] = React.useState<Stats | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as Stats;
        if (!cancelled) setStats(data);
      } catch {
        // Network blip — show fallback below
      }
    }
    load();
    const t = setInterval(load, 15_000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  const displayed = stats?.co2RevealedKg ?? 0;
  const value = useMotionValue(displayed);
  React.useEffect(() => { value.set(displayed); }, [displayed, value]);
  const spring = useSpring(value, { stiffness: 80, damping: 18 });
  const text = useTransform(spring, (v) => Math.round(v).toLocaleString());

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass inline-flex items-center gap-3 rounded-full px-4 py-2"
      aria-live="polite"
    >
      <span className="relative grid h-2 w-2 place-items-center" aria-hidden>
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/50" />
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span className="font-mono text-sm tabular-nums">
        <motion.span>{text}</motion.span>{" "}
        <span className="text-muted-foreground">
          {stats ? "kg CO₂ revealed by GreenSteps users" : "Loading awareness counter…"}
        </span>
      </span>
    </motion.div>
  );
}
