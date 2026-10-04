import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { config, proxy } from "@/proxy";

/** proxy.ts + lib/csp.ts together: the nonce must reach both the page render and the browser. */
describe("proxy (CSP)", () => {
  it("sets the same per-request nonce on the response CSP and the forwarded request", () => {
    const res = proxy(new NextRequest("http://localhost/alerts"));
    const csp = res.headers.get("Content-Security-Policy") ?? "";
    const nonce = /'nonce-([^']+)'/.exec(csp)?.[1];

    expect(nonce).toBeTruthy();
    // Next forwards overridden request headers to the render as x-middleware-request-*.
    expect(res.headers.get("x-middleware-request-x-nonce")).toBe(nonce);
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it("issues a fresh nonce per request", () => {
    const nonceOf = () =>
      /'nonce-([^']+)'/.exec(
        proxy(new NextRequest("http://localhost/")).headers.get("Content-Security-Policy")!,
      )?.[1];
    expect(nonceOf()).not.toBe(nonceOf());
  });

  it("skips API routes and static assets", () => {
    const pattern = new RegExp(`^${config.matcher[0].source}$`);
    expect(pattern.test("/alerts")).toBe(true);
    expect(pattern.test("/api/gallery")).toBe(false);
    expect(pattern.test("/_next/static/chunk.js")).toBe(false);
  });
});
