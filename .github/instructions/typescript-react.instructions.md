---
applyTo: "**/*.ts,**/*.tsx"
---

# Project coding standards for TypeScript and React

Apply the [general coding guidelines](./general-coding.instructions.md) to all code.

## TypeScript Guidelines

- Use TypeScript for all new code
- Follow functional programming principles where possible
- Use interfaces for data structures and type definitions
- Prefer immutable data (const, readonly)
- Use optional chaining (?.) and nullish coalescing (??) operators

## React Guidelines

- Use functional components with hooks
- Follow the React hooks rules (no conditional hooks)
- Type props inline or with an interface; don't use `React.FC`
- Keep components small and focused
- Style with Tailwind utility classes and the theme tokens in `src/app/globals.css`
- Develop reusable components when possible

## Test-Coverage Guidelines

### Tools

- Use **Vitest** for unit tests
- Use **@testing-library/react** for component tests
- Use **Playwright** for browser end-to-end tests

### Coverage Policy

| Metric     | Threshold (enforced in CI)                |
| ---------- | ----------------------------------------- |
| Statements | 85 %                                       |
| Branches   | 50 %                                       |
| Functions  | 85 %                                       |
| Lines      | 85 %                                       |

- Enforced by `npm run test:coverage` via `vitest.config.mts`; CI fails when thresholds are unmet
- Reject merges that reduce overall coverage

### Test-Writing Rules

- Unit tests: place in `tests/unit/` (mirroring `src/`) and end with `.test.ts`; component tests end with `.test.tsx` and start with a `// @vitest-environment jsdom` docblock
- Playwright specs: place in `tests/e2e/` and end with `.spec.ts`
- Prefer behavioural assertions; avoid snapshots unless output is static
- Mock external services and side-effects, not the unit under test
- Mock HTTP in unit tests by stubbing `fetch` (`vi.stubGlobal`), as the existing tests do
- Do not commit `.only`, `.skip`, or focussed tests
- Keep tests deterministic; avoid real time, randomness, and live network calls

### Reporting

- Generate coverage in both `lcov` and `html` formats
- Upload the `lcov` report to the coverage service
- Exclude `coverage/` artefacts via `.gitignore`

## Linting and Formatting

- Use ESLint (`npm run lint`) and TypeScript (`npm run typecheck`)
- Ensure all linting and formatting rules pass before submitting code
