"use client";
import * as React from "react";

interface Leaf {
  x: number;
  y: number;
  vx: number;     // base horizontal drift
  vy: number;     // base vertical fall
  rot: number;
  vrot: number;
  size: number;
  swayAmp: number; // horizontal sway amplitude
  swayFreq: number;
  hue: number;
  alpha: number;
  life: number;
}

/**
 * Ambient floating leaves — translucent, drift diagonally with a gentle sway.
 *
 *  - Pure canvas, no deps.
 *  - 30 leaves default — light on CPU, IntersectionObserver pauses off-screen.
 *  - Respects prefers-reduced-motion (renders a still grid of leaves instead).
 *  - GPU-friendly: single canvas, clearRect + drawImage of a cached leaf bitmap.
 */
export function FloatingLeaves({
  density = 28,
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

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0, height = 0;

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // ------ Pre-render a single leaf bitmap and reuse it (much cheaper than drawing
    // a path per leaf per frame).
    function makeLeafBitmap(hue: number) {
      const off = document.createElement("canvas");
      const size = 64;
      off.width = size;
      off.height = size;
      const c = off.getContext("2d");
      if (!c) return off;
      const grad = c.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, `hsla(${hue}, 70%, 55%, 1)`);
      grad.addColorStop(1, `hsla(${hue + 10}, 65%, 35%, 1)`);
      c.translate(size / 2, size / 2);
      c.fillStyle = grad;
      c.beginPath();
      c.moveTo(0, -size / 2 + 4);
      c.quadraticCurveTo(size / 2 - 4, 0, 0, size / 2 - 4);
      c.quadraticCurveTo(-size / 2 + 4, 0, 0, -size / 2 + 4);
      c.closePath();
      c.fill();
      c.strokeStyle = `hsla(${hue + 20}, 80%, 25%, 0.4)`;
      c.lineWidth = 0.8;
      c.beginPath();
      c.moveTo(0, -size / 2 + 6);
      c.lineTo(0, size / 2 - 6);
      c.stroke();
      return off;
    }

    const HUES = [140, 150, 160, 170, 175];
    const bitmaps = HUES.map((h) => makeLeafBitmap(h));

    function spawn(initial = false): Leaf {
      const hueIdx = Math.floor(Math.random() * HUES.length);
      return {
        x: Math.random() * width,
        y: initial ? Math.random() * height : -40 - Math.random() * 60,
        vx: -0.15 - Math.random() * 0.35,    // drift slowly left
        vy: 0.2 + Math.random() * 0.45,      // fall slowly down
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.01,
        size: 14 + Math.random() * 22,
        swayAmp: 18 + Math.random() * 24,
        swayFreq: 0.0008 + Math.random() * 0.0012,
        hue: HUES[hueIdx],
        alpha: 0.18 + Math.random() * 0.25,
        life: Math.random() * 1000,
      };
    }

    const leaves: Leaf[] = Array.from({ length: density }, () => spawn(true));

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let isVisible = true;
    const io = new IntersectionObserver(
      ([e]) => { isVisible = e.isIntersecting; },
      { threshold: 0 },
    );
    io.observe(canvas);

    let raf = 0;
    let last = performance.now();

    function tick(now: number) {
      if (!canvas || !ctx) return;
      const dt = Math.min(48, now - last);
      last = now;
      if (!isVisible) {
        raf = requestAnimationFrame(tick);
        return;
      }
      ctx.clearRect(0, 0, width, height);
      for (const L of leaves) {
        L.life += dt;
        const sway = Math.sin(L.life * L.swayFreq) * L.swayAmp;
        L.x += (L.vx * dt) / 16;
        L.y += (L.vy * dt) / 16;
        L.rot += L.vrot * dt;
        const drawX = L.x + sway;
        if (L.y > height + 40 || drawX < -60) {
          Object.assign(L, spawn(false));
          continue;
        }
        ctx.save();
        ctx.globalAlpha = L.alpha;
        ctx.translate(drawX, L.y);
        ctx.rotate(L.rot);
        const hueIdx = HUES.indexOf(L.hue);
        const bmp = bitmaps[hueIdx] ?? bitmaps[0];
        ctx.drawImage(bmp, -L.size / 2, -L.size / 2, L.size, L.size);
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    }

    if (reduce) {
      // Render a single static frame instead of running the loop.
      const draw = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);
        for (const L of leaves) {
          ctx.save();
          ctx.globalAlpha = L.alpha;
          ctx.translate(L.x, L.y);
          ctx.rotate(L.rot);
          const hueIdx = HUES.indexOf(L.hue);
          const bmp = bitmaps[hueIdx] ?? bitmaps[0];
          ctx.drawImage(bmp, -L.size / 2, -L.size / 2, L.size, L.size);
          ctx.restore();
        }
      };
      draw();
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      role="presentation"
      className={className}
    />
  );
}
