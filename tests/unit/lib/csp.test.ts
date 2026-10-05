import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy } from "@/lib/csp";

function directives(csp: string) {
  return Object.fromEntries(
    csp.split("; ").map((d) => {
      const [name, ...values] = d.split(" ");
      return [name, values.join(" ")];
    })
  );
}

describe("buildContentSecurityPolicy", () => {
  it("allows only nonce-bearing scripts in production", () => {
    const csp = directives(buildContentSecurityPolicy("abc123", false));
    expect(csp["script-src"]).toBe("'self' 'nonce-abc123' 'strict-dynamic'");
    expect(csp["frame-ancestors"]).toBe("'none'");
    expect(csp["object-src"]).toBe("'none'");
    expect(csp).toHaveProperty("upgrade-insecure-requests");
  });

  it("adds eval and HMR websockets only in development", () => {
    const csp = directives(buildContentSecurityPolicy("abc123", true));
    expect(csp["script-src"]).toContain("'unsafe-eval'");
    expect(csp["connect-src"]).toContain("ws:");
    expect(csp).not.toHaveProperty("upgrade-insecure-requests");
  });
});
