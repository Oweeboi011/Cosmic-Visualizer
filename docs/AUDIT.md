# Cosmic Visualizer — Audit (2026-09-28)

Scope: all application code (`src/`), tests, build/tooling config, dependencies, and
`.github/` automation. Method: full read-through, then `lint`, `typecheck`, unit tests,
production build, Playwright e2e, `npm audit`, GitHub Actions run history, and targeted
browser checks of each fix.

**Severity**: **P0** broken or exploitable now · **P1** real defect or gap users/maintainers
will hit · **P2** improvement / backlog.

## Summary

| | Found | Fixed | Backlog |
| --- | --- | --- | --- |
| P0 | 5 | 5 | 0 |
| P1 | 13 | 13 | 0 |
| P2 | 17 | 17 | 0 |

Baseline before fixes: lint, typecheck, 51 unit tests, build, and 19 e2e tests all passed
locally; `npm audit --omit=dev` reported 0 vulnerabilities. The defects below are ones those
checks did not catch. After fixes: 58 unit tests and 19 e2e tests pass.

## P0 — fixed

### 1. CI/CD never ran against this repository
`.github/` was copied from another project (Fit-Ready-IQ: Next 14 + Firebase + Strava +
FastAPI). Every workflow targeted `src/frontend` / `src/backend` (which don't exist) and
called scripts this `package.json` doesn't define (`type-check`, `lint:deps`, `lint:dup`,
`test:unit`, Stryker). GitHub history showed only failures: the `uptime` job failed every
15 minutes pinging a nonexistent `/api/health`, and Dependabot failed on both ecosystems.
The AI-review prompt, CODEOWNERS, Copilot/agent instructions and PR template also described
the other app.

**Fix**
- New `ci.yml`: lint → typecheck → unit tests → build, then Playwright e2e.
- `security.yml` reduced to what applies here: npm audit, gitleaks, Semgrep (advisory),
  and CodeQL for JS/TS only.
- Dependabot now points at `/` and groups the three.js packages together.
- CODEOWNERS, the AI-review prompt, the Copilot and coding instructions, and the PR template
  now describe this app.
- Removed the Stryker, uptime and duplicate e2e workflows, the Python instructions, and
  the Fit-Ready-IQ agent.

### 2. Public API routes proxied the server NASA key
Six of the seven `/api/*` routes were never called by the app; pages call `src/lib/nasa`
directly. They were public, unauthenticated and not rate-limited. `/api/apod`,
`/api/alerts` and `/api/neows` forward to api.nasa.gov with `NASA_API_KEY`, so anyone
could exhaust the key's quota, e.g. by iterating `/api/apod?date=` over ~11k dates.

**Fix**
- Deleted the `apod`, `alerts`, `neows`, `exoplanets`, `findings` and `gallery/[nasaId]`
  routes.
- Kept `/api/gallery`, which `StarInfoModal` uses and which is keyless, and gave it
  `Cache-Control: public, s-maxage=86400`.

### 3. Unbounded APOD date range (`src/lib/nasa/apod.ts`)
`/explorations?start_date=1995-06-16` with no end date asked APOD for everything up to today:
~11,000 entries, all rendered as full-resolution images. `start_date > end_date` produced an
upstream 400.

**Fix**
- Ranges now go through `clampDateRange` (max 30 days, reordered if reversed).
- A start-only range is anchored at the start date.
- Verified: that URL now returns 28 entries covering 1995-06-16 → 1995-07-16.
- 3 unit tests added.

### 4. Gallery detail pages could never show "not found" (`src/lib/nasa/client.ts`)
`fetchJson`/`fetchText` rewrote every non-429 upstream status to 502, so the
`status === 404` → `notFound()` branch in `GalleryDetailView` was dead code. Unknown IDs hit
the error boundary.

**Fix**
- Added `upstreamError()`, which preserves 404 (`UPSTREAM_NOT_FOUND`) and 429.
- Unit test added; verified in the browser.

## P1 — fixed

