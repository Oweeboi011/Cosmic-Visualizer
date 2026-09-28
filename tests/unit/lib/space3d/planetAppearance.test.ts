import { describe, expect, it } from "vitest";
import solarSystemData from "@/data/solarSystem.json";
import {
  PLANET_APPEARANCE,
  PLANET_ORBITS,
  dateFromDaysSinceJ2000,
  daysSinceJ2000,
  getPlanetAppearance,
  meanLongitudeRad,
  orbitDisplayRadius,
  planetDisplayRadius,
} from "@/lib/space3d/planetAppearance";

describe("planet appearance + orbit data", () => {
  it("covers every planet in the Solar System dataset", () => {
    for (const planet of solarSystemData) {
      expect(PLANET_APPEARANCE[planet.name]).toBeDefined();
      expect(PLANET_ORBITS[planet.name]).toBeDefined();
    }
  });

  it("falls back to a neutral appearance for unknown bodies", () => {
    expect(getPlanetAppearance("Planet Nine").surface).toBe("mercury");
  });

  it("round-trips dates through days-since-J2000", () => {
    const date = new Date("2026-09-28T00:00:00Z");
    expect(dateFromDaysSinceJ2000(daysSinceJ2000(date)).getTime()).toBe(date.getTime());
    expect(daysSinceJ2000(new Date(Date.UTC(2000, 0, 1, 12)))).toBe(0);
  });

  it("returns a planet to the same longitude after one orbital period", () => {
    const earth = PLANET_ORBITS.Earth;
    const start = meanLongitudeRad(earth, 1000);
    const after = meanLongitudeRad(earth, 1000 + earth.periodDays);
    expect(after).toBeCloseTo(start, 6);
  });

  it("matches the J2000 epoch longitude and stays within [0, 2π)", () => {
    expect(meanLongitudeRad(PLANET_ORBITS.Earth, 0)).toBeCloseTo((100.46 * Math.PI) / 180, 6);
    for (const orbit of Object.values(PLANET_ORBITS)) {
      for (const days of [-50000, 0, 9766, 123456]) {
        const l = meanLongitudeRad(orbit, days);
        expect(l).toBeGreaterThanOrEqual(0);
        expect(l).toBeLessThan(Math.PI * 2);
      }
    }
  });

  it("keeps display orbits ordered and clear of each other and the Sun", () => {
    const ordered = solarSystemData
      .map((p) => ({
        orbit: orbitDisplayRadius(PLANET_ORBITS[p.name].semiMajorAxisAu),
        radius: planetDisplayRadius(p.diameterKm),
      }))
      .sort((a, b) => a.orbit - b.orbit);

    const SUN_RADIUS = 4;
    expect(ordered[0].orbit - ordered[0].radius).toBeGreaterThan(SUN_RADIUS);
    for (let i = 1; i < ordered.length; i++) {
      expect(ordered[i].orbit - ordered[i].radius).toBeGreaterThan(
        ordered[i - 1].orbit + ordered[i - 1].radius
      );
    }
  });
});
