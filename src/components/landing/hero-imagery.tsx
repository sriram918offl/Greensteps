"use client";
import * as React from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

const LAYERS = [
  {
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80&auto=format&fit=crop",
    alt: "Aerial view of a green forest canopy",
    className: "left-[8%] top-[15%] h-[44%] w-[28%] rotate-[-4deg]",
  },
  {
    src: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1600&q=80&auto=format&fit=crop",
    alt: "Solar panel field at sunset",
    className: "right-[6%] bottom-[10%] h-[40%] w-[26%] rotate-[3deg]",
  },
  {
    src: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=1600&q=80&auto=format&fit=crop",
    alt: "Wind turbine on a hillside",
    className: "left-[18%] bottom-[8%] h-[34%] w-[22%] rotate-[2deg]",
  },
];

/**
 * Hero background imagery — three floating eco photos with subtle parallax.
 * Sits behind the gradient + grid, so it adds richness without competing with
 * the foreground text.
 */
export function HeroImagery() {
  const { scrollY } = useScroll();
  const yA = useTransform(scrollY, [0, 800], [0, -60]);
  const yB = useTransform(scrollY, [0, 800], [0, -90]);
  const yC = useTransform(scrollY, [0, 800], [0, -40]);
  const ys = [yA, yB, yC];

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {LAYERS.map((l, i) => (
        <motion.div
          key={i}
          style={{ y: ys[i] }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{ delay: 0.2 + i * 0.15, duration: 1.2, ease: "easeOut" }}
          className={`absolute overflow-hidden rounded-3xl shadow-2xl ring-1 ring-emerald-400/20 ${l.className}`}
        >
          <Image
            src={l.src}
            alt={l.alt}
            fill
            sizes="(min-width:1024px) 28vw, 50vw"
            className="object-cover"
            priority={i === 0}
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 via-transparent to-teal-500/40 mix-blend-multiply" />
        </motion.div>
      ))}
    </div>
  );
}
