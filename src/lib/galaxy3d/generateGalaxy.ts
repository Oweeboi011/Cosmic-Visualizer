/**
 * Procedural particle fields for the main Hubble-sequence galaxy morphologies.
 * Shapes are illustrative (not catalog data) but follow the defining structure of
 * each class: arms, a central bar, a smooth ellipsoid, or clumpy star-forming knots.
 */

import {
  colorForRadius,
  generateSpiralGalaxy,
  pickClickableIndices,
  type SpiralGalaxyResult,
} from "@/lib/galaxy3d/generateSpiralGalaxy";
import { gaussianRandom, lerpRgb, mulberry32, type Rgb } from "@/lib/space3d/random";

export type GalaxyMorphology = "spiral" | "barred-spiral" | "elliptical" | "irregular";

export const GALAXY_MORPHOLOGIES: {
  key: GalaxyMorphology;
  label: string;
  hubbleClass: string;
  description: string;
}[] = [
  {
    key: "spiral",
    label: "Spiral",
    hubbleClass: "Sa–Sd",
    description:
      "A flat, rotating disk with a central bulge and arms of young blue stars. Andromeda (M31) is a nearby example.",
  },
  {
    key: "barred-spiral",
    label: "Barred spiral",
    hubbleClass: "SBa–SBd",
    description:
      "A spiral whose arms start from a bar of stars through the core. About two-thirds of spirals, including the Milky Way, have one.",
  },
  {
    key: "elliptical",
    label: "Elliptical",
    hubbleClass: "E0–E7",
    description:
      "A smooth, featureless ellipsoid of old red-yellow stars with little gas or new star formation. M87 is a giant example.",
  },
  {
    key: "irregular",
    label: "Irregular",
    hubbleClass: "Irr",
    description:
      "No clear shape, often distorted by gravitational interactions and full of star-forming knots. The Magellanic Clouds are irregulars.",
  },
];

export interface GalaxyParams {
  morphology: GalaxyMorphology;
  particleCount: number;
  clickableStarCount: number;
  seed: number;
}

const GALAXY_RADIUS = 14;

type Vec3 = [number, number, number];

/** One particle: where it is, its color, and whether it may become a clickable marker. */
interface Particle {
  pos: Vec3;
  color: Rgb;
  clickable: boolean;
}

/**
 * The loop every morphology shares. `makeSampler` receives the seeded RNG once (for any
 * per-galaxy setup) and returns a function producing particle `i`.
 */
function buildGalaxy(
  p: GalaxyParams,
  makeSampler: (rand: () => number) => (i: number) => Particle,
): SpiralGalaxyResult {
  const sample = makeSampler(mulberry32(p.seed));
  const positions = new Float32Array(p.particleCount * 3);
  const colors = new Float32Array(p.particleCount * 3);
  const candidates: number[] = [];

  for (let i = 0; i < p.particleCount; i++) {
    const { pos, color, clickable } = sample(i);
    writeParticle(positions, colors, i, pos, color);
    if (clickable) candidates.push(i);
  }

  return { positions, colors, clickableIndices: pickClickableIndices(candidates, p.clickableStarCount) };
}

const BAR_HALF_LENGTH = 4;
const BAR_FRACTION = 0.22;

const barredSpiralSampler =
  (rand: () => number) =>
  (i: number): Particle => {
    let pos: Vec3;
    if (rand() < BAR_FRACTION) {
      const x = Math.max(-1, Math.min(1, gaussianRandom(rand) * 0.45)) * BAR_HALF_LENGTH;
      const z = gaussianRandom(rand) * 0.55;
      pos = [x, gaussianRandom(rand) * 0.35, z];
    } else {
      // Two trailing arms that begin at the ends of the bar.
      const t = rand();
      const radius = BAR_HALF_LENGTH + Math.pow(t, 1.3) * (GALAXY_RADIUS - BAR_HALF_LENGTH);
      const armOffset = (i % 2) * Math.PI;
      const angle =
        armOffset +
        ((radius - BAR_HALF_LENGTH) / GALAXY_RADIUS) * 1.6 * Math.PI * 2 +
        gaussianRandom(rand) * 0.3;
      const y = gaussianRandom(rand) * 0.4 * Math.max(0.2, 1 - radius / GALAXY_RADIUS);
      pos = [Math.cos(angle) * radius, y, Math.sin(angle) * radius];
    }
    const ratio = Math.min(1, Math.hypot(pos[0], pos[2]) / GALAXY_RADIUS);
    return { pos, color: colorForRadius(ratio), clickable: ratio > 0.3 };
  };

