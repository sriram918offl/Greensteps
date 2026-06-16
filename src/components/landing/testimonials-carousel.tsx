"use client";
import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star, Pause, Play } from "lucide-react";
import { LeafAvatar } from "./leaf-avatar";

const TESTIMONIALS = [
  {
    name: "Priya R.",
    role: "Product Manager",
    city: "Mumbai",
    quote:
      "I knew flying mattered. I didn't know my Amazon habit equaled 14 burgers a month. The aha-moment cards made me text three friends about it.",
    stat: "−24% in 8 weeks",
  },
  {
    name: "Marcus D.",
    role: "Climate engineer",
    city: "Bengaluru",
    quote:
      "The chatbot cites IPCC and IEA. The civic dashboard uses real CEA grid factors. Finally — a tool that runs on actual data, not vibes.",
    stat: "Reads weekly",
  },
  {
    name: "Lena Y.",
    role: "Student",
    city: "Hyderabad",
    quote:
      "Shared my result card in my group chat. Three friends did it too. That spread is the whole point. It's the climate equivalent of going viral.",
    stat: "Recruited 9 friends",
  },
  {
    name: "Arjun K.",
    role: "Architect",
    city: "Delhi",
    quote:
      "Pledged to bike to studio twice a week. Made it public, which is exactly why I haven't quit. Three months in. Lost 4 kg too — nice bonus.",
    stat: "12 weeks streak",
  },
  {
    name: "Sara M.",
    role: "Researcher",
    city: "Chennai",
    quote:
      "I work on solar policy and recommend GreenSteps to every household that asks me about rooftop PV. The payback calculator alone is gold.",
    stat: "180 kg/mo saved",
  },
];

const ROTATE_MS = 7000;

export function TestimonialsCarousel() {
  const reduce = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const [paused, setPaused] = React.useState(false);
  const dragX = React.useRef(0);

  React.useEffect(() => {
    if (paused || reduce) return;
    const t = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % TESTIMONIALS.length);
    }, ROTATE_MS);
    return () => clearInterval(t);
  }, [paused, reduce]);

  function go(delta: number) {
    setDirection(delta);
    setIndex((i) => (i + delta + TESTIMONIALS.length) % TESTIMONIALS.length);
  }

  const current = TESTIMONIALS[index];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-emerald-500/5">
        {/* Background glow tied to the active slide */}
        <div className="absolute -left-20 top-1/2 -z-10 h-72 w-72 -translate-y-1/2 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -right-20 top-1/2 -z-10 h-72 w-72 -translate-y-1/2 rounded-full bg-teal-500/15 blur-3xl" />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction * 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 80 }}
            transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragStart={(_, info) => { dragX.current = info.point.x; }}
            onDragEnd={(_, info) => {
              const delta = info.point.x - dragX.current;
              if (delta < -60) go(1);
              else if (delta > 60) go(-1);
            }}
            className="grid cursor-grab gap-6 p-8 active:cursor-grabbing md:grid-cols-[200px_1fr] md:items-center md:gap-10 md:p-12"
          >
            <motion.div
              key={`avatar-${index}`}
              initial={{ scale: 0.85, rotate: -8, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 160, damping: 14 }}
              className="relative mx-auto grid h-32 w-32 shrink-0 place-items-center rounded-full bg-emerald-50 ring-4 ring-emerald-400/30 dark:bg-emerald-950/40 md:h-48 md:w-48"
            >
              <LeafAvatar seed={index} size={144} className="drop-shadow-xl" />
            </motion.div>

            <div className="text-center md:text-left">
              <Quote className="mx-auto h-8 w-8 text-emerald-500 md:mx-0" aria-hidden />
              <p className="mt-3 text-lg leading-relaxed text-foreground md:text-xl">
                &ldquo;{current.quote}&rdquo;
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <div>
                  <p className="text-sm font-semibold">{current.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {current.role} · {current.city}
                  </p>
                </div>
                <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-300">
                  {current.stat}
                </div>
                <div className="flex gap-0.5">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous testimonial"
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
                  aria-label={`Show testimonial ${i + 1}`}
                  aria-current={i === index}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-8 bg-emerald-500" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Resume autoplay" : "Pause autoplay"}
              aria-pressed={paused}
              className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            </button>
          </div>

          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next testimonial"
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
