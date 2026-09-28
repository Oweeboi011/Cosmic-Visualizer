import { describe, expect, it } from "vitest";
import { createNoise3D, fbm } from "@/lib/space3d/noise";
import {
  generateCloudTexture,
  generatePlanetTexture,
  generateRingTexture,
  generateSunTexture,
} from "@/lib/space3d/planetTextures";
import type { SurfaceKind } from "@/lib/space3d/planetAppearance";

const SURFACES: SurfaceKind[] = [
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
];

describe("noise", () => {
  it("is deterministic and bounded to [0, 1]", () => {
    const a = createNoise3D(1);
    const b = createNoise3D(1);
    for (let i = 0; i < 200; i++) {
      const x = i * 0.37;
      const v = fbm(a, x, -x * 0.5, x * 1.3);
      expect(v).toBe(fbm(b, x, -x * 0.5, x * 1.3));
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it("is continuous across lattice cells", () => {
    const noise = createNoise3D(5);
    expect(Math.abs(noise(0.9999, 0.5, 0.5) - noise(1.0001, 0.5, 0.5))).toBeLessThan(0.01);
  });
});

describe("planet textures", () => {
  it.each(SURFACES)("%s: builds an opaque 2:1 RGBA map", (kind) => {
    const { data, width, height } = generatePlanetTexture(kind, 64);
    expect(width).toBe(64);
    expect(height).toBe(32);
    expect(data.length).toBe(64 * 32 * 4);
    for (let i = 3; i < data.length; i += 4) expect(data[i]).toBe(255);
  });

  it("is seamless across the date line", () => {
    const { data, width, height } = generatePlanetTexture("earth", 256);
    let totalDiff = 0;
    for (let j = 0; j < height; j++) {
      const first = (j * width) * 4;
      const last = (j * width + width - 1) * 4;
      totalDiff += Math.abs(data[first] - data[last]);
    }
    // Adjacent-column difference averaged per row stays small (no hard seam).
    expect(totalDiff / height).toBeLessThan(20);
  });

  it("Earth has both ocean-blue and polar-ice pixels", () => {
    const { data, width, height } = generatePlanetTexture("earth", 128);
    const pixel = (i: number, j: number) => {
      const idx = (j * width + i) * 4;
      return [data[idx], data[idx + 1], data[idx + 2]];
    };
    // Row 0 is the south pole.
    const [pr, pg, pb] = pixel(10, 0);
    expect(Math.min(pr, pg, pb)).toBeGreaterThan(200);

    let oceanPixels = 0;
    for (let i = 0; i < width; i++) {
      const [r, , b] = pixel(i, Math.floor(height / 2));
      if (b > r * 1.5) oceanPixels++;
    }
    expect(oceanPixels).toBeGreaterThan(0);
  });

  it("builds cloud, sun, and ring textures", () => {
    const clouds = generateCloudTexture(64);
    expect(clouds.data.length).toBe(64 * 32 * 4);
    expect(generateSunTexture(64).data.length).toBe(64 * 32 * 4);

    const saturn = generateRingTexture("saturn", 256);
    expect(saturn.height).toBe(1);
    // The Cassini Division (~1.95–2.03 planet radii) is nearly transparent vs. the B ring.
    const uAt = (r: number) => Math.floor(((r - 1.24) / (2.27 - 1.24)) * 256);
    expect(saturn.data[uAt(1.99) * 4 + 3]).toBeLessThan(saturn.data[uAt(1.75) * 4 + 3] / 4);
  });
});
