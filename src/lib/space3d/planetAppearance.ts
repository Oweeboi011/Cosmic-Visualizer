/**
 * Physical/visual parameters for rendering Solar System planets in 3D. Tilt,
 * rotation, and orbital values are real (NASA planetary fact sheets); colors and
 * surface styles are artistic approximations rendered from procedural textures.
 */

export type SurfaceKind =
  | "mercury"
  | "venus"
  | "earth"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune";

export type RingKind = "saturn" | "uranus";

export interface PlanetAppearance {
  surface: SurfaceKind;
  /** Obliquity to orbit. Values > 90° mean retrograde spin (Venus, Uranus). */
  axialTiltDeg: number;
  siderealRotationHours: number;
  /** Ring extent in multiples of the planet's radius. */
  rings?: { kind: RingKind; innerRadius: number; outerRadius: number };
  atmosphere?: { color: string; intensity: number };
  clouds?: boolean;
}

export interface OrbitalElements {
  semiMajorAxisAu: number;
  /** Sidereal orbital period, more precise than the rounded display value. */
  periodDays: number;
  /** Mean longitude at the J2000.0 epoch (2000-01-01 12:00 TT). */
  meanLongitudeJ2000Deg: number;
}

export const PLANET_APPEARANCE: Record<string, PlanetAppearance> = {
  Mercury: { surface: "mercury", axialTiltDeg: 0.03, siderealRotationHours: 1407.6 },
  Venus: {
    surface: "venus",
    axialTiltDeg: 177.4,
    siderealRotationHours: 5832.5,
    atmosphere: { color: "#ffd9a0", intensity: 0.9 },
  },
  Earth: {
    surface: "earth",
    axialTiltDeg: 23.44,
    siderealRotationHours: 23.93,
    atmosphere: { color: "#5fa8ff", intensity: 1 },
    clouds: true,
  },
  Mars: {
    surface: "mars",
    axialTiltDeg: 25.19,
    siderealRotationHours: 24.62,
    atmosphere: { color: "#ff9a6b", intensity: 0.35 },
  },
  Jupiter: {
    surface: "jupiter",
    axialTiltDeg: 3.13,
    siderealRotationHours: 9.93,
    atmosphere: { color: "#f3dcb8", intensity: 0.35 },
  },
  Saturn: {
    surface: "saturn",
    axialTiltDeg: 26.73,
    siderealRotationHours: 10.66,
    rings: { kind: "saturn", innerRadius: 1.24, outerRadius: 2.27 },
    atmosphere: { color: "#f5e3b5", intensity: 0.3 },
  },
  Uranus: {
    surface: "uranus",
    axialTiltDeg: 97.77,
    siderealRotationHours: 17.24,
    rings: { kind: "uranus", innerRadius: 1.64, outerRadius: 2.05 },
    atmosphere: { color: "#9ee8f0", intensity: 0.6 },
  },
  Neptune: {
    surface: "neptune",
    axialTiltDeg: 28.32,
    siderealRotationHours: 16.11,
    atmosphere: { color: "#6d8dff", intensity: 0.7 },
  },
};

export const PLANET_ORBITS: Record<string, OrbitalElements> = {
  Mercury: { semiMajorAxisAu: 0.387, periodDays: 87.969, meanLongitudeJ2000Deg: 252.25 },
  Venus: { semiMajorAxisAu: 0.723, periodDays: 224.701, meanLongitudeJ2000Deg: 181.98 },
  Earth: { semiMajorAxisAu: 1.0, periodDays: 365.256, meanLongitudeJ2000Deg: 100.46 },
  Mars: { semiMajorAxisAu: 1.524, periodDays: 686.98, meanLongitudeJ2000Deg: 355.45 },
  Jupiter: { semiMajorAxisAu: 5.203, periodDays: 4332.59, meanLongitudeJ2000Deg: 34.4 },
  Saturn: { semiMajorAxisAu: 9.537, periodDays: 10759.22, meanLongitudeJ2000Deg: 49.94 },
  Uranus: { semiMajorAxisAu: 19.191, periodDays: 30688.5, meanLongitudeJ2000Deg: 313.23 },
  Neptune: { semiMajorAxisAu: 30.069, periodDays: 60182, meanLongitudeJ2000Deg: 304.88 },
};

const FALLBACK_APPEARANCE: PlanetAppearance = {
  surface: "mercury",
  axialTiltDeg: 0,
  siderealRotationHours: 24,
};

export function getPlanetAppearance(name: string): PlanetAppearance {
  return PLANET_APPEARANCE[name] ?? FALLBACK_APPEARANCE;
}

const J2000_MS = Date.UTC(2000, 0, 1, 12);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function daysSinceJ2000(date: Date): number {
  return (date.getTime() - J2000_MS) / MS_PER_DAY;
}

export function dateFromDaysSinceJ2000(days: number): Date {
  return new Date(J2000_MS + days * MS_PER_DAY);
}

/**
 * Heliocentric ecliptic longitude (radians) under a circular-orbit approximation.
 * Accurate to within a few degrees for the major planets over recent centuries —
 * good enough to show where each planet actually is today.
 */
export function meanLongitudeRad(orbit: OrbitalElements, daysJ2000: number): number {
  const deg = orbit.meanLongitudeJ2000Deg + (360 / orbit.periodDays) * daysJ2000;
  return (((deg % 360) + 360) % 360) * (Math.PI / 180);
}

/**
 * True-scale distances would put Neptune 77× farther out than Mercury, so orbits are
 * log-compressed for display. Order and relative spacing are preserved.
 */
export function orbitDisplayRadius(au: number): number {
  return 6 + 9 * Math.log2(1 + au);
}

/** Square-root-compressed planet radius (Mercury ≈ 0.55, Jupiter ≈ 1.64). */
export function planetDisplayRadius(diameterKm: number): number {
  return 0.3 + 0.25 * Math.sqrt(diameterKm / 4879);
}
