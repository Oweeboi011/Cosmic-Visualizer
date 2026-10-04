# Architecture Decision Records

Why the system is built the way it is. One decision per file, numbered. After acceptance
only the **Status** line changes; to change a decision, add an ADR that supersedes it.

| #                                                   | Decision                                                      | Status   |
| --------------------------------------------------- | ------------------------------------------------------------- | -------- |
| [0001](0001-server-only-nasa-key.md)                | Keep the NASA API key on the server; no proxy routes          | Accepted |
| [0002](0002-layered-architecture.md)                | One-way layers, enforced by tooling                           | Accepted |
| [0003](0003-client-only-3d-with-pure-generators.md) | Client-only 3D over pure, seeded generators                   | Accepted |
| [0004](0004-nonce-csp-via-proxy.md)                 | Nonce-based CSP set in `proxy.ts`                             | Accepted |
| [0005](0005-minimum-viable-harness.md)              | A minimum viable quality harness                              | Accepted |
| [0006](0006-ci-cd-github-now-ado-staged.md)         | GitHub Actions now; Azure DevOps staged; `azd deploy` interim | Accepted |
| [0007](0007-visuals-standalone-app.md)              | `visuals/` is a standalone prototype                          | Accepted |

## Format

```markdown
# NNNN. Title in the imperative

- Status: Proposed | Accepted | Superseded by [NNNN](NNNN-title.md)
- Date: YYYY-MM-DD

## Context

The forces at play, with facts from the codebase.

## Decision

What we do, in a few sentences.

## Consequences

What gets easier, what gets harder, and what enforces it.
```
