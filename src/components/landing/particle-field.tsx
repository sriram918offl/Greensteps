"use client";
import * as React from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  age: number;       // 0..1 — controls morph from "carbon" to "leaf"
  rotation: number;
  hue: number;
}

/**
 * Canvas particle field — particles start as dark "carbon" dots near the
 * bottom, drift up, and morph into emerald leaf shapes near the top.
 * The morph is what gives the section its story beat.
 *
 * Pure canvas + RAF. ~50 particles. No deps. Pauses when off-screen for perf.
 */
export function ParticleField({
  density = 50,
  className,
}: {
  density?: number;
  className?: string;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function spawn(): Particle {
      return {
        x: Math.random() * width,
        y: height + Math.random() * 40,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.3 - Math.random() * 0.6,
        size: 2 + Math.random() * 3,
        age: 0,
        rotation: Math.random() * Math.PI * 2,
        hue: 150 + Math.random() * 30, // 150–180 = green-teal
      };
    }

    const particles: Particle[] = Array.from({ length: density }, () => {
      const p = spawn();
      // Stagger initial y so the field isn't empty on first frame
      p.y = Math.random() * height;
      p.age = Math.random();
      return p;
    });

    function drawLeaf(p: Particle) {
      if (!ctx) return;
      const s = p.size * 3.2;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      // Leaf shape via quadratic curves
      ctx.fillStyle = `hsla(${p.hue}, 65%, 50%, ${0.7 * (1 - Math.abs(p.age - 0.7))})`;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(s, -s * 0.2, 0, s);
      ctx.quadraticCurveTo(-s, -s * 0.2, 0, -s);
      ctx.fill();
      // Vein
      ctx.strokeStyle = `hsla(${p.hue}, 80%, 30%, 0.4)`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(0, s);
      ctx.stroke();
      ctx.restore();
    }

    function drawCarbon(p: Particle) {
      if (!ctx) return;
      ctx.fillStyle = `rgba(30, 30, 30, ${0.4 * (1 - p.age)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    let rafId = 0;
    let isVisible = true;

    const io = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting; },
      { threshold: 0 },
    );
    io.observe(canvas);

    function tick() {
      if (!isVisible || !ctx) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += 0.005;
        p.age += 0.0035;
        if (p.age >= 1 || p.y < -20) {
          Object.assign(p, spawn());
        }
        if (p.age < 0.45) drawCarbon(p);
        else drawLeaf(p);
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
      role="presentation"
    />
  );
}
