# 0002. One-way layers, enforced by tooling

- Status: Accepted
- Date: 2026-10-05

## Context

The app mixes server data access, pure math (procedural generation) and two kinds of UI:
server-rendered pages and client-only WebGL. Without rules, UI reaches into data access,
generators pick up React or three.js, and copy-pasted markup drifts.

## Decision

Clean Architecture, sized for one Next.js app:
`types` ← `lib` ← `components/ui` ← `components/<feature>` ← `app`. `lib/galaxy3d` and
`lib/space3d` stay free of React, three.js, Next and I/O. The diagram and per-layer rules
are in the [architecture guide](../guides/architecture.md#layers).

SOLID as applied here:

- **Single responsibility.** One module per upstream source, and one shared fetch path (`client.ts`).
- **Open/closed.** A new galaxy morphology or ring kind is a new sampler entry, not another branch.
- **Liskov and interface segregation.** UI primitives take narrow props and pass through
  native element attributes (`Card`, `Grid`, `ExternalLink`, `RemoteImage`).
- **Dependency inversion.** Generators return typed arrays; the rendering layer decides how to draw them.

## Consequences

- `npm run check:arch` (dependency-cruiser) fails on a reversed dependency, a cycle or an orphan module.
- Complexity and duplication limits ([ADR-0005](0005-minimum-viable-harness.md)) force large components to split.
- Async Server Components in `components/` may call `lib/nasa`; the ESLint config lists them by name.
