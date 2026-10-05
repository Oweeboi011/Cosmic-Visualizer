import { describe, expect, it } from "vitest";
import { isOptimizableImage } from "@/lib/images";

describe("isOptimizableImage", () => {
  it("allows NASA, ESA, and ESO image hosts", () => {
    expect(isOptimizableImage("https://images-assets.nasa.gov/image/PIA04921/PIA04921~thumb.jpg")).toBe(true);
    expect(isOptimizableImage("https://science.nasa.gov/wp-content/uploads/a.jpg")).toBe(true);
    expect(isOptimizableImage("https://www.esa.int/var/esa/storage/images/a.jpg")).toBe(true);
    expect(isOptimizableImage("https://cdn.eso.org/images/screen/eso2601a.jpg")).toBe(true);
  });

  it("rejects other hosts, look-alike domains, and non-web URLs", () => {
    expect(isOptimizableImage("https://example.com/a.jpg")).toBe(false);
    expect(isOptimizableImage("https://evilnasa.gov/a.jpg")).toBe(false);
    expect(isOptimizableImage("https://nasa.gov.evil.com/a.jpg")).toBe(false);
    expect(isOptimizableImage("https://esa.int/a.jpg")).toBe(false);
    expect(isOptimizableImage("data:image/png;base64,AAAA")).toBe(false);
    expect(isOptimizableImage("not a url")).toBe(false);
  });
});
