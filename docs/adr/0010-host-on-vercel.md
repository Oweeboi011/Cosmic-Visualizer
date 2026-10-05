# 0010. Host the app on Vercel

- Status: Accepted
- Date: 2026-10-06
- Supersedes: the `azd deploy` interim in [0006](0006-ci-cd-github-now-ado-staged.md)

## Context

The app needs a Node host: per-request nonce CSP ([0004](0004-nonce-csp-via-proxy.md)),
server-only `NASA_API_KEY` ([0001](0001-server-only-nasa-key.md)), `/api/gallery`, image
optimization. `azd` had no `azure.yaml` or infrastructure, so nothing could deploy. GitHub
Pages is static only ([0009](0009-publish-visuals-to-github-pages.md)).

## Decision

Vercel project `cosmic-visualizer` (team `oweeboi011s-projects`), Git-connected to this repo:
`main` deploys to production, every PR gets a preview. `NASA_API_KEY` is a sensitive env
var for production and preview. GitHub Actions stays the quality gate; the ADO pipeline
stays staged and disabled.

## Consequences

- No infrastructure code; deploys need no manual step after merge.
- Merge to `main` only when CI is green: Vercel deploys whatever lands there.
- Moving to Azure later needs a new ADR plus `azure.yaml`/infra.
