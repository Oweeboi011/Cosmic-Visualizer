import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/gallery/route";

/**
 * Route handler → lib/nasa/gallery → lib/nasa/client, wired for real. Only the network
 * boundary (global fetch) is stubbed.
 */
function stubUpstream(response: Response) {
  const fetchMock = vi.fn(async (_input: RequestInfo | URL) => response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const searchResponse = () =>
  new Response(
    JSON.stringify({
      collection: {
        items: [
          {
            href: "x",
            data: [{ nasa_id: "PIA1", title: "M31", media_type: "image" }],
            links: [{ href: "http://images-assets.nasa.gov/PIA1~thumb.jpg", rel: "preview" }],
          },
        ],
        metadata: { total_hits: 1 },
      },
    }),
  );

describe("GET /api/gallery", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns normalized items with a CDN cache header", async () => {
    stubUpstream(searchResponse());
    const res = await GET(new NextRequest("http://localhost/api/gallery?q=andromeda"));

    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=86400");
    const body = await res.json();
    expect(body.items[0]).toMatchObject({
      nasaId: "PIA1",
      title: "M31",
      thumbnailUrl: "https://images-assets.nasa.gov/PIA1~thumb.jpg",
    });
  });

  it("clamps the page and never sends the NASA API key to the keyless library", async () => {
    const fetchMock = stubUpstream(searchResponse());
    await GET(new NextRequest("http://localhost/api/gallery?q=m31&page=9999"));

    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.searchParams.get("page")).toBe("100");
    expect(url.searchParams.has("api_key")).toBe(false);
  });

  it.each([
    [404, 404, "UPSTREAM_NOT_FOUND"],
    [429, 429, "UPSTREAM_RATE_LIMITED"],
    [500, 502, "UPSTREAM_ERROR"],
  ])("maps upstream %i to %i %s", async (upstream, status, code) => {
    stubUpstream(new Response("nope", { status: upstream }));
    const res = await GET(new NextRequest("http://localhost/api/gallery"));
    expect(res.status).toBe(status);
    expect((await res.json()).error.code).toBe(code);
  });

  it("returns 502 when the upstream host is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new TypeError("fetch failed"))),
    );
    const res = await GET(new NextRequest("http://localhost/api/gallery"));
    expect(res.status).toBe(502);
    expect((await res.json()).error.code).toBe("UPSTREAM_UNREACHABLE");
  });
});
