"use client";

import * as THREE from "three";
import {
  generateCloudTexture,
  generatePlanetTexture,
  generateRingTexture,
  generateSunTexture,
  type TextureData,
} from "@/lib/space3d/planetTextures";
import type { RingKind, SurfaceKind } from "@/lib/space3d/planetAppearance";

/**
 * Procedural textures are expensive to generate (tens of ms each), so they're built
 * once per kind/size and kept for the session. The set is small and bounded (a few
 * dozen textures at most), and three.js textures can be shared across canvases.
 */
const cache = new Map<string, THREE.Texture>();

function toDataTexture(tex: TextureData, wrap = true): THREE.DataTexture {
  const texture = new THREE.DataTexture(tex.data, tex.width, tex.height, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = wrap ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

function cached<T extends THREE.Texture>(key: string, build: () => T): T {
  let texture = cache.get(key) as T | undefined;
  if (!texture) {
    texture = build();
    cache.set(key, texture);
  }
  return texture;
}

export function getPlanetTexture(kind: SurfaceKind, width: number) {
  return cached(`planet:${kind}:${width}`, () => toDataTexture(generatePlanetTexture(kind, width)));
}

export function getCloudTexture(width: number) {
  return cached(`clouds:${width}`, () => toDataTexture(generateCloudTexture(width)));
}

export function getSunTexture(width: number) {
  return cached(`sun:${width}`, () => toDataTexture(generateSunTexture(width)));
}

export function getRingTexture(kind: RingKind) {
  return cached(`ring:${kind}`, () => toDataTexture(generateRingTexture(kind, 512), false));
}

/** Soft radial falloff used for sprite glows (Sun corona, galaxy core, star halos). */
export function getGlowTexture() {
  return cached("glow", () => {
    const size = 128;
    const data = new Uint8Array(size * size * 4);
    for (let j = 0; j < size; j++) {
      for (let i = 0; i < size; i++) {
        const d = Math.hypot(i - size / 2 + 0.5, j - size / 2 + 0.5) / (size / 2);
        const a = Math.pow(Math.max(0, 1 - d), 2.2);
        const idx = (j * size + i) * 4;
        data[idx] = data[idx + 1] = data[idx + 2] = 255;
        data[idx + 3] = Math.round(a * 255);
      }
    }
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  });
}
