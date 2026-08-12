/**
 * Pure, framework-free procedural generator for a stylized spiral-galaxy particle
 * field. Positions/colors are illustrative (not real star catalog data) but the
 * distribution follows a logarithmic-spiral-arm model for a plausible galaxy shape.
 */

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

export const DEFAULT_SPIRAL_GALAXY_PARAMS: SpiralGalaxyParams = {
  particleCount: 20000,
  armCount: 3,
  armSpread: 0.4,
  coreRadius: 1.2,
  galaxyRadius: 14,
  diskThickness: 1.4,
  seed: 1337,
  clickableStarCount: 80,
};

/** Deterministic PRNG (mulberry32) so generation is reproducible/testable. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussianRandom(rand: () => number): number {
  const u = Math.max(rand(), 1e-6);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const CORE_COLOR: [number, number, number] = [0.85, 0.9, 1]; // hot white/blue
const ARM_COLOR: [number, number, number] = [1, 0.92, 0.75]; // warm yellow/white
const OUTER_COLOR: [number, number, number] = [0.55, 0.68, 1]; // cool blue

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function colorForRadius(t: number): [number, number, number] {
  if (t < 0.5) {
    const local = t / 0.5;
    return [
      lerp(CORE_COLOR[0], ARM_COLOR[0], local),
      lerp(CORE_COLOR[1], ARM_COLOR[1], local),
      lerp(CORE_COLOR[2], ARM_COLOR[2], local),
    ];
  }
  const local = (t - 0.5) / 0.5;
  return [
    lerp(ARM_COLOR[0], OUTER_COLOR[0], local),
    lerp(ARM_COLOR[1], OUTER_COLOR[1], local),
    lerp(ARM_COLOR[2], OUTER_COLOR[2], local),
  ];
}

/**
 * Generates particle positions/colors for a stylized spiral galaxy, plus a subset of
 * indices flagged as "clickable stars" (biased away from the dense core so they're
 * visually distinguishable).
 */
export function generateSpiralGalaxy(
  params: Partial<SpiralGalaxyParams> = {}
): SpiralGalaxyResult {
  const defined = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined)
  );
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

  const clickableIndices: number[] = [];
  const step = Math.max(1, Math.floor(candidateIndices.length / p.clickableStarCount));
  for (
    let i = 0;
    i < candidateIndices.length && clickableIndices.length < p.clickableStarCount;
    i += step
  ) {
    clickableIndices.push(candidateIndices[i]);
  }

  return { positions, colors, clickableIndices };
}
