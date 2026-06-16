"use client";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function ScrollIndicator({ label = "Scroll to explore" }: { label?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6 }}
      className="pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center gap-2"
      aria-hidden
    >
      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
      <div className="relative grid h-9 w-6 place-items-start overflow-hidden rounded-full border border-muted-foreground/40">
        {!reduce && (
          <motion.span
            className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500"
            animate={{ y: [0, 16, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        {reduce && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />}
      </div>
      <motion.div
        animate={reduce ? undefined : { y: [0, 4, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="text-muted-foreground"
      >
        <ChevronDown className="h-4 w-4" />
      </motion.div>
    </motion.div>
  );
}
