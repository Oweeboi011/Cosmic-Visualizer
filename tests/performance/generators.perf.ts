import { describe, expect, it } from "vitest";
import { generateGalaxy, GALAXY_MORPHOLOGIES } from "@/lib/galaxy3d/generateGalaxy";
import { generateTexture, generateRingTexture } from "@/lib/space3d/planetTextures";

/**
 * Budgets for the CPU-heavy procedural generators that run in the browser (main thread or
 * the texture worker). Measured medians on a developer laptop: galaxy ~5 ms, Earth texture ~410 ms, ring <1 ms;
 * budgets are 3-5x that, so they catch
 * algorithmic regressions (an accidental O(n²), a per-pixel allocation), not noise.
 */
function medianMs(fn: () => void, runs = 5): number {
  fn(); // warm up the JIT
  const times = Array.from({ length: runs }, () => {
    const start = performance.now();
    fn();
    return performance.now() - start;
  });
  return times.sort((a, b) => a - b)[Math.floor(runs / 2)];
}

describe("generator budgets", () => {
  it.each(GALAXY_MORPHOLOGIES.map((m) => m.key))("%s galaxy, 20k particles: < 25 ms", (morphology) => {
    const ms = medianMs(() =>
      generateGalaxy({ morphology, particleCount: 20_000, clickableStarCount: 80, seed: 7 }),
    );
    expect(ms).toBeLessThan(25);
  });

  it("1024px Earth surface texture (the worker's largest job): < 1500 ms", () => {
    expect(medianMs(() => generateTexture({ type: "planet", kind: "earth", width: 1024 }), 3)).toBeLessThan(
      1500,
    );
  });

  it("ring strip, generated inline on the main thread: < 10 ms", () => {
    expect(medianMs(() => generateRingTexture("saturn", 512))).toBeLessThan(10);
  });
});
