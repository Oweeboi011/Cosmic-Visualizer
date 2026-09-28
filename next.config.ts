import type { NextConfig } from "next";

/**
 * Baseline hardening headers. A Content-Security-Policy is not set yet: Next's inline
 * bootstrap scripts need nonce plumbing (see the CSP guide in Next's docs) — tracked
 * in docs/AUDIT.md. `fullscreen` is deliberately left allowed for the 3D full-window mode.
 */
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
