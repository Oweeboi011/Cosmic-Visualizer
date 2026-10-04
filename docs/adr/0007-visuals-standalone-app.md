# 0007. visuals/ is a standalone prototype

- Status: Accepted
- Date: 2026-10-05

## Context

`visuals/` is a Vite + Three.js scene with a VRM avatar chat scaffold. It has its own
`package.json` and a different TypeScript major, and it shares no code with the Next app.

## Decision

Keep it as an independent project. It's excluded from the app's lint, typecheck, knip and
coverage, and it isn't deployed. Its README explains how to run it.

## Consequences

- The app's harness doesn't cover it. Shipping it would need its own CI job (at least
  `npm ci`, `npm run build` and `npm audit`) and a new ADR.
- It must never embed model API keys, because it builds to a static, public bundle.
