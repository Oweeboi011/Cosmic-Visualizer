# Cosmic Visualizer

A read-only dashboard visualizing space and astronomy data from NASA, ESA, and ESO:
galaxy imagery, interactive 3D views of galaxies, the Solar System, planets, and star
types, exoplanets, real-time space weather alerts, the latest findings, and a cosmic
definitions glossary. Every 3D view has a full-window mode (button top-right, Esc to exit).

## Sections

- **Overview** (`/`) — APOD hero and highlights from every section.
- **3D Galaxy** (`/galaxy-3d`) — procedural spiral, barred-spiral, elliptical, and irregular galaxies (react-three-fiber) to orbit and zoom, framed to fit any window; bright markers open real NASA-cataloged galaxy images. Reseeds daily.
- **Galaxies** (`/galaxies`) — searchable gallery from the NASA Image and Video Library; galaxy detail pages include a seeded 3D galaxy alongside the real photo.
- **Planets & Exoplanets** (`/planets`) — tabbed library: an animated 3D Solar System with planets at today's real positions (plus a 3D model of each planet with its real axial tilt), the real Exoplanet Archive catalog, and searchable NASA imagery.
- **Stars** (`/stars`) — a 3D model of each stellar spectral class (O–M), plus searchable NASA imagery of stars, clusters, and stellar phenomena.
- **Findings** (`/findings`) — latest articles aggregated from NASA, ESA, and ESO RSS feeds, filterable by source, with a static fallback if the NASA feed is unavailable.
- **Alerts** (`/alerts`) — real-time space weather notifications (DONKI) and near-earth object close approaches (NeoWs).
- **Research** (`/research`) — confirmed exoplanets from the NASA Exoplanet Archive.
- **Glossary** (`/glossary`) — searchable astronomy/space-science terms; each term opens a modal with a beginner-friendly explanation, history, and fun facts (galaxy terms also get a 3D galaxy).
- **Explorations** (`/explorations`) — Astronomy Picture of the Day archive browser.

## Data sources

- [api.nasa.gov](https://api.nasa.gov/) — APOD, DONKI, NeoWs (requires a free API key).
- [NASA Image and Video Library](https://images.nasa.gov/) — keyless.
- [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/) — keyless.
- [science.nasa.gov RSS feed](https://science.nasa.gov/feed/) — keyless; falls back to `src/data/findings.fallback.json` if unreachable.
- [ESA RSS feed](https://www.esa.int/rssfeed/Our_Activities/Space_News) — keyless.
- [ESO RSS feed](https://www.eso.org/public/news/feed/) — keyless.

JAXA, NAOJ, STScI, and the Max Planck Institute for Astronomy were evaluated but have
no public RSS/JSON feed as of this writing (HTML-only news pages), so they're
intentionally not integrated rather than built against fragile scraping.

`science.nasa.gov` itself has no public JSON API, so live data is sourced from the
services above.

## Getting started

```bash
npm install
cp .env.example .env.local   # then set NASA_API_KEY to your own key from https://api.nasa.gov/
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`NASA_API_KEY` is server-only and never reaches the browser — the `DEMO_KEY` fallback
works for local development but has very low rate limits (30 requests/hour, 50/day).

## Testing

```bash
npm run lint        # ESLint
npm run typecheck   # generates Next route types, then tsc --noEmit
npm run test        # Vitest unit tests (NASA data layer + 3D generation)
npm run test:e2e    # Playwright e2e — builds and starts the app itself (first run: npx playwright install chromium)
```

## Architecture

- `src/lib/nasa/*` — one module per data source; fetches, normalizes upstream data into
  stable app-level types, and applies Next.js cache revalidation.
- `src/lib/galaxy3d/*`, `src/lib/space3d/*` — pure, seeded procedural generation (galaxy
  morphologies, planet textures, noise, stellar data), unit-tested without WebGL.
- `src/components/space3d/*` — shared 3D building blocks: `SceneCanvas` (WebGL fallback and
  full-window mode), `PlanetBody`, texture cache, and lazy `ssr: false` loaders.
- Server Components (pages) import `lib/nasa/*` directly. The only API route is
  `src/app/api/gallery`, used by the client-side galaxy star modal; no route proxies the
  NASA API key.
- `docs/AUDIT.md` — the latest audit: findings, what was fixed, and the open backlog.
- `src/data/*.json` — static content (glossary, solar system facts, findings fallback)
  with no live API dependency.
