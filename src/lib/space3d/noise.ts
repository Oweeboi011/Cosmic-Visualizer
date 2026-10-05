import { mulberry32 } from "@/lib/space3d/random";

export type Noise3D = (x: number, y: number, z: number) => number;

/**
 * Seeded 3D value noise in [0, 1]. Sampling in 3D (on the unit sphere) rather than
 * in 2D texture space keeps planet textures seamless at the date line and poles.
 */
export function createNoise3D(seed: number): Noise3D {
  const rand = mulberry32(seed);
  const perm = new Uint8Array(512);
  const values = new Float32Array(256);
  const base = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = base[i & 255];
  for (let i = 0; i < 256; i++) values[i] = rand();

  const lattice = (x: number, y: number, z: number) =>
    values[perm[perm[perm[x & 255] + (y & 255)] + (z & 255)]];
  const fade = (t: number) => t * t * (3 - 2 * t);

  return (x, y, z) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const zi = Math.floor(z);
    const u = fade(x - xi);
    const v = fade(y - yi);
    const w = fade(z - zi);

    const x00 = lattice(xi, yi, zi) + (lattice(xi + 1, yi, zi) - lattice(xi, yi, zi)) * u;
    const x10 = lattice(xi, yi + 1, zi) + (lattice(xi + 1, yi + 1, zi) - lattice(xi, yi + 1, zi)) * u;
    const x01 = lattice(xi, yi, zi + 1) + (lattice(xi + 1, yi, zi + 1) - lattice(xi, yi, zi + 1)) * u;
    const x11 =
      lattice(xi, yi + 1, zi + 1) + (lattice(xi + 1, yi + 1, zi + 1) - lattice(xi, yi + 1, zi + 1)) * u;
    const y0 = x00 + (x10 - x00) * v;
    const y1 = x01 + (x11 - x01) * v;
    return y0 + (y1 - y0) * w;
  };
}

/** Fractal Brownian motion: summed octaves of noise, normalized back to [0, 1]. */
export function fbm(noise: Noise3D, x: number, y: number, z: number, octaves = 5): number {
  let sum = 0;
  let amplitude = 1;
  let frequency = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += noise(x * frequency, y * frequency, z * frequency) * amplitude;
    norm += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return sum / norm;
}
