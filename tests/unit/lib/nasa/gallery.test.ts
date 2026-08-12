import { describe, expect, it, vi, afterEach } from "vitest";
import { searchGallery } from "@/lib/nasa/gallery";

function rawItem(nasaId: string, dateCreated: string) {
  return {
    href: `https://images-assets.nasa.gov/image/${nasaId}/collection.json`,
    data: [
      {
        nasa_id: nasaId,
        title: nasaId,
        date_created: dateCreated,
        media_type: "image",
      },
    ],
    links: [],
  };
}

describe("searchGallery", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sorts results by dateCreated descending", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            collection: {
              items: [
                rawItem("oldest", "2020-01-01T00:00:00Z"),
                rawItem("newest", "2024-06-15T00:00:00Z"),
                rawItem("middle", "2022-03-10T00:00:00Z"),
              ],
              metadata: { total_hits: 3 },
            },
          }),
          { status: 200 }
        )
      )
    );

    const { items } = await searchGallery();
    expect(items.map((i) => i.nasaId)).toEqual(["newest", "middle", "oldest"]);
  });
});
