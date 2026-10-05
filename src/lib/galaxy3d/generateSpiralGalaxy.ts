/**
 * Pure, framework-free procedural generator for a stylized spiral-galaxy particle
 * field. Positions/colors are illustrative (not real star catalog data) but the
 * distribution follows a logarithmic-spiral-arm model for a plausible galaxy shape.
 */

import { gaussianRandom, lerpRgb, mulberry32, type Rgb } from "@/lib/space3d/random";

export interface SpiralGalaxyParams {
  particleCount: number;
  armCount: number;
  armSpread: number;
  coreRadius: number;
  galaxyRadius: number;
  diskThickness: number;
  seed: number;
  clickableStarCount: number;
}

export interface SpiralGalaxyResult {
  positions: Float32Array;
  colors: Float32Array;
  clickableIndices: number[];
}

const DEFAULT_SPIRAL_GALAXY_PARAMS: SpiralGalaxyParams = {
  particleCount: 20000,
  armCount: 3,
  armSpread: 0.4,
  coreRadius: 1.2,
  galaxyRadius: 14,
  diskThickness: 1.4,
  seed: 1337,
  clickableStarCount: 80,
};

const CORE_COLOR: Rgb = [0.85, 0.9, 1]; // hot white/blue
const ARM_COLOR: Rgb = [1, 0.92, 0.75]; // warm yellow/white
const OUTER_COLOR: Rgb = [0.55, 0.68, 1]; // cool blue

export function colorForRadius(t: number): Rgb {
  if (t < 0.5) return lerpRgb(CORE_COLOR, ARM_COLOR, t / 0.5);
  return lerpRgb(ARM_COLOR, OUTER_COLOR, (t - 0.5) / 0.5);
}

/** Evenly samples up to `count` indices from the candidate list. */
export function pickClickableIndices(candidates: number[], count: number): number[] {
  const picked: number[] = [];
  const step = Math.max(1, Math.floor(candidates.length / count));
  for (let i = 0; i < candidates.length && picked.length < count; i += step) {
    picked.push(candidates[i]);
  }
  return picked;
}

/**
 * Generates particle positions/colors for a stylized spiral galaxy, plus a subset of
 * indices flagged as "clickable stars" (biased away from the dense core so they're
 * visually distinguishable).
 */
export function generateSpiralGalaxy(params: Partial<SpiralGalaxyParams> = {}): SpiralGalaxyResult {
  const defined = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined));
  const p = { ...DEFAULT_SPIRAL_GALAXY_PARAMS, ...defined };
  const rand = mulberry32(p.seed);

  const positions = new Float32Array(p.particleCount * 3);
  const colors = new Float32Array(p.particleCount * 3);
  const candidateIndices: number[] = [];

  for (let i = 0; i < p.particleCount; i++) {
    const t = rand(); // 0..1 position along the radius, biased toward center
    const radius = p.coreRadius + Math.pow(t, 1.5) * (p.galaxyRadius - p.coreRadius);
    const armIndex = i % p.armCount;
    const armAngleOffset = (armIndex / p.armCount) * Math.PI * 2;
    const spiralTurns = 2.2;
    const angle =
      armAngleOffset +
      (radius / p.galaxyRadius) * spiralTurns * Math.PI * 2 +
      gaussianRandom(rand) * p.armSpread;

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const radiusRatio = radius / p.galaxyRadius;
    const bulgeFactor = Math.max(0.15, 1 - radiusRatio);
    const y = gaussianRandom(rand) * p.diskThickness * bulgeFactor;

    const idx = i * 3;
    positions[idx] = x;
    positions[idx + 1] = y;
    positions[idx + 2] = z;

    const [r, g, b] = colorForRadius(radiusRatio);
    colors[idx] = r;
    colors[idx + 1] = g;
    colors[idx + 2] = b;

    // Clickable-star candidates: away from the densest core region.
    if (radiusRatio > 0.15) {
      candidateIndices.push(i);
    }
  }

  const clickableIndices = pickClickableIndices(candidateIndices, p.clickableStarCount);

  return { positions, colors, clickableIndices };
}
