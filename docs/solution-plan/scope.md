# Scope

**Goal.** A public, read-only dashboard where anyone can explore real astronomy data
(imagery, space weather, exoplanets, news) and interactive 3D models, with no account.

## What it must do

| Route                                         | Capability                                                                                                     | Source                         | Freshness    |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------------ |
| `/`                                           | Overview: APOD hero plus the latest alert, finding and galaxy images                                           | all                            | per source   |
| `/galaxy-3d`                                  | Procedural spiral, barred-spiral, elliptical, irregular galaxies; markers open real NASA images; reseeds daily | Image Library                  | 24 h         |
| `/galaxies`, `/stars`, `/planets?tab=gallery` | Searchable, paginated imagery; detail pages with metadata and a real 404                                       | Image Library                  | 24 h         |
| `/planets`                                    | 3D Solar System at today's planet positions, per-planet 3D model with real axial tilt, exoplanet catalog       | static JSON, Exoplanet Archive | 24 h         |
| `/stars`                                      | 3D model of each spectral class (O–M)                                                                          | static                         | —            |
| `/findings`                                   | News from NASA, ESA and ESO, filterable by agency; static fallback if NASA's feed fails                        | RSS                            | 6 h          |
| `/alerts`                                     | Space-weather notifications by type, plus near-Earth close approaches                                          | DONKI, NeoWs                   | 15 min / 1 h |
| `/research`                                   | Confirmed exoplanets, filterable by discovery method                                                           | Exoplanet Archive              | 24 h         |
| `/glossary`                                   | Searchable terms with a beginner explanation, history and fun facts                                            | static JSON                    | —            |
| `/explorations`                               | APOD archive browser (max 30-day range)                                                                        | APOD                           | 6 h          |

## Quality bar

- **Resilience.** One failing upstream degrades only its own section.
- **Security.** No secrets in the browser, a strict nonce CSP, untrusted feed URLs filtered to `http(s)`, every upstream input bounded.
- **Accessibility.** Every control has a name; toggles use `aria-pressed`; modals trap focus; every 3D view has a text label and a WebGL fallback; reduced motion is respected.
- **Performance.** 3D code is code-split and client-only; heavy textures generate off the main thread; generator budgets are enforced ([quality harness](quality-harness.md)).

## Out of scope

- User accounts, saved state, or any write path.
- Agencies without a public feed (JAXA, NAOJ, STScI, MPIA have HTML-only news). They're excluded deliberately rather than scraped.
- `visuals/` (Vite prototype with a VRM avatar chat) is not shipped with the app ([ADR-0008](../adr/0008-gate-visuals-typecheck-and-audit.md)).

## Backlog

| Item                                                                         | Why it's open                                                              |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `azure.yaml` + infrastructure for `azd`                                      | Hosting target not chosen yet ([delivery](delivery.md#open-decisions))     |
| Lighthouse / Web Vitals budget in CI                                         | Generator budgets cover CPU; page-level budgets need a stable deployed URL |
| Image Library titles aren't HTML-stripped (descriptions and feed titles are) | Rendered as text, so it's safe; cosmetic only                              |
