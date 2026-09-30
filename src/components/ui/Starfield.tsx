"use client";

import { useEffect, useRef } from "react";
import { isBackgroundMotionHeld, subscribeBackgroundMotion } from "@/components/ui/backgroundMotion";

interface Star {
  x: number;
  y: number;
  r: number;
  driftSpeed: number;
  twinkleSpeed: number;
  twinklePhase: number;
  baseAlpha: number;
}

interface NebulaBlob {
  x: number;
  y: number;
  radius: number;
  color: string;
  driftRadiusX: number;
  driftRadiusY: number;
  driftSpeed: number;
  phase: number;
}

const NEBULA_COLORS = [
  "rgba(124, 92, 255, 0.16)", // nebula-primary
  "rgba(56, 232, 224, 0.12)", // nebula-secondary
  "rgba(255, 92, 122, 0.08)", // alert-severe, sparingly
];

// Depth layers: farther layers are smaller, dimmer, and drift slower.
const LAYER_CONFIG = [
  { densityDivisor: 8000, rRange: [0.2, 0.6], speedRange: [0.01, 0.04], alphaRange: [0.25, 0.5] },
  { densityDivisor: 12000, rRange: [0.4, 1.0], speedRange: [0.04, 0.09], alphaRange: [0.4, 0.7] },
  { densityDivisor: 18000, rRange: [0.7, 1.6], speedRange: [0.09, 0.18], alphaRange: [0.55, 0.95] },
];

/** Beyond 2x the extra pixels cost fill rate without visibly sharper dots. */
const MAX_DPR = 2;

function randomIn([min, max]: number[]): number {
  return min + Math.random() * (max - min);
}

function createStar(cfg: (typeof LAYER_CONFIG)[number], width: number, height: number): Star {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    r: randomIn(cfg.rRange),
    driftSpeed: randomIn(cfg.speedRange),
    twinkleSpeed: 0.4 + Math.random() * 1.2,
    twinklePhase: Math.random() * Math.PI * 2,
    baseAlpha: randomIn(cfg.alphaRange),
  };
}

function paintBlob(c: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
  const gradient = c.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = gradient;
  c.beginPath();
  c.arc(x, y, radius, 0, Math.PI * 2);
  c.fill();
}

/**
 * Decorative, site-wide animated background: three parallax star layers with subtle
 * twinkle, plus slow-drifting nebula glow blobs, for an immersive "flying through
 * space" feel. Renders a single static frame when the user prefers reduced motion, and
 * pauses while a full-window 3D scene covers it (see backgroundMotion.ts).
 */
export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Scene state is in CSS pixels; the backing store is scaled by devicePixelRatio.
    let width = 0;
    let height = 0;
    let layers: Star[][] = LAYER_CONFIG.map(() => []);
    let blobs: NebulaBlob[] = [];
    let animationFrame = 0;
    let running = false;
    const startTime = performance.now();

    /**
     * Rescales existing stars and blobs to the new size instead of regenerating them, so
     * resizes (including mobile URL-bar show/hide) don't make the whole sky jump.
     */
    function resize() {
      if (!canvas || !ctx) return;
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(newWidth * dpr);
      canvas.height = Math.round(newHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const sx = width ? newWidth / width : 1;
      const sy = height ? newHeight / height : 1;

      layers = LAYER_CONFIG.map((cfg, i) => {
        const count = Math.floor((newWidth * newHeight) / cfg.densityDivisor);
        const kept = layers[i].slice(0, count);
        for (const star of kept) {
          star.x *= sx;
          star.y *= sy;
        }
        while (kept.length < count) kept.push(createStar(cfg, newWidth, newHeight));
        return kept;
      });

      if (blobs.length === 0) {
        blobs = NEBULA_COLORS.map((color, i) => ({
          x: Math.random() * newWidth,
          y: Math.random() * newHeight,
          radius: Math.max(newWidth, newHeight) * (0.25 + Math.random() * 0.15),
          color,
          driftRadiusX: newWidth * (0.1 + Math.random() * 0.1),
          driftRadiusY: newHeight * (0.1 + Math.random() * 0.1),
          driftSpeed: 0.02 + i * 0.006,
          phase: (i / NEBULA_COLORS.length) * Math.PI * 2,
        }));
      } else {
        const sr = Math.max(newWidth, newHeight) / Math.max(width, height);
        for (const blob of blobs) {
          blob.x *= sx;
          blob.y *= sy;
          blob.radius *= sr;
          blob.driftRadiusX *= sx;
          blob.driftRadiusY *= sy;
        }
      }

      width = newWidth;
      height = newHeight;
    }

    /** One frame at `elapsed` seconds; `advance` moves stars (off for a static frame). */
    function paint(elapsed: number, advance: boolean) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      for (const blob of blobs) {
        const bx = blob.x + Math.cos(elapsed * blob.driftSpeed + blob.phase) * blob.driftRadiusX;
        const by = blob.y + Math.sin(elapsed * blob.driftSpeed + blob.phase) * blob.driftRadiusY;
        paintBlob(ctx, bx, by, blob.radius, blob.color);
      }

      ctx.fillStyle = "#f4f5fb";
      for (const layer of layers) {
        for (const star of layer) {
          const twinkle = advance ? 0.65 + 0.35 * Math.sin(elapsed * star.twinkleSpeed + star.twinklePhase) : 1;
          ctx.globalAlpha = star.baseAlpha * twinkle;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
          ctx.fill();

          if (advance) {
            star.y += star.driftSpeed;
            if (star.y > height) {
              star.y = 0;
              star.x = Math.random() * width;
            }
          }
        }
      }
      ctx.globalAlpha = 1;
    }

    function frame(now: number) {
      paint((now - startTime) / 1000, true);
      animationFrame = requestAnimationFrame(frame);
    }

    /** Animates unless reduced motion is preferred or a foreground view holds it. */
    function sync() {
      const shouldRun = !prefersReducedMotion && !isBackgroundMotionHeld();
      if (shouldRun && !running) {
        running = true;
        animationFrame = requestAnimationFrame(frame);
      } else if (!shouldRun && running) {
        running = false;
        cancelAnimationFrame(animationFrame);
      }
    }

    function handleResize() {
      resize();
      // A resized canvas is cleared; repaint now if no animation loop will.
      if (!running) paint((performance.now() - startTime) / 1000, false);
    }

    resize();
    paint(0, false);
    sync();
    const unsubscribe = subscribeBackgroundMotion(sync);
    window.addEventListener("resize", handleResize);

    return () => {
      unsubscribe();
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
