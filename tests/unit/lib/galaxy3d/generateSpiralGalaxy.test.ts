import { describe, expect, it } from "vitest";
import { generateSpiralGalaxy } from "@/lib/galaxy3d/generateSpiralGalaxy";

describe("generateSpiralGalaxy", () => {
  it("produces the requested number of particles", () => {
    const { positions, colors } = generateSpiralGalaxy({ particleCount: 500 });
    expect(positions.length).toBe(500 * 3);
    expect(colors.length).toBe(500 * 3);
  });

  it("keeps positions within the configured galaxy radius", () => {
    const galaxyRadius = 14;
    const { positions } = generateSpiralGalaxy({ particleCount: 2000, galaxyRadius });

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      const radialDistance = Math.sqrt(x * x + z * z);
      expect(radialDistance).toBeLessThanOrEqual(galaxyRadius * 1.05);
    }
  });

  it("is deterministic for a fixed seed", () => {
    const a = generateSpiralGalaxy({ particleCount: 300, seed: 42 });
    const b = generateSpiralGalaxy({ particleCount: 300, seed: 42 });
    expect(a.positions).toEqual(b.positions);
    expect(a.colors).toEqual(b.colors);
    expect(a.clickableIndices).toEqual(b.clickableIndices);
  });

  it("produces different output for a different seed", () => {
    const a = generateSpiralGalaxy({ particleCount: 300, seed: 1 });
    const b = generateSpiralGalaxy({ particleCount: 300, seed: 2 });
    expect(a.positions).not.toEqual(b.positions);
  });

  it("keeps colors within valid RGB range", () => {
    const { colors } = generateSpiralGalaxy({ particleCount: 500 });
    for (const c of colors) {
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThanOrEqual(1);
    }
  });

  it("returns a non-empty subset of clickable indices, all within bounds", () => {
    const { clickableIndices } = generateSpiralGalaxy({
      particleCount: 1000,
      clickableStarCount: 50,
    });
    expect(clickableIndices.length).toBeGreaterThan(0);
    expect(clickableIndices.length).toBeLessThanOrEqual(50);
    for (const idx of clickableIndices) {
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(1000);
    }
    expect(new Set(clickableIndices).size).toBe(clickableIndices.length);
  });
});
