/**
 * Framework-free procedural texture generators for planets, rings, clouds, and the
 * Sun. Output is raw RGBA bytes laid out for an equirectangular map where row 0 is
 * the south pole — matching how three.js SphereGeometry samples a DataTexture.
 */

import { createNoise3D, fbm, type Noise3D } from "@/lib/space3d/noise";
import { lerpRgb, smoothstep, type Rgb } from "@/lib/space3d/random";
import type { RingKind, SurfaceKind } from "@/lib/space3d/planetAppearance";

export interface TextureData {
  data: Uint8Array;
  width: number;
  height: number;
}

type SurfaceShader = (x: number, y: number, z: number, lat: number, lon: number) => Rgb;

function renderSphereMap(
  width: number,
  shade: (x: number, y: number, z: number, lat: number, lon: number) => [number, number, number, number]
): TextureData {
  const height = Math.max(1, Math.floor(width / 2));
  const data = new Uint8Array(width * height * 4);

  for (let j = 0; j < height; j++) {
    const lat = -Math.PI / 2 + ((j + 0.5) / height) * Math.PI;
    const cosLat = Math.cos(lat);
    const y = Math.sin(lat);
    for (let i = 0; i < width; i++) {
      const lon = ((i + 0.5) / width) * Math.PI * 2;
      // Same parameterization as THREE.SphereGeometry, so features land where expected.
      const x = -Math.cos(lon) * cosLat;
      const z = Math.sin(lon) * cosLat;
      const [r, g, b, a] = shade(x, y, z, lat, lon);
      const idx = (j * width + i) * 4;
      data[idx] = clampByte(r);
      data[idx + 1] = clampByte(g);
      data[idx + 2] = clampByte(b);
      data[idx + 3] = clampByte(a);
    }
  }

  return { data, width, height };
}

function clampByte(v: number): number {
  return Math.round(Math.min(Math.max(v, 0), 1) * 255);
}

const DEG = Math.PI / 180;

/** Soft elliptical spot centered at (lat0, lon0), both in radians. Returns 0..1. */
function spot(lat: number, lon: number, lat0: number, lon0: number, halfLat: number, halfLon: number) {
  let dLon = Math.abs(lon - lon0);
  if (dLon > Math.PI) dLon = Math.PI * 2 - dLon;
  const d = Math.hypot((lat - lat0) / halfLat, dLon / halfLon);
  return 1 - smoothstep(0.6, 1, d);
}

function bandedGiant(
  noise: Noise3D,
  palette: Rgb[],
  bandFrequency: number,
  turbulence: number
): SurfaceShader {
  return (x, y, z, lat) => {
    const warp = fbm(noise, x * 3, y * 3, z * 3, 4) - 0.5;
    const band = 0.5 + 0.5 * Math.sin(lat * bandFrequency + warp * turbulence);
    const fine = fbm(noise, x * 2, y * 40, z * 2, 3);
    const t = Math.min(Math.max(band * 0.8 + fine * 0.2, 0), 1) * (palette.length - 1);
    const i = Math.min(Math.floor(t), palette.length - 2);
    return lerpRgb(palette[i], palette[i + 1], t - i);
  };
}

