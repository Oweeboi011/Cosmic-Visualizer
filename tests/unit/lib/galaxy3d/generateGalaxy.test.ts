import { describe, expect, it } from "vitest";
import { GALAXY_MORPHOLOGIES, generateGalaxy } from "@/lib/galaxy3d/generateGalaxy";

describe("generateGalaxy", () => {
  it.each(GALAXY_MORPHOLOGIES.map((m) => m.key))(
    "%s: produces finite particles and the requested clickable count",
    (morphology) => {
      const { positions, colors, clickableIndices } = generateGalaxy({
        morphology,
        particleCount: 3000,
        clickableStarCount: 40,
        seed: 42,
      });

      expect(positions.length).toBe(3000 * 3);
      expect(colors.length).toBe(3000 * 3);
      expect(positions.every(Number.isFinite)).toBe(true);
      expect(colors.every((c) => c >= 0 && c <= 1)).toBe(true);
      expect(clickableIndices).toHaveLength(40);
      expect(clickableIndices.every((i) => i >= 0 && i < 3000)).toBe(true);
    }
  );

  it("is deterministic for a given seed", () => {
    const params = { morphology: "barred-spiral" as const, particleCount: 500, clickableStarCount: 10, seed: 7 };
    expect(generateGalaxy(params).positions).toEqual(generateGalaxy(params).positions);
  });

  it("elliptical galaxies are flattened ellipsoids with no disk-only structure", () => {
    const { positions } = generateGalaxy({
      morphology: "elliptical",
      particleCount: 5000,
      clickableStarCount: 0,
      seed: 3,
    });
    let maxX = 0;
    let maxY = 0;
    for (let i = 0; i < positions.length; i += 3) {
      maxX = Math.max(maxX, Math.abs(positions[i]));
      maxY = Math.max(maxY, Math.abs(positions[i + 1]));
    }
    expect(maxY).toBeLessThan(maxX);
    expect(maxY).toBeGreaterThan(maxX * 0.3);
  });
});
