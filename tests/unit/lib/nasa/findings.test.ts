import { describe, expect, it, vi, afterEach } from "vitest";
import { getFindings } from "@/lib/nasa/findings";

const SAMPLE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>NASA Science</title>
  <item>
    <title>New Galaxy Discovered</title>
    <link>https://science.nasa.gov/example-post/</link>
    <guid isPermaLink="false">https://science.nasa.gov/?p=123</guid>
    <pubDate>Mon, 05 Jan 2026 12:00:00 +0000</pubDate>
    <description><![CDATA[<p>Astronomers found a new galaxy. <img src="https://example.com/photo.jpg" /></p>]]></description>
  </item>
</channel>
</rss>`;

describe("getFindings", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("parses live RSS items and extracts an inline image", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(SAMPLE_RSS, { status: 200 })));

    const items = await getFindings({ agency: "NASA" });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      title: "New Galaxy Discovered",
      link: "https://science.nasa.gov/example-post/",
      imageUrl: "https://example.com/photo.jpg",
      source: "live",
      agency: "NASA",
    });
  });

  it("aggregates and sorts items from all three agencies by publish date", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(SAMPLE_RSS, { status: 200 })));

    const items = await getFindings();
    expect(items).toHaveLength(3);
    expect(items.map((i) => i.agency).sort()).toEqual(["ESA", "ESO", "NASA"]);
  });

  it("falls back to the static dataset when the feed is unreachable", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      })
    );

    const items = await getFindings();
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((i) => i.source === "fallback")).toBe(true);
  });

  it("falls back to the static dataset when the feed returns no items", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(`<?xml version="1.0"?><rss version="2.0"><channel></channel></rss>`, {
            status: 200,
          })
      )
    );

    const items = await getFindings();
    expect(items.every((i) => i.source === "fallback")).toBe(true);
  });
});
