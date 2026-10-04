# 0005. A minimum viable quality harness

- Status: Accepted
- Date: 2026-10-05

## Context

The high-priority checks are secrets, bad patterns, dead code, dead logic, missing reuse,
circular dependencies, forbidden imports, complexity, duplication, vulnerable packages and
layering. The low-priority ones are lint, types, formatting and naming. Each could become
its own step, but long checklists get skipped and slow hooks get disabled.

## Decision

- **Three tiers.** A pre-commit hook on staged files (seconds); `npm run verify`, the single
  gate, identical locally and in CI; and CI-only checks that are slow or need the network
  (perf, build, e2e, audit, history secret scan, CodeQL).
- **One tool per concern, all installed from npm.** ESLint + sonarjs (patterns, dead logic,
  complexity, banned APIs), dependency-cruiser (cycles, layers, orphans), knip (dead code),
  jscpd (duplication), secretlint + gitleaks (secrets), `npm audit` + Dependabot (packages).
- **Zero baseline.** Every check landed with no findings: existing violations were fixed,
  not suppressed.
- **Formatting is low priority.** Prettier runs on touched files only; there's no repo-wide format gate.

## Consequences

- A contributor runs two commands: `git commit` and `npm run verify`.
- A new check must catch a defect class nothing else catches, run fast and start at zero findings.
- knip and Next use native binaries; Windows Application Control can briefly block fresh
  installs ([troubleshooting](../guides/development.md#troubleshooting)).
- The full check table is in the [quality harness](../solution-plan/quality-harness.md).
