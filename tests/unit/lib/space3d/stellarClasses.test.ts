import { describe, expect, it } from "vitest";
import { STELLAR_CLASSES, starDisplayRadius } from "@/lib/space3d/stellarClasses";

describe("stellar classes", () => {
  it("lists O through M in temperature order", () => {
    expect(STELLAR_CLASSES.map((c) => c.spectralClass).join("")).toBe("OBAFGKM");
  });

  it("sizes stars monotonically by representative radius", () => {
    const sizes = STELLAR_CLASSES.map((c) => starDisplayRadius(c.typicalRadiusSolar));
    for (let i = 1; i < sizes.length; i++) expect(sizes[i]).toBeLessThanOrEqual(sizes[i - 1]);
    expect(sizes.every((s) => s > 1 && s < 7)).toBe(true);
  });

  it("uses valid hex colors", () => {
    for (const c of STELLAR_CLASSES) expect(c.color).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
