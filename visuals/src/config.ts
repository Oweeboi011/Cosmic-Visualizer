/**
 * Every tweakable value in one mutable object. The lil-gui panel edits it in place and
 * calls the matching `apply*` hook; scene modules read it when (re)building.
 */
export const params = {
  galaxy: {
    count: 100_000,
    arms: 4,
    radius: 50,
    /** How tightly the arms wind (radians of twist per unit of radius). */
    twist: 0.18,
    /** Scatter around each arm, as a fraction of radius. */
    randomness: 0.32,
    /** Higher concentrates particles closer to the arm centerline. */
    randomnessPower: 2.6,
    /** Pattern rotation in radians per second (spiral arms rotate as a rigid density wave). */
    rotationSpeed: 0.02,
    particleSize: 0.22,
    coreColor: "#ffb36b",
    armColor: "#3d6bff",
  },
  stars: {
    count: 8_000,
    twinkle: 0.35,
  },
  nebula: {
    count: 26,
    opacity: 0.3,
    visible: true,
  },
  bloom: {
    strength: 0.9,
    radius: 0.55,
    threshold: 0.08,
  },
  camera: {
    cruiseSpeed: 9,
    parallax: 0.04,
  },
};

export type Params = typeof params;

/** Capped: beyond 2x the extra fill rate costs frames without visible gain. */
export const MAX_PIXEL_RATIO = 2;