function surfaceShader(kind: SurfaceKind, noise: Noise3D): SurfaceShader {
  switch (kind) {
    case "mercury":
      return (x, y, z) => {
        const albedo = fbm(noise, x * 4, y * 4, z * 4, 6);
        const craters = fbm(noise, x * 14 + 7, y * 14, z * 14, 3);
        const rim = smoothstep(0.62, 0.7, craters) - smoothstep(0.7, 0.8, craters) * 0.6;
        const c = lerpRgb([0.33, 0.31, 0.3], [0.72, 0.69, 0.65], albedo);
        return lerpRgb(c, [0.85, 0.82, 0.78], Math.max(rim, 0) * 0.5);
      };

    case "venus":
      return (x, y, z, lat) => {
        const warp = fbm(noise, x * 2, y * 2, z * 2, 4);
        const t = 0.5 + 0.5 * Math.sin(lat * 6 + warp * 5);
        return lerpRgb([0.76, 0.58, 0.34], [0.96, 0.87, 0.64], t * 0.7 + warp * 0.3);
      };

    case "earth":
      return (x, y, z, lat) => {
        const height = fbm(noise, x * 1.6, y * 1.6, z * 1.6, 6);
        const polar = Math.abs(lat) / (Math.PI / 2);
        const iceEdge = 0.8 + (fbm(noise, x * 6, y * 6, z * 6, 3) - 0.5) * 0.12;
        if (polar > iceEdge) return [0.93, 0.95, 0.98];

        const seaLevel = 0.49;
        if (height < seaLevel) {
          return lerpRgb([0.02, 0.09, 0.28], [0.08, 0.3, 0.55], smoothstep(0.35, seaLevel, height));
        }
        const aridity = fbm(noise, x * 3 + 11, y * 3, z * 3, 4);
        // Deserts cluster near the subtropics (~25° latitude), forests elsewhere.
        const subtropical = 1 - smoothstep(0.1, 0.35, Math.abs(polar - 0.28));
        const dry = smoothstep(0.45, 0.65, aridity * 0.6 + subtropical * 0.5);
        const land = lerpRgb([0.16, 0.36, 0.13], [0.66, 0.56, 0.36], dry);
        const mountain = smoothstep(0.66, 0.78, height);
        return lerpRgb(land, [0.45, 0.4, 0.35], mountain);
      };

    case "mars":
      return (x, y, z, lat) => {
        const polar = Math.abs(lat) / (Math.PI / 2);
        const capEdge = 0.86 + (fbm(noise, x * 8, y * 8, z * 8, 3) - 0.5) * 0.08;
        if (polar > capEdge) return [0.95, 0.92, 0.9];
        const albedo = fbm(noise, x * 2.2, y * 2.2, z * 2.2, 6);
        const dust = fbm(noise, x * 9, y * 9, z * 9, 3);
        const c = lerpRgb([0.42, 0.2, 0.11], [0.78, 0.42, 0.22], smoothstep(0.35, 0.6, albedo));
        return lerpRgb(c, [0.86, 0.55, 0.36], dust * 0.25);
      };

    case "jupiter": {
      const bands = bandedGiant(
        noise,
        [
          [0.55, 0.38, 0.28],
          [0.8, 0.64, 0.48],
          [0.93, 0.88, 0.78],
          [0.84, 0.72, 0.58],
        ],
        14,
        3
      );
      return (x, y, z, lat, lon) => {
        const base = bands(x, y, z, lat, lon);
        // Great Red Spot, ~22° south.
        return lerpRgb(base, [0.76, 0.36, 0.24], spot(lat, lon, -22 * DEG, Math.PI, 7 * DEG, 12 * DEG));
      };
    }

    case "saturn":
      return bandedGiant(
        noise,
        [
          [0.78, 0.66, 0.46],
          [0.9, 0.8, 0.6],
          [0.95, 0.88, 0.7],
        ],
        10,
        1.5
      );

    case "uranus":
      return (x, y, z, lat) => {
        const t = 0.5 + 0.5 * Math.sin(lat * 8 + (fbm(noise, x * 2, y * 2, z * 2, 3) - 0.5));
        return lerpRgb([0.58, 0.83, 0.86], [0.7, 0.9, 0.92], t * 0.4);
      };

    case "neptune": {
      const bands = bandedGiant(
        noise,
        [
          [0.14, 0.26, 0.68],
          [0.22, 0.38, 0.84],
          [0.3, 0.5, 0.92],
        ],
        9,
        2
      );
      return (x, y, z, lat, lon) => {
        const base = bands(x, y, z, lat, lon);
        const darkSpot = spot(lat, lon, -20 * DEG, Math.PI * 0.6, 6 * DEG, 10 * DEG);
        const streak = spot(lat, lon, -28 * DEG, Math.PI * 0.62, 1.5 * DEG, 12 * DEG);
        return lerpRgb(lerpRgb(base, [0.08, 0.14, 0.42], darkSpot), [0.85, 0.9, 1], streak * 0.8);
      };
    }
  }
}

