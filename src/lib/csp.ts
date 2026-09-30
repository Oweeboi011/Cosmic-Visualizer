/**
 * Content-Security-Policy for every page, with a per-request nonce (see src/proxy.ts).
 *
 * - Scripts: only nonce-bearing ones; `'strict-dynamic'` lets them load the page's chunks.
 * - Styles: `'unsafe-inline'` stays, because React `style` attributes (used for layout and
 *   by the 3D overlays) can't carry a nonce. Inline styles can't execute code.
 * - Images: any https source. Feed images can come from any host the agencies link to,
 *   and those render unoptimized (straight from the source) — see src/lib/images.ts.
 * - Workers: the texture worker is served from this origin; dev bundles use blob: URLs.
 */
export function buildContentSecurityPolicy(nonce: string, isDev: boolean): string {
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https:",
    "font-src 'self'",
    `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ];
  return directives.join("; ");
}
