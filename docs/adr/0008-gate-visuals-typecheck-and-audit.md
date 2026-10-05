# 0008. Gate `visuals/` on typecheck and dependency audit

- Status: Accepted
- Date: 2026-10-06
- Supersedes: [0007](0007-visuals-standalone-app.md)

## Context

ADR-0007 left `visuals/` with no checks at all. It has its own lockfile (three-vrm, lil-gui,
vite) that nothing audited, so a vulnerable package could land unseen. Secrets were already
covered: secretlint and gitleaks scan the whole repo.

## Decision

`visuals/` stays a standalone, undeployed prototype with its own toolchain, outside the app's
lint, knip, coverage and layer rules. CI adds one small job: `npm ci`, `npm run typecheck`,
`npm audit --omit=dev --audit-level=high`. Dependabot watches `/visuals`.

## Consequences

- Vulnerable or type-broken prototype code fails CI (~30 s job, parallel to the app).
- Shipping it would still need lint/tests and a new ADR.
- It must never embed model API keys: it builds to a static, public bundle.
