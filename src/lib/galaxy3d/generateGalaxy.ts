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

function generateBarredSpiral(p: GalaxyParams): SpiralGalaxyResult {
  const rand = mulberry32(p.seed);
  const positions = new Float32Array(p.particleCount * 3);
  const colors = new Float32Array(p.particleCount * 3);
  const candidates: number[] = [];
  const barHalfLength = 4;
  const barFraction = 0.22;

  for (let i = 0; i < p.particleCount; i++) {
    let x: number;
    let y: number;
    let z: number;

    if (rand() < barFraction) {
      x = Math.max(-1, Math.min(1, gaussianRandom(rand) * 0.45)) * barHalfLength;
      z = gaussianRandom(rand) * 0.55;
      y = gaussianRandom(rand) * 0.35;
    } else {
      // Two trailing arms that begin at the ends of the bar.
      const t = rand();
      const radius = barHalfLength + Math.pow(t, 1.3) * (GALAXY_RADIUS - barHalfLength);
      const armOffset = (i % 2) * Math.PI;
      const angle =
        armOffset +
        ((radius - barHalfLength) / GALAXY_RADIUS) * 1.6 * Math.PI * 2 +
        gaussianRandom(rand) * 0.3;
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      y = gaussianRandom(rand) * 0.4 * Math.max(0.2, 1 - radius / GALAXY_RADIUS);
    }

    const ratio = Math.min(1, Math.hypot(x, z) / GALAXY_RADIUS);
    writeParticle(positions, colors, i, [x, y, z], colorForRadius(ratio));
    if (ratio > 0.3) candidates.push(i);
  }

  return { positions, colors, clickableIndices: pickClickableIndices(candidates, p.clickableStarCount) };
}

const OLD_CORE: Rgb = [1, 0.93, 0.8];
const OLD_OUTER: Rgb = [1, 0.7, 0.48];

function generateElliptical(p: GalaxyParams): SpiralGalaxyResult {
  const rand = mulberry32(p.seed);
  const positions = new Float32Array(p.particleCount * 3);
  const colors = new Float32Array(p.particleCount * 3);
  const candidates: number[] = [];
  const maxRadius = GALAXY_RADIUS * 0.8;

  for (let i = 0; i < p.particleCount; i++) {
    const gx = gaussianRandom(rand);
    const gy = gaussianRandom(rand);
    const gz = gaussianRandom(rand);
    const len = Math.hypot(gx, gy, gz) || 1;
    // Steep central concentration, like a de Vaucouleurs profile.
    const r = maxRadius * Math.pow(rand(), 2.2);
    const x = (gx / len) * r;
    const y = (gy / len) * r * 0.62;
    const z = (gz / len) * r * 0.82;

    const ratio = r / maxRadius;
    writeParticle(positions, colors, i, [x, y, z], lerpRgb(OLD_CORE, OLD_OUTER, Math.sqrt(ratio)));
    if (ratio > 0.2) candidates.push(i);
  }

  return { positions, colors, clickableIndices: pickClickableIndices(candidates, p.clickableStarCount) };
}

const YOUNG_BLUE: Rgb = [0.62, 0.76, 1];
const HII_PINK: Rgb = [1, 0.5, 0.72];

function generateIrregular(p: GalaxyParams): SpiralGalaxyResult {
  const rand = mulberry32(p.seed);
  const positions = new Float32Array(p.particleCount * 3);
  const colors = new Float32Array(p.particleCount * 3);
  const candidates: number[] = [];

  const clumps = Array.from({ length: 7 }, () => ({
    x: gaussianRandom(rand) * 4.5,
    y: gaussianRandom(rand) * 1.2,
    z: gaussianRandom(rand) * 3,
    size: 0.8 + rand() * 2.2,
  }));

  for (let i = 0; i < p.particleCount; i++) {
    let x: number;
    let y: number;
    let z: number;
    let color: Rgb;

    if (rand() < 0.3) {
      // Diffuse, older stellar background.
      x = gaussianRandom(rand) * 5.5;
      y = gaussianRandom(rand) * 1.6;
      z = gaussianRandom(rand) * 3.8;
      color = [0.9, 0.88, 0.85];
    } else {
      const c = clumps[Math.floor(rand() * clumps.length)];
      x = c.x + gaussianRandom(rand) * c.size;
      y = c.y + gaussianRandom(rand) * c.size * 0.5;
      z = c.z + gaussianRandom(rand) * c.size;
      color = rand() < 0.12 ? HII_PINK : YOUNG_BLUE;
    }

    writeParticle(positions, colors, i, [x, y, z], color);
    if (i % 3 === 0) candidates.push(i);
  }

  return { positions, colors, clickableIndices: pickClickableIndices(candidates, p.clickableStarCount) };
}

function writeParticle(
  positions: Float32Array,
  colors: Float32Array,
  i: number,
  pos: [number, number, number],
  color: Rgb
) {
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
      return generateBarredSpiral(p);
    case "elliptical":
      return generateElliptical(p);
    case "irregular":
      return generateIrregular(p);
  }
}
