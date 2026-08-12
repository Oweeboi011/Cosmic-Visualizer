"use client";

import { useEffect, useRef } from "react";

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

/**
 * Decorative, site-wide animated background: three parallax star layers with subtle
 * twinkle, plus slow-drifting nebula glow blobs, for an immersive "flying through
 * space" feel. Renders a single static frame when the user prefers reduced motion.
 */
export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let layers: Star[][] = [];
    let blobs: NebulaBlob[] = [];
    let animationFrame: number;
    let startTime = performance.now();

    // Depth layers: farther layers are smaller, dimmer, and drift slower.
    const LAYER_CONFIG = [
      { densityDivisor: 8000, rRange: [0.2, 0.6], speedRange: [0.01, 0.04], alphaRange: [0.25, 0.5] },
      { densityDivisor: 12000, rRange: [0.4, 1.0], speedRange: [0.04, 0.09], alphaRange: [0.4, 0.7] },
      { densityDivisor: 18000, rRange: [0.7, 1.6], speedRange: [0.09, 0.18], alphaRange: [0.55, 0.95] },
    ];

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      layers = LAYER_CONFIG.map((cfg) => {
        const count = Math.floor((canvas.width * canvas.height) / cfg.densityDivisor);
        return Array.from({ length: count }, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: cfg.rRange[0] + Math.random() * (cfg.rRange[1] - cfg.rRange[0]),
          driftSpeed: cfg.speedRange[0] + Math.random() * (cfg.speedRange[1] - cfg.speedRange[0]),
          twinkleSpeed: 0.4 + Math.random() * 1.2,
          twinklePhase: Math.random() * Math.PI * 2,
          baseAlpha: cfg.alphaRange[0] + Math.random() * (cfg.alphaRange[1] - cfg.alphaRange[0]),
        }));
      });

      blobs = NEBULA_COLORS.map((color, i) => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.max(canvas.width, canvas.height) * (0.25 + Math.random() * 0.15),
        color,
        driftRadiusX: canvas.width * (0.1 + Math.random() * 0.1),
        driftRadiusY: canvas.height * (0.1 + Math.random() * 0.1),
        driftSpeed: 0.02 + i * 0.006,
        phase: (i / NEBULA_COLORS.length) * Math.PI * 2,
      }));
    }

    function drawStatic() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const blob of blobs) {
        paintBlob(ctx, blob.x, blob.y, blob.radius, blob.color);
      }
      for (const layer of layers) {
        for (const star of layer) {
          ctx.globalAlpha = star.baseAlpha;
          ctx.fillStyle = "#f4f5fb";
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
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

    function draw(now: number) {
      if (!canvas || !ctx) return;
      const elapsed = (now - startTime) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const blob of blobs) {
        const bx = blob.x + Math.cos(elapsed * blob.driftSpeed + blob.phase) * blob.driftRadiusX;
        const by = blob.y + Math.sin(elapsed * blob.driftSpeed + blob.phase) * blob.driftRadiusY;
        paintBlob(ctx, bx, by, blob.radius, blob.color);
      }

      for (const layer of layers) {
        for (const star of layer) {
          const twinkle = 0.65 + 0.35 * Math.sin(elapsed * star.twinkleSpeed + star.twinklePhase);
          ctx.globalAlpha = star.baseAlpha * twinkle;
          ctx.fillStyle = "#f4f5fb";
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
          ctx.fill();

          star.y += star.driftSpeed;
          if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
          }
        }
      }
      ctx.globalAlpha = 1;

      animationFrame = requestAnimationFrame(draw);
    }

    function handleResize() {
      resize();
      if (prefersReducedMotion) drawStatic();
    }

    resize();
    if (prefersReducedMotion) {
      drawStatic();
    } else {
      startTime = performance.now();
      animationFrame = requestAnimationFrame(draw);
    }
    window.addEventListener("resize", handleResize);

    return () => {
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
