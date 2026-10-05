---
applyTo: "**/*.ts,**/*.tsx"
---

# TypeScript and React conventions

Project rules are in [copilot-instructions.md](../copilot-instructions.md). Lint, complexity,
layering, duplication and dead-code limits are enforced by `npm run verify`; see
[quality harness](../../docs/solution-plan/quality-harness.md).

## Naming

- `PascalCase`: components, interfaces, type aliases, and component file names (`GalleryGrid.tsx`).
- `camelCase`: variables, functions, hooks (`useSearchParam`), and non-component modules (`planetTextures.ts`).
- `SCREAMING_SNAKE_CASE`: module-level constants (`MAX_RANGE_DAYS`).
- Raw upstream shapes are prefixed `Raw` (`RawApod`) and never leave `src/lib/nasa`.
- Test files mirror the source name: `*.test.ts(x)`, `*.spec.ts` (e2e), `*.perf.ts`.

## Code

- Functional components with hooks; type props inline or with an interface; no `React.FC`.
- Prefer `const`, `readonly`, `?.` and `??`. No `any`; narrow `unknown` instead.
- Style with Tailwind and the theme tokens in `src/app/globals.css`.

## Tests

Put a test in the layer it exercises; rules: [test strategy](../../docs/solution-plan/quality-harness.md#test-strategy).
Stub the network (`vi.stubGlobal("fetch", ...)`), not the unit under test. Query by role and accessible name.
