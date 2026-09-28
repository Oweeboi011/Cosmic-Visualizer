import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { getApod } from "@/lib/nasa/apod";

describe("getApod", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            date: "2026-01-01",
            title: "A Distant Galaxy",
            explanation: "Some explanation text.",
            media_type: "image",
            url: "https://apod.nasa.gov/apod/image/test.jpg",
            hdurl: "https://apod.nasa.gov/apod/image/test_hd.jpg",
          }),
          { status: 200 }
        )
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("normalizes a single-day response into an array", async () => {
    const items = await getApod({ date: "2026-01-01" });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      date: "2026-01-01",
      title: "A Distant Galaxy",
      mediaType: "image",
      url: "https://apod.nasa.gov/apod/image/test.jpg",
    });
  });

  it("falls back to media type 'other' for unrecognized types", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            date: "2026-01-01",
            title: "Weird media",
            explanation: "x",
            media_type: "interactive",
            url: "https://apod.nasa.gov/x",
          }),
          { status: 200 }
        )
      )
    );
    const items = await getApod({ date: "2026-01-01" });
    expect(items[0].mediaType).toBe("other");
  });

  it("throws a NasaApiError when upstream returns a non-OK status", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 500 })));
    await expect(getApod({ date: "2026-01-01" })).rejects.toMatchObject({
      name: "NasaApiError",
      status: 502,
    });
  });

  describe("date ranges", () => {
    function requestedRange(fetchMock: ReturnType<typeof vi.fn>) {
      const url = new URL(fetchMock.mock.calls[0][0] as string);
      return { start: url.searchParams.get("start_date"), end: url.searchParams.get("end_date") };
    }
    const daysBetween = (a: string, b: string) => (Date.parse(b) - Date.parse(a)) / 86_400_000;

    it("bounds a start-only range to 30 days from the start, not everything up to today", async () => {
      const fetchMock = vi.fn(async (_url: string) => new Response("[]", { status: 200 }));
      vi.stubGlobal("fetch", fetchMock);
      await getApod({ startDate: "1995-06-16" });
      expect(requestedRange(fetchMock)).toEqual({ start: "1995-06-16", end: "1995-07-16" });
    });

    it("clamps an over-long explicit range to 30 days", async () => {
      const fetchMock = vi.fn(async (_url: string) => new Response("[]", { status: 200 }));
      vi.stubGlobal("fetch", fetchMock);
      await getApod({ startDate: "2020-01-01", endDate: "2021-01-01" });
      const { start, end } = requestedRange(fetchMock);
      expect(end).toBe("2021-01-01");
      expect(daysBetween(start!, end!)).toBe(30);
    });

    it("reorders a reversed range instead of sending start > end upstream", async () => {
      const fetchMock = vi.fn(async (_url: string) => new Response("[]", { status: 200 }));
      vi.stubGlobal("fetch", fetchMock);
      await getApod({ startDate: "2026-01-10", endDate: "2026-01-01" });
      expect(requestedRange(fetchMock)).toEqual({ start: "2026-01-01", end: "2026-01-10" });
    });
  });
});
