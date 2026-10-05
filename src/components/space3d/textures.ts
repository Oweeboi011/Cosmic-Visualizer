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

// One shared worker; `null` once it has failed, so we stop using it.
let worker: Worker | null | undefined;
let nextRequestId = 0;
interface WorkerJob {
  request: TextureRequest;
  resolve: (texture: TextureData) => void;
  reject: (error: unknown) => void;
}
const workerJobs = new Map<number, WorkerJob>();

/** Inline generation: slower to first frame, but still correct. */
const generateInline = (request: TextureRequest) => Promise.resolve().then(() => generateTexture(request));

function getWorker(): Worker | null {
  if (worker !== undefined) return worker;
  try {
    worker = new Worker(new URL("./texture.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (event: MessageEvent<{ id: number; texture: TextureData }>) => {
      workerJobs.get(event.data.id)?.resolve(event.data.texture);
      workerJobs.delete(event.data.id);
    };
    // A module worker that fails to load or run reports here, not from the constructor.
    // Drop it and finish every waiting job inline so no texture promise hangs.
    worker.onerror = () => {
      worker?.terminate();
      worker = null;
      for (const { request, resolve, reject } of workerJobs.values())
        generateInline(request).then(resolve, reject);
      workerJobs.clear();
    };
  } catch {
    worker = null;
  }
  return worker;
}

function generateOffMainThread(request: TextureRequest): Promise<TextureData> {
  const w = getWorker();
  if (!w) return generateInline(request);
  return new Promise((resolve, reject) => {
    const id = nextRequestId++;
    workerJobs.set(id, { request, resolve, reject });
    w.postMessage({ id, request });
  });
}

function loadTexture(request: TextureRequest): Promise<THREE.Texture> {
  const key = textureKey(request);
  let promise = pending.get(key);
  if (!promise) {
    promise = generateOffMainThread(request).then((data) => cached(key, () => toDataTexture(data)));
    // A failed generation must not pin the key: drop it so a later mount can retry.
    promise.catch(() => pending.delete(key));
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
    loadTexture(request).then(
      (texture) => {
        if (!cancelled) setLoaded({ key, texture });
      },
      // Keep the plain material; the texture is cosmetic.
      (error: unknown) => console.warn("Procedural texture failed", key, error),
    );
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
