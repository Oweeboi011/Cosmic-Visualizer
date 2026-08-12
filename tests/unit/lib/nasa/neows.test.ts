import { describe, expect, it, vi, afterEach } from "vitest";
import { getNeos } from "@/lib/nasa/neows";

describe("getNeos", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("flattens per-date NEOs and sorts by closest approach date", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            near_earth_objects: {
              "2026-01-02": [
                {
                  id: "2",
                  name: "2026 AB",
                  is_potentially_hazardous_asteroid: true,
                  estimated_diameter: {
                    meters: { estimated_diameter_min: 10, estimated_diameter_max: 20 },
                  },
                  close_approach_data: [
                    {
                      close_approach_date: "2026-01-02",
                      miss_distance: { kilometers: "1234567.8" },
                      relative_velocity: { kilometers_per_hour: "50000" },
                    },
                  ],
                },
              ],
              "2026-01-01": [
                {
                  id: "1",
                  name: "2026 AA",
                  is_potentially_hazardous_asteroid: false,
                  estimated_diameter: {
                    meters: { estimated_diameter_min: 5, estimated_diameter_max: 8 },
                  },
                  close_approach_data: [
                    {
                      close_approach_date: "2026-01-01",
                      miss_distance: { kilometers: "999999.9" },
                      relative_velocity: { kilometers_per_hour: "40000" },
                    },
                  ],
                },
              ],
            },
          }),
          { status: 200 }
        )
      )
    );

    const items = await getNeos();
    expect(items.map((i) => i.id)).toEqual(["1", "2"]);
    expect(items[0].missDistanceKm).toBeCloseTo(999999.9);
    expect(items[1].isPotentiallyHazardous).toBe(true);
  });

  it("skips NEOs with no close approach data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            near_earth_objects: {
              "2026-01-01": [
                {
                  id: "1",
                  name: "No approach",
                  is_potentially_hazardous_asteroid: false,
                  estimated_diameter: { meters: { estimated_diameter_min: 1, estimated_diameter_max: 2 } },
                  close_approach_data: [],
                },
              ],
            },
          }),
          { status: 200 }
        )
      )
    );
    const items = await getNeos();
    expect(items).toHaveLength(0);
  });
});
