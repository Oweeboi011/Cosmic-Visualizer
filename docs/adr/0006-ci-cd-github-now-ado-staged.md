# 0006. GitHub Actions now; Azure DevOps staged; azd deploy in the interim

- Status: Accepted
- Date: 2026-10-05

## Context

The code is on GitHub, and CI already runs there. The team will standardize on Azure
DevOps; until that pipeline is turned on, deploys use `azd deploy`.

## Decision

- GitHub Actions (`ci.yml`, `security.yml`) stays the active gate.
- `.azuredevops/pipelines/ci-cd.yml` mirrors it (verify, perf, audit, build, e2e) and adds
  an `azd deploy` stage for `main`. It ships with `trigger: none` and `pr: none`.
- Both run the same npm scripts, so the definition of "green" lives in `package.json`.

## Consequences

- Turning ADO on is configuration, not code ([delivery](../solution-plan/delivery.md#enabling-the-ado-pipeline)).
- Until then deploys are manual, and a maintainer deploys only green `main` commits.
- `azure.yaml` and the infrastructure don't exist yet, so neither manual nor pipeline
  deploys can run until the hosting target is chosen.
