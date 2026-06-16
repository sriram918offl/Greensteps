"use client";
import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EarthAnimation } from "./earth-animation";

/**
 * Hero centerpiece media. Tries to auto-play /videos/hero.mp4 (and .webm).
 * Falls back to the EarthAnimation when:
 *  - the video files aren't present (404)
 *  - the user has prefers-reduced-motion
 *  - the network is slow (videoEl.onerror fires)
 *
 * The fallback keeps the page beautiful even before you drop the video in.
 */
export function HeroMedia() {
  const reduceMotion = useReducedMotion();
  const [showFallback, setShowFallback] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Detect first paint failure quickly so we don't show a black box.
  React.useEffect(() => {
    if (reduceMotion) {
      setShowFallback(true);
      return;
    }
    const v = videoRef.current;
    if (!v) return;
    // Wait up to 3s for the video to start playing. After that, swap to the
    // fallback so LCP isn't stalled on slow connections. Successful
    // "playing" event or any "loadeddata" cancels the timer.
    const t = setTimeout(() => setShowFallback(true), 3000);
    const cancel = () => clearTimeout(t);
    v.addEventListener("playing", cancel);
    v.addEventListener("loadeddata", cancel);
    return () => {
      clearTimeout(t);
      v.removeEventListener("playing", cancel);
      v.removeEventListener("loadeddata", cancel);
    };
  }, [reduceMotion]);

  if (showFallback) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
        className="relative mx-auto aspect-square w-full max-w-xl"
      >
        <EarthAnimation />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="relative mx-auto w-full max-w-4xl"
    >
      <div className="group relative overflow-hidden rounded-3xl shadow-2xl ring-1 ring-emerald-400/20">
        {/* Soft glow behind for depth */}
        <div className="pointer-events-none absolute -inset-2 -z-10 rounded-[28px] bg-gradient-to-r from-emerald-400/30 via-teal-400/30 to-sky-400/30 blur-2xl" />
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/videos/hero-poster.jpg"
          onError={() => setShowFallback(true)}
          className="block h-auto w-full"
          aria-label="Eco-footprint animation"
        >
          <source src="/videos/hero.webm" type="video/webm" />
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        {/* Subtle gradient veil so anything overlaid reads */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      </div>
    </motion.div>
  );
}
