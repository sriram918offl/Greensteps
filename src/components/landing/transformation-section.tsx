"use client";
import { motion } from "framer-motion";
import { ParticleField } from "./particle-field";
import { useLowPower } from "@/components/fx/use-media";

/**
 * Carbon-to-leaves transformation section. Dark sky at top, emerald canvas
 * below. Particles drift up and morph from carbon to leaves halfway through.
 */
export function TransformationSection() {
  const lowPower = useLowPower();
  return (
    <section className="relative overflow-hidden py-20" aria-label="Carbon to leaves transformation">
      <div className="relative mx-auto max-w-5xl px-4">
        {/* Glass card so the ambient backdrop reads through. The particles
            sit on a subtle teal-emerald glaze, not a solid block of bg. */}
        <div className="relative h-[420px] overflow-hidden rounded-3xl border border-white/10 bg-emerald-950/30 shadow-2xl backdrop-blur-2xl md:h-[480px]">
          {/* Thin top glow seam — makes the card feel like a moment in the
              same continuous flow instead of a separate page. */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent" />
          <ParticleField
            density={lowPower ? 22 : 60}
            className="absolute inset-0 h-full w-full"
          />

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300/80"
            >
              The transformation
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-3 max-w-2xl text-balance text-3xl font-bold leading-tight md:text-5xl"
            >
              Carbon becomes leaves.
              <br />
              <span className="bg-gradient-to-r from-emerald-200 to-teal-300 bg-clip-text text-transparent">
                Awareness becomes action.
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-4 max-w-md text-sm text-emerald-100/90"
            >
              Every choice you understand is one you can change. Watch carbon turn green.
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}
