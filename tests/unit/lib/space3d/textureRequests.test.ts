import { describe, expect, it } from "vitest";
import { generateTexture, textureKey } from "@/lib/space3d/planetTextures";

describe("texture requests", () => {
  it("keys textures by type, kind, and size", () => {
    expect(textureKey({ type: "planet", kind: "earth", width: 256 })).toBe("planet:earth:256");
    expect(textureKey({ type: "clouds", width: 256 })).toBe("clouds:256");
    expect(textureKey({ type: "sun", width: 512 })).toBe("sun:512");
  });

  it("generates equirectangular RGBA data for each request type", () => {
    for (const request of [
      { type: "planet", kind: "mars", width: 32 },
      { type: "clouds", width: 32 },
      { type: "sun", width: 32 },
    ] as const) {
      const tex = generateTexture(request);
      expect(tex.width).toBe(32);
      expect(tex.height).toBe(16);
      expect(tex.data.length).toBe(32 * 16 * 4);
    }
  });
});
