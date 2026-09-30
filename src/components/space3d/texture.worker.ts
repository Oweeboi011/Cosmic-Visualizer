/// <reference lib="webworker" />

import { generateTexture, type TextureRequest } from "@/lib/space3d/planetTextures";

/**
 * Generates procedural textures off the main thread: a 1024px Earth surface plus clouds
 * takes a few hundred ms, which would otherwise stall the page when a planet opens.
 */
self.onmessage = (event: MessageEvent<{ id: number; request: TextureRequest }>) => {
  const { id, request } = event.data;
  const texture = generateTexture(request);
  self.postMessage({ id, texture }, { transfer: [texture.data.buffer] });
};
