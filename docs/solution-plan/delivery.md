# Delivery

## Path to production

```mermaid
flowchart LR
  dev[Commit] -->|pre-commit hook<br/>secrets · lint · format · arch| push[Push / PR]
  push --> gh[GitHub Actions CI<br/>verify · perf · build · e2e]
  gh --> sec[Security workflow<br/>audit · gitleaks · CodeQL · Semgrep]
  gh -->|merge to main| deploy["Vercel (auto: main → prod, PR → preview)"]
  ado["Azure DevOps pipeline<br/>.azuredevops/pipelines/ci-cd.yml"] -. staged, disabled .-> deploy
```

| Stage      | Where                                                                                                                 | Blocking                                      |
| ---------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Pre-commit | Developer machine (`.husky/pre-commit`)                                                                               | yes, locally                                  |
| CI         | `.github/workflows/ci.yml` on every PR and push to `main`                                                             | yes (make it a required check)                |
| Security   | `.github/workflows/security.yml` on PRs, `main`, weekly                                                               | audit, gitleaks, CodeQL yes; Semgrep advisory |
| AI review  | `.github/workflows/agent-review.yml` on PRs                                                                           | advisory comment                              |
| Deploy     | Vercel, Git-connected ([ADR-0010](../adr/0010-host-on-vercel.md))                                                     | merge only green `main`                       |
| Pages      | `.github/workflows/pages.yml`: `visuals/` prototype only ([ADR-0009](../adr/0009-publish-visuals-to-github-pages.md)) | —                                             |
| ADO CI/CD  | `.azuredevops/pipelines/ci-cd.yml`                                                                                    | **not enabled** (`trigger: none`)             |

GitHub CI and the ADO pipeline call the same npm scripts, so there's one definition of "green".
See [ADR-0006](../adr/0006-ci-cd-github-now-ado-staged.md).

## Deploying

Vercel project `cosmic-visualizer` deploys `main` to production and each PR to a preview URL.
`NASA_API_KEY` is a sensitive env var (production + preview); manage it with `npx vercel env`.
Rollback: promote an earlier deployment in the Vercel dashboard (`npx vercel rollback`).

## Enabling the ADO pipeline

1. In Azure DevOps, create a pipeline from `.azuredevops/pipelines/ci-cd.yml`.
2. Create an Azure Resource Manager service connection (workload identity federation).
3. Create a variable group `cosmic-visualizer` with `AZURE_SERVICE_CONNECTION`,
   `AZURE_ENV_NAME`, `AZURE_LOCATION`, `AZURE_SUBSCRIPTION_ID` and `NASA_API_KEY` (secret).
4. Add approvals to the `cosmic-visualizer-prod` environment.
5. Replace `trigger: none` / `pr: none` with branch triggers. If ADO becomes the required
   gate, disable `ci.yml` on GitHub so the two don't drift.

## Open decisions

| Decision                                                 | Blocks         | Owner      |
| -------------------------------------------------------- | -------------- | ---------- |
| Whether ADO replaces GitHub Actions or runs alongside it | turning ADO on | maintainer |

Next 16 needs a Node server here: every page renders dynamically because of the CSP nonce
([ADR-0004](../adr/0004-nonce-csp-via-proxy.md)). A static-only host won't work.