const SURFACE_SEEDS: Record<SurfaceKind, number> = {
  mercury: 101,
  venus: 202,
  earth: 303,
  mars: 404,
  jupiter: 505,
  saturn: 606,
  uranus: 707,
  neptune: 808,
};

export function generatePlanetTexture(kind: SurfaceKind, width: number): TextureData {
  const shade = surfaceShader(kind, createNoise3D(SURFACE_SEEDS[kind]));
  return renderSphereMap(width, (x, y, z, lat, lon) => [...shade(x, y, z, lat, lon), 1]);
}

/** White cloud layer with alpha, for Earth. */
export function generateCloudTexture(width: number): TextureData {
  const noise = createNoise3D(909);
  return renderSphereMap(width, (x, y, z) => {
    const n = fbm(noise, x * 2.5, y * 3.5, z * 2.5, 6);
    return [1, 1, 1, smoothstep(0.55, 0.75, n) * 0.85];
  });
}

/** Granulated photosphere for the Sun in the solar system view. */
export function generateSunTexture(width: number): TextureData {
  const noise = createNoise3D(1010);
  return renderSphereMap(width, (x, y, z) => {
    const cells = fbm(noise, x * 18, y * 18, z * 18, 3);
    const large = fbm(noise, x * 3, y * 3, z * 3, 3);
    return [...lerpRgb([1, 0.55, 0.12], [1, 0.93, 0.62], cells * 0.7 + large * 0.3), 1];
  });
}

/**
 * 1-pixel-tall radial strip for a ring: u = 0 at the inner edge, u = 1 at the outer.
 * Saturn's bands follow the real C/B/A ring layout, including the Cassini Division
 * and Encke Gap; Uranus's rings are faint and narrow.
 */
export function generateRingTexture(kind: RingKind, width: number): TextureData {
  const data = new Uint8Array(width * 4);
  const noise = createNoise3D(kind === "saturn" ? 1111 : 1212);

  for (let i = 0; i < width; i++) {
    const u = (i + 0.5) / width;
    const grain = fbm(noise, u * 60, 0.5, 0.5, 3);
    let alpha: number;
    let color: Rgb;

    if (kind === "saturn") {
      const r = 1.24 + u * (2.27 - 1.24); // planet radii
      if (r < 1.53) alpha = 0.25; // C ring
      else if (r < 1.95) alpha = 0.9; // B ring
      else if (r < 2.03) alpha = 0.06; // Cassini Division
      else if (r > 2.205 && r < 2.215) alpha = 0.05; // Encke Gap
      else alpha = 0.65; // A ring
      alpha *= 0.7 + grain * 0.6;
      color = lerpRgb([0.62, 0.55, 0.45], [0.92, 0.85, 0.72], grain);
    } else {
      const r = 1.64 + u * (2.05 - 1.64);
      const narrow = [1.66, 1.73, 1.8, 1.86, 1.95].some((c) => Math.abs(r - c) < 0.006);
      const epsilon = Math.abs(r - 2.0) < 0.02; // brightest (epsilon) ring
      alpha = epsilon ? 0.55 : narrow ? 0.3 : 0.02;
      color = [0.7, 0.75, 0.78];
    }

    data[i * 4] = clampByte(color[0]);
    data[i * 4 + 1] = clampByte(color[1]);
    data[i * 4 + 2] = clampByte(color[2]);
    data[i * 4 + 3] = clampByte(alpha);
  }

  return { data, width, height: 1 };
}

/** A serializable description of one texture, so it can be generated in a Web Worker. */
export type TextureRequest =
  | { type: "planet"; kind: SurfaceKind; width: number }
  | { type: "clouds"; width: number }
  | { type: "sun"; width: number };

export function textureKey(request: TextureRequest): string {
  return request.type === "planet"
    ? `planet:${request.kind}:${request.width}`
    : `${request.type}:${request.width}`;
}

export function generateTexture(request: TextureRequest): TextureData {
  switch (request.type) {
    case "planet":
      return generatePlanetTexture(request.kind, request.width);
    case "clouds":
      return generateCloudTexture(request.width);
    case "sun":
      return generateSunTexture(request.width);
  }
}