| # | Finding | Fix |
| --- | --- | --- |
| 5 | **Findings feed fragility** (`src/lib/nasa/findings.ts`). One item with an unparseable `pubDate` threw `RangeError` and discarded that agency's entire feed. | Invalid dates fall back to now. |
| 6 | **Untrusted feed URLs** (same file). Third-party RSS `link`/`<img src>` values were rendered as `href`/`src` with no protocol check. | Only `http(s)` is accepted: bad links drop the item, bad images drop the image. 2 unit tests. |
| 7 | **Gallery crash on malformed item** (`src/lib/nasa/gallery.ts`). `item.data[0]` threw when `data` was missing. | `item.data?.[0]`. Unit test. |
| 8 | **Glossary embedded the full galaxy page for every term.** A 75vh canvas, type picker and featured list appeared even for "Light-Year" and "Parsec". | `GalaxyScene` gained a `compact` mode, shown only for Galaxy and Milky Way. |
| 9 | **Modal accessibility and nesting.** Focus never moved into the dialog or back, and Tab escaped behind it. Escape was a document listener, so nested modals (star info inside glossary) closed together. | Focus moves in on open and returns on close. Tab stays inside. Escape is handled on the dialog, so only the top one closes. `aria-labelledby` added. |
| 10 | **Unlabelled controls.** The search inputs had only a placeholder, and the discovery-method `<select>` had no label. | `aria-label` on both; the inputs are now `type="search"`. |
| 11 | **Toggle state invisible to assistive tech.** Alert-type and news-source filters had no pressed state. The active nav link and planet tab weren't marked. | `role="group"`, `aria-pressed`, and `aria-current="page"`. |
| 12 | **Every tab titled "Cosmic Visualizer."** Only the root layout set metadata. | Title template plus per-page titles, e.g. "Cosmic Alerts \| Cosmic Visualizer". |
| 13 | **Home page misreported outages.** A failed DONKI or findings fetch showed "No active alerts right now." | A distinct "Couldn't load…" message on failure. |
| 14 | **No security headers.** | `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`, and `Permissions-Policy`, with fullscreen kept for the 3D full-window mode. |
| 15 | **Type/runtime mismatch.** `three@0.176` was typed by `@types/three@0.185`, so the types described APIs the runtime lacks. | Pinned `@types/three@^0.176.0`. |
| 16 | **Local e2e flakiness.** Default parallelism timed out against live NASA APIs and software WebGL. | `workers: CI ? 1 : 2`. |
| 17 | **Onboarding and docs drift.** The README said `cp .env.example`, but the file didn't exist and `.gitignore` excluded it. The 3D docs were stale, and `typecheck` failed on a fresh clone because it needs generated route types. | Added `.env.example` with a gitignore exception. `typecheck` now runs `next typegen && tsc --noEmit`. README updated. |

## Earlier in this session (3D work)

- **Full-window mode for every 3D scene.**
  - Pins the scene to the viewport, and goes true fullscreen where supported.
  - Esc and nested modals are handled.
  - Controls are overlaid so they work in full window.
- **The galaxy camera fits the whole galaxy** on any aspect ratio, including portrait phones, and there's a Reset view button.
- **Accessibility:** `SceneCanvas` put `role="img"` on the element that wrapped interactive overlays. It now sits only on the canvas.
- **Tests:** the e2e canvas locator was ambiguous with the site-wide Starfield canvas.

## Follow-up (2026-10-01)

### P0 — DONKI moved; Alerts were broken
CCMC moved DONKI off `kauai.ccmc.gsfc.nasa.gov` on 2026-09-30. `api.nasa.gov/DONKI/*` still
proxies the old host and now returns a 301 to an HTML notice, so `/alerts` and the home
"Latest cosmic alert" card showed only errors.

**Fix**
- `getAlerts` calls the new keyless API, `https://ccmc.gsfc.nasa.gov/DONKI-API/get/notifications`.
  The parameters and schema are unchanged.
- The new API currently returns every `messageBody` as `"## "`. Titles now fall back to a
  readable type name, e.g. "Coronal mass ejection", instead of "CME notification".

### P2 backlog — all fixed