const OLD_CORE: Rgb = [1, 0.93, 0.8];
const OLD_OUTER: Rgb = [1, 0.7, 0.48];
const ELLIPTICAL_RADIUS = GALAXY_RADIUS * 0.8;

const ellipticalSampler = (rand: () => number) => (): Particle => {
  const gx = gaussianRandom(rand);
  const gy = gaussianRandom(rand);
  const gz = gaussianRandom(rand);
  const len = Math.hypot(gx, gy, gz) || 1;
  // Steep central concentration, like a de Vaucouleurs profile.
  const r = ELLIPTICAL_RADIUS * Math.pow(rand(), 2.2);
  const ratio = r / ELLIPTICAL_RADIUS;
  return {
    pos: [(gx / len) * r, (gy / len) * r * 0.62, (gz / len) * r * 0.82],
    color: lerpRgb(OLD_CORE, OLD_OUTER, Math.sqrt(ratio)),
    clickable: ratio > 0.2,
  };
};

const YOUNG_BLUE: Rgb = [0.62, 0.76, 1];
const HII_PINK: Rgb = [1, 0.5, 0.72];
const OLD_BACKGROUND: Rgb = [0.9, 0.88, 0.85];

const irregularSampler = (rand: () => number) => {
  const clumps = Array.from({ length: 7 }, () => ({
    x: gaussianRandom(rand) * 4.5,
    y: gaussianRandom(rand) * 1.2,
    z: gaussianRandom(rand) * 3,
    size: 0.8 + rand() * 2.2,
  }));

  return (i: number): Particle => {
    const clickable = i % 3 === 0;
    if (rand() < 0.3) {
      // Diffuse, older stellar background.
      const pos: Vec3 = [gaussianRandom(rand) * 5.5, gaussianRandom(rand) * 1.6, gaussianRandom(rand) * 3.8];
      return { pos, color: OLD_BACKGROUND, clickable };
    }
    const c = clumps[Math.floor(rand() * clumps.length)];
    const pos: Vec3 = [
      c.x + gaussianRandom(rand) * c.size,
      c.y + gaussianRandom(rand) * c.size * 0.5,
      c.z + gaussianRandom(rand) * c.size,
    ];
    return { pos, color: rand() < 0.12 ? HII_PINK : YOUNG_BLUE, clickable };
  };
};

function writeParticle(positions: Float32Array, colors: Float32Array, i: number, pos: Vec3, color: Rgb) {
  const idx = i * 3;
  positions[idx] = pos[0];
  positions[idx + 1] = pos[1];
  positions[idx + 2] = pos[2];
  colors[idx] = color[0];
  colors[idx + 1] = color[1];
  colors[idx + 2] = color[2];
}

export function generateGalaxy(p: GalaxyParams): SpiralGalaxyResult {
  switch (p.morphology) {
    case "spiral":
      return generateSpiralGalaxy({
        particleCount: p.particleCount,
        clickableStarCount: p.clickableStarCount,
        seed: p.seed,
      });
    case "barred-spiral":
      return buildGalaxy(p, barredSpiralSampler);
    case "elliptical":
      return buildGalaxy(p, ellipticalSampler);
    case "irregular":
      return buildGalaxy(p, irregularSampler);
  }
}
