# GitHub Copilot Instructions — Cosmic Visualizer

## Project overview

A read-only dashboard that visualizes space and astronomy data from NASA, ESA, and ESO,
with interactive 3D views of the Solar System, planets, star classes, and galaxy types.
There is no backend service, database, or auth — everything runs in one Next.js app.

**Stack**

- Next.js 16 App Router (Turbopack), React 19, TypeScript, Tailwind CSS v4
- 3D: three.js + @react-three/fiber + @react-three/drei (client-only, code-split with `ssr: false`)
- Data: api.nasa.gov (APOD, DONKI, NeoWs), NASA Image and Video Library, NASA Exoplanet
  Archive (TAP/ADQL), NASA/ESA/ESO RSS feeds
- Tests: Vitest (unit), Playwright (e2e)

> This Next.js version has breaking changes from older releases. Read the relevant guide
> in `node_modules/next/dist/docs/` before using a Next.js API (see `AGENTS.md`).

## Layout

| Path | Purpose |
| --- | --- |
| `src/app/` | Routes. Pages are Server Components that call `src/lib/nasa/*` directly. |
| `src/app/api/gallery/` | The only API route — used by the client-side galaxy star modal. |
| `src/lib/nasa/` | One module per upstream source: fetch, validate/clamp inputs, normalize to `src/types/nasa.ts`. |
| `src/lib/galaxy3d/`, `src/lib/space3d/` | Framework-free procedural generation (galaxies, planet textures, noise, stellar data). Unit-tested. |
| `src/components/space3d/` | Shared 3D building blocks: `SceneCanvas` (WebGL fallback + full-window mode), `PlanetBody`, textures, hooks, lazy loaders. |
| `src/components/` | Feature components (galaxy3d, planets, stars, gallery, alerts, findings, research, glossary) and `ui/` primitives. |
| `src/data/` | Static JSON (glossary, solar system facts, findings fallback). |
| `tests/unit/`, `tests/e2e/` | Vitest and Playwright suites. |

## Rules

- **`NASA_API_KEY` is server-only.** Only `src/lib/nasa/client.ts` reads it. Never import
  `src/lib/nasa/*` from a Client Component and never add a `NEXT_PUBLIC_` NASA key.
- **Don't add public API routes that proxy the NASA key.** Pages fetch on the server; add a
  route only when a Client Component genuinely needs it, and give it `Cache-Control`.
- **Validate and bound every upstream input** (dates via `clampDateRange`, numbers via
  `parseIntParam`, enums via allowlists). The Exoplanet Archive has no parameterized
  queries — only allowlisted values may reach an ADQL string.
- **Treat feed content as untrusted.** Only `http(s)` URLs may become `href`/`src`.
- Upstream failures throw `NasaApiError`; 404 and 429 keep their status, everything else is 502.
- 3D scenes: render inside `SceneCanvas`, load through a `dynamic(..., { ssr: false })`
  loader, respect `usePrefersReducedMotion`, and keep generators pure and seeded in `src/lib`.
- Accessibility: every control has an accessible name; toggles use `aria-pressed`; the
  active nav item uses `aria-current="page"`; modals use `ui/Modal` (focus is managed).

## Commands

```bash
npm run dev        # local dev server
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm test           # Vitest
npm run build      # production build
npm run test:e2e   # Playwright (starts the server itself)
```
