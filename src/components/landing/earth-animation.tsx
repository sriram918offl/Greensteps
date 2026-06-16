"use client";
import { motion } from "framer-motion";

export function EarthAnimation() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 shadow-[0_0_120px_rgba(16,185,129,0.45)]"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-3 rounded-full bg-gradient-to-tr from-emerald-300/30 to-teal-500/40 blur-md" />
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full text-emerald-100/80 mix-blend-overlay">
          <path
            fill="currentColor"
            d="M50 60c10-15 30-20 45-10s30 25 20 45-30 30-50 25-25-25-25-40 0-15 10-20z"
          />
          <path
            fill="currentColor"
            d="M110 30c8-3 18 4 22 14s-3 22-13 24-22-3-22-15 5-21 13-23z"
            opacity=".7"
          />
          <path
            fill="currentColor"
            d="M140 110c10 2 18 12 17 22s-12 18-25 16-22-15-18-26 16-14 26-12z"
            opacity=".7"
          />
        </svg>
      </motion.div>

      <motion.div
        className="absolute -inset-4 rounded-full border border-emerald-300/30"
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute -inset-10 rounded-full border border-emerald-300/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="absolute -right-4 top-8 grid h-8 w-8 place-items-center rounded-full bg-white text-emerald-600 shadow-xl"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        🌱
      </motion.div>
      <motion.div
        className="absolute -left-2 bottom-12 grid h-10 w-10 place-items-center rounded-full bg-white text-teal-600 shadow-xl"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      >
        🌿
      </motion.div>
      <motion.div
        className="absolute right-10 -bottom-2 grid h-9 w-9 place-items-center rounded-full bg-white text-emerald-700 shadow-xl"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 2 }}
      >
        ☀️
      </motion.div>
    </div>
  );
}
