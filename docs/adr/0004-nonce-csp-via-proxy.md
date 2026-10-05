# 0004. Nonce-based CSP set in proxy.ts

- Status: Accepted
- Date: 2026-10-01

## Context

The app renders third-party feed content and had no Content-Security-Policy. Next 16
renamed middleware to "proxy".

## Decision

`src/proxy.ts` creates a per-request nonce and sets the CSP built by `src/lib/csp.ts`.
Scripts need the nonce plus `'strict-dynamic'`. `style-src` keeps `'unsafe-inline'` because
React `style` attributes can't carry a nonce. The root layout calls `connection()`, so every
page renders dynamically and receives the nonce. Static security headers stay in `next.config.ts`.

## Consequences

- No page is statically prerendered. Upstream data is still cached by `fetch` revalidation.
- Hosting needs a Node runtime ([delivery](../solution-plan/delivery.md#open-decisions)).
- Covered by `tests/integration/proxy.test.ts` and the e2e CSP check.
