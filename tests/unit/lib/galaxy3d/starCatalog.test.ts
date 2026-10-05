import { describe, expect, it } from "vitest";
import { getStarCatalogEntry } from "@/lib/galaxy3d/starCatalog";

describe("getStarCatalogEntry", () => {
  it("labels by index and cycles search terms", () => {
    expect(getStarCatalogEntry(0)).toEqual({ id: 0, label: "Star Cluster A-0", searchTerm: "spiral galaxy" });
    expect(getStarCatalogEntry(8).searchTerm).toBe("spiral galaxy");
    expect(getStarCatalogEntry(27).label).toBe("Star Cluster B-27");
  });
});
