# 0009. Publish `visuals/` to GitHub Pages

- Status: Accepted
- Date: 2026-10-06

## Context

We want a public demo now. GitHub Pages serves static files only. The Next app can't run
there: it needs a Node server for the nonce CSP ([0004](0004-nonce-csp-via-proxy.md)), the
server-only NASA key ([0001](0001-server-only-nasa-key.md)), `/api/gallery` and image
optimization. `visuals/` builds to a static bundle with no secrets ([0008](0008-gate-visuals-typecheck-and-audit.md)).

## Decision

`.github/workflows/pages.yml` builds `visuals/` with base `/<repo>/` and deploys it to Pages on
pushes to `main` that touch `visuals/`, or on manual dispatch. The Next app's hosting is
still open ([delivery](../solution-plan/delivery.md#open-decisions)).

## Consequences

- The public URL shows the prototype, not the app. A static export of the app would need new
  ADRs replacing 0001 and 0004.
- `visuals/` is now shipped: it must never embed model API keys, and avatar `.vrm` files stay
  out of the repo (licensing).
