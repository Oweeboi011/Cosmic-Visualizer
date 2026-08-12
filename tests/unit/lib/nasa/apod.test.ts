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
});
