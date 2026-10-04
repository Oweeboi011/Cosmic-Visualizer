# Development

## Setup

```bash
npm install                  # also installs the git hooks (husky, via `prepare`)
cp .env.example .env.local   # set NASA_API_KEY (free at https://api.nasa.gov/)
npm run dev                  # http://localhost:3000
```

Without `NASA_API_KEY` the app falls back to `DEMO_KEY` (30 requests/hour, 50/day).

> Next.js 16 differs from older versions. Read the relevant guide in
> `node_modules/next/dist/docs/` before using a Next API (see `AGENTS.md`).

## Commands

| Command                      | What it does                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| `npm run verify`             | **The gate.** Everything CI runs except build, perf and e2e. Run before pushing.     |
| `npm test`                   | Unit, component and integration tests (~2 s)                                         |
| `npm run test:perf`          | Generator timing budgets                                                             |
| `npm run test:e2e`           | Playwright; builds and starts the app (first run: `npx playwright install chromium`) |
| `npm run lint` / `typecheck` | ESLint (incl. complexity, dead logic, banned APIs) / `tsc`                           |
| `npm run check:arch`         | Layer rules, cycles, orphans (dependency-cruiser)                                    |
| `npm run check:dup`          | Copy-paste detection (jscpd)                                                         |
| `npm run check:dead`         | Unused files, exports, dependencies (knip)                                           |
| `npm run check:secrets`      | Secret scan of the working tree (secretlint)                                         |
| `npm run audit:prod`         | `npm audit` of production dependencies                                               |
| `npm run format -- <files>`  | Prettier                                                                             |

What each check enforces and why: [quality harness](../solution-plan/quality-harness.md).

## Git hooks

`pre-commit` runs on staged files only: secret scan, ESLint `--fix`, Prettier, then the
architecture check. It takes a few seconds. Bypassing it with `--no-verify` doesn't skip
anything that matters: CI runs the same checks and more.

## Writing code

- Put new UI primitives in `src/components/ui` before copying markup a second time. Existing
  ones: `Modal`, `ToggleGroup`, `RemoteImage`, `ExternalLink`, `Card`, `Grid`, `Badge`,
  `EmptyState`, `ErrorState`, `LoadingSkeleton`, `Pagination`, `SearchInput`, `FormattedDate`,
  and the `useSearchParam` hook for URL-driven filters.
- New data source: add `src/lib/nasa/<source>.ts` that uses `fetchJson`/`fetchText`/`fetchNasaApi`
  from `client.ts`, bounds its inputs, and normalizes into a type in `src/types/nasa.ts`.
- New 3D scene: generator in `src/lib/space3d` or `galaxy3d` (pure, seeded, unit-tested),
  rendering inside `SceneCanvas`, loaded through a `dynamic(..., { ssr: false })` loader.
- A decision that changes a layer, a dependency or a rule above gets an ADR (`docs/adr/`).

## Troubleshooting

- **Images from www.esa.int or science.nasa.gov return 400 locally.** On NAT64 networks
  (`64:ff9b::/96`) Next's image optimizer sees the resolved address as private. Public
  deployments aren't affected. Don't set `dangerouslyAllowLocalIP`.
- **`check:dead` or `next build` fails with "An Application Control policy has blocked this
  file".** Windows Application Control / Smart App Control can hold back freshly installed
  native `.node` binaries (knip's oxc-parser, Next's SWC) until it has checked them. Seen
  right after `npm install`; it cleared on its own minutes later. If it persists, ask IT to
  allow `node_modules/**/*.node`. CI is unaffected.
- **`typecheck` fails on a fresh clone.** It runs `next typegen` first. If you call `tsc`
  directly, run `npx next typegen` once.
