"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import {
  generateRingTexture,
  generateTexture,
  textureKey,
  type TextureData,
  type TextureRequest,
} from "@/lib/space3d/planetTextures";
import type { RingKind } from "@/lib/space3d/planetAppearance";

/**
 * Procedural textures are expensive to generate (tens to hundreds of ms each), so they're
 * built once per kind/size and kept for the session. The set is small and bounded (a few
 * dozen textures at most), and three.js textures can be shared across canvases.
 */
const cache = new Map<string, THREE.Texture>();
const pending = new Map<string, Promise<THREE.Texture>>();

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

// One shared worker; `null` once creation has failed, so we stop retrying.
let worker: Worker | null | undefined;
let nextRequestId = 0;
const workerCallbacks = new Map<number, (texture: TextureData) => void>();

function getWorker(): Worker | null {
  if (worker !== undefined) return worker;
  try {
    worker = new Worker(new URL("./texture.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (event: MessageEvent<{ id: number; texture: TextureData }>) => {
      workerCallbacks.get(event.data.id)?.(event.data.texture);
      workerCallbacks.delete(event.data.id);
    };
  } catch {
    worker = null;
  }
  return worker;
}

function generateOffMainThread(request: TextureRequest): Promise<TextureData> {
  const w = getWorker();
  // Without worker support, generate inline: slower to first frame, but still correct.
  if (!w) return Promise.resolve().then(() => generateTexture(request));
  return new Promise((resolve) => {
    const id = nextRequestId++;
    workerCallbacks.set(id, resolve);
    w.postMessage({ id, request });
  });
}

function loadTexture(request: TextureRequest): Promise<THREE.Texture> {
  const key = textureKey(request);
  let promise = pending.get(key);
  if (!promise) {
    promise = generateOffMainThread(request).then((data) => cached(key, () => toDataTexture(data)));
    pending.set(key, promise);
  }
  return promise;
}

/**
 * The texture for `request`, or null while it's generated in a worker (render a plain
 * material meanwhile). Pass null to skip. Cached textures are returned immediately.
 */
export function useProceduralTexture(request: TextureRequest | null): THREE.Texture | null {
  const key = request ? textureKey(request) : null;
  const [loaded, setLoaded] = useState<{ key: string; texture: THREE.Texture } | null>(null);

  useEffect(() => {
    if (!request || !key || cache.has(key)) return;
    let cancelled = false;
    loadTexture(request).then((texture) => {
      if (!cancelled) setLoaded({ key, texture });
    });
    return () => {
      cancelled = true;
    };
    // `key` fully identifies `request`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!key) return null;
  return cache.get(key) ?? (loaded?.key === key ? loaded.texture : null);
}

/** Ring strips are 1px tall and cheap, so they're generated inline. */
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
