# Cosmic Visualizer: agent instructions

A read-only Next.js 16 + React 19 + TypeScript app that visualizes NASA/ESA/ESO data, with
client-only three.js scenes. No backend service, database or auth.

> This Next.js version has breaking changes. Read the relevant guide in
> `node_modules/next/dist/docs/` before using a Next.js API (see `AGENTS.md`).

Read first: [architecture](../docs/guides/architecture.md) (layers and where things live),
[development](../docs/guides/development.md) (commands and the `ui/` catalogue),
[quality harness](../docs/solution-plan/quality-harness.md) (what CI enforces).

## Rules

- `NASA_API_KEY` is server-only. Only `src/lib/nasa/client.ts` reads it. Never import
  `src/lib/nasa/*` from a Client Component, and never add a `NEXT_PUBLIC_` key.
- Don't add API routes that proxy the NASA key. Add a route only when a Client Component
  needs data, and give it `Cache-Control`.
- Validate and bound every upstream input (`clampDateRange`, `parseIntParam`, allowlists).
  Only allowlisted values may reach an ADQL string.
- Treat feed content as untrusted: only `http(s)` URLs may become `href`/`src`.
- Upstream failures throw `NasaApiError`; 404 and 429 keep their status, everything else is 502.
- Respect the layers (`npm run check:arch`). Generators in `src/lib/{galaxy3d,space3d}` stay pure and seeded.
- Reuse `src/components/ui` (`Modal`, `ToggleGroup`, `RemoteImage`, `ExternalLink`,
  `useSearchParam`, …) before writing markup a second time.
- Accessibility: every control has an accessible name, toggles use `aria-pressed`, and
  dialogs use `ui/Modal`.
- Before finishing: `npm run verify` passes. Record architectural decisions in `docs/adr/`.
