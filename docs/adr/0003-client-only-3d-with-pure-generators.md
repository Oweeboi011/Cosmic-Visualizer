# 0003. Client-only 3D over pure, seeded generators

- Status: Accepted
- Date: 2026-09-28

## Context

three.js is large and can't render on the server. Procedural planets and galaxies take
tens to hundreds of milliseconds to generate, and visual code is hard to test.

## Decision

- Scenes render inside `SceneCanvas` (WebGL fallback and full-window mode) and load through
  `dynamic(..., { ssr: false })` loaders.
- Geometry and textures come from pure, seeded functions in `src/lib/galaxy3d` and
  `src/lib/space3d`, unit-tested without WebGL. The same seed always gives the same output.
- Large textures are generated in a Web Worker (`texture.worker.ts`), with an inline fallback.
- Scenes respect `prefers-reduced-motion`, and the site Starfield pauses during full window.

## Consequences

- three.js stays out of the initial bundle, and pages render before 3D loads.
- `tests/performance` budgets guard generator speed.
- WebGL components are covered by e2e tests rather than unit coverage.
