import { describe, expect, it } from "vitest";
import { dailySeedForAsset, hashStringToSeed, todayUtcDateString } from "@/lib/galaxy3d/seed";

describe("seed", () => {
  it("hashes deterministically to an unsigned 32-bit integer", () => {
    const seed = hashStringToSeed("PIA12345");
    expect(seed).toBe(hashStringToSeed("PIA12345"));
    expect(seed).not.toBe(hashStringToSeed("PIA12346"));
    expect(Number.isInteger(seed) && seed >= 0 && seed < 2 ** 32).toBe(true);
  });

  it("reseeds once per UTC day", () => {
    const late = new Date("2026-10-06T23:59:00Z");
    expect(todayUtcDateString(late)).toBe("2026-10-06");
    const today = dailySeedForAsset("PIA1", late);
    expect(dailySeedForAsset("PIA1", new Date("2026-10-06T00:00:01Z"))).toBe(today);
    expect(dailySeedForAsset("PIA1", new Date("2026-10-07T00:00:01Z"))).not.toBe(today);
  });
});
