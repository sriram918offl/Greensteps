"use client";
import { motion } from "framer-motion";
import type { ComparisonCard } from "@/lib/factors";
import { cn } from "@/lib/utils";

export function ComparisonGrid({ items }: { items: ComparisonCard[] }) {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it, i) => (
        <motion.div
          key={it.label}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: i * 0.06, duration: 0.3 }}
          className={cn(
            "group relative overflow-hidden rounded-2xl border p-6 transition-all hover:-translate-y-1",
            it.category === "shocking" && "border-rose-500/30 bg-rose-500/5 hover:shadow-xl hover:shadow-rose-500/10",
            it.category === "everyday" && "border-amber-500/30 bg-amber-500/5 hover:shadow-xl hover:shadow-amber-500/10",
            it.category === "positive" && "border-emerald-500/30 bg-emerald-500/5 hover:shadow-xl hover:shadow-emerald-500/10",
          )}
        >
          <div className="text-4xl">{it.emoji}</div>
          <p className="mt-3 font-mono text-3xl font-bold tracking-tight">
            {typeof it.value === "number" && it.value > 1000 ? it.value.toLocaleString() : it.value}
          </p>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{it.unit}</p>
          <p className="mt-3 text-sm font-medium">{it.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