| # | Item | Fix |
| --- | --- | --- |
| 1 | Unoptimized images | `images.remotePatterns` for `**.nasa.gov`, `www.esa.int`, `**.eso.org` (`src/lib/images.ts`, shared with `next.config.ts`). Every `next/image` optimizes those hosts; feed images from other hosts stay unoptimized. Asset URLs are upgraded from `http://` to `https://`. |
| 2 | Planet textures on the main thread | Planet, cloud and Sun textures are generated in a Web Worker (`texture.worker.ts`, `useProceduralTexture`). A plain placeholder material shows until a texture arrives. |
| 3 | Starfield cost | Pauses while a 3D scene is in full window (`backgroundMotion.ts`). Uses devicePixelRatio, capped at 2. A resize now rescales the existing stars instead of regenerating them. |
| 4 | No CSP | Nonce-based CSP in `src/proxy.ts` (`src/lib/csp.ts`). Scripts need the nonce plus `'strict-dynamic'`. `style-src` keeps `'unsafe-inline'` because React `style` attributes can't carry a nonce. The root layout calls `connection()`, so every page renders dynamically. Upstream data is still cached by `fetch` revalidation. |
| 5 | No gallery pagination | Previous/next links with "Page N of M", preserving `q`/`tab`. The page is capped at the API's 100-page limit. |
| 6 | Detail pages had no metadata | `getGalleryItem` searches by `nasa_id`. The page shows the title, date, center, description and keywords, and the tab uses the image title (`generateMetadata`). |
| 7 | Not-found returned 200 | The list pages' `loading.tsx` (and the home page's) moved into route groups (`(home)`, `galaxies/(list)`, …). Detail pages are no longer under a Suspense boundary, so `notFound()` returns a real 404. Trade-off: detail pages have no loading skeleton. |
| 8 | Server-timezone dates | `formatUtcDate` / `<FormattedDate>`: a fixed `en-US` locale, UTC, a `<time dateTime>` element, and a "UTC" label on timestamps. |
| 9 | No mobile nav | Below `lg`, the links sit behind a menu button (`aria-expanded`). The menu closes on navigation, on link click, and on Escape, and Escape returns focus to the button. |
| 10 | DONKI severity substring match | Whole-token regexes. NOAA scale levels follow NOAA's wording: 1–2 watch, 3 warning, 4–5 severe. R3 was previously severe. X/M flare classes also match, and words match case-insensitively. |
| 11 | Partial entity decoding | `decodeHtmlEntities` (`src/lib/text.ts`) handles common named entities and any decimal or hex reference in a single pass. Gallery descriptions are stripped the same way. |
| 12 | Duplicate constants | `FINDING_AGENCIES` lives in `types/nasa.ts`. Badge tones include `AlertSeverity`, so the identity maps are gone. |
| 13 | Unused `ApiErrorBody` | Removed. |
| 14 | Coverage | Coverage now includes `src/lib/**` and the jsdom-testable components. Thresholds are 85/50/85/85 (currently ~91/80/89/92). `npm run test:coverage` runs in CI. Tests were added for utils, text, images, CSP, DONKI, gallery, textures, and components (Testing Library). |
| 15 | Vitest CJS warning | Renamed to `vitest.config.mts`. |
| 16 | Outdated minors | three 0.186 with `@types/three` 0.186, `@react-three/fiber` 9.8, drei 10.7.9, and lucide-react 1.49. |
| 17 | Starter assets | `public/*.svg` removed. |

**Known local-only behaviour**: on networks using NAT64 (addresses under `64:ff9b::/96`),
Next's image optimizer classifies the resolved address as private. It then refuses
`www.esa.int` and `science.nasa.gov` images with a 400. Public deployments resolve these
hosts to ordinary public IPs. Don't set `dangerouslyAllowLocalIP` to work around this.

## How this was verified (2026-09-28)

- `npm run lint`, `npm run typecheck` (also from a clean state without `.next/`),
  `npm test` (58 passing), and `npm run build` (only `/api/gallery` remains).
- `npx playwright test`: 19/19 passing, plus one-off browser checks for the fixes:
  - bounded APOD range
  - not-found for unknown asset IDs
  - glossary scene scoping, Escape and focus return
  - page titles
  - security headers
  - removed routes returning 404
  - gallery `Cache-Control`
- Workflow files parse as YAML; `grep` finds no remaining `src/frontend`, `poetry`,
  `firebase` or `strava` references in `.github/`. The new CI has not yet run on GitHub
  (it runs on the next push/PR).

Follow-up (2026-10-01):
- `npm run lint`, `npm run typecheck`, and `npm run test:coverage`: 121 tests, thresholds met.
- `npm run build`: every route is dynamic.
- `npx playwright test`: 23/23. New tests cover the CSP nonce, the real 404, pagination,
  and the phone menu.
- Browser checks against `next start`:
  - no CSP violations on any page
  - the texture worker starts
  - Starfield repaints drop from ~27/s to 0 in full window
  - the phone canvas is backed at 2x DPR
