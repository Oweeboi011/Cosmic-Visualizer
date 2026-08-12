import { describe, expect, it, vi, afterEach } from "vitest";
import { getExoplanets } from "@/lib/nasa/exoplanets";

describe("getExoplanets", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("normalizes rows from the TAP response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify([
            {
              pl_name: "Kepler-442 b",
              hostname: "Kepler-442",
              disc_year: 2015,
              discoverymethod: "Transit",
              pl_rade: 1.34,
              pl_bmasse: 2.3,
              pl_orbper: 112.3,
              sy_dist: 370.6,
            },
          ]),
          { status: 200 }
        )
      )
    );

    const { items } = await getExoplanets();
    expect(items).toEqual([
      {
        name: "Kepler-442 b",
        hostname: "Kepler-442",
        discoveryYear: 2015,
        discoveryMethod: "Transit",
        radiusEarth: 1.34,
        massEarth: 2.3,
        orbitalPeriodDays: 112.3,
        distanceParsecs: 370.6,
      },
    ]);
  });

  it("only embeds an allowlisted discovery method into the query", async () => {
    const fetchMock = vi.fn(async (_url: string) => new Response(JSON.stringify([]), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await getExoplanets({ discoveryMethod: "'; DROP TABLE pscomppars; --" });
    const calledUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(calledUrl.searchParams.get("query")).not.toContain("DROP TABLE");
    expect(calledUrl.searchParams.get("query")).not.toContain("where");

    await getExoplanets({ discoveryMethod: "Transit" });
    const secondCallUrl = new URL(fetchMock.mock.calls[1][0]);
    expect(secondCallUrl.searchParams.get("query")).toContain("discoverymethod = 'Transit'");
  });

  it("clamps limit to the documented maximum", async () => {
    const fetchMock = vi.fn(async (_url: string) => new Response(JSON.stringify([]), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await getExoplanets({ limit: 9999 });
    const calledUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(calledUrl.searchParams.get("query")).toContain("top 200");
  });
});
