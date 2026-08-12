# Cosmic Visualizer

A read-only dashboard visualizing space and astronomy data from NASA, ESA, and ESO:
galaxy imagery, an interactive 3D galaxy explorer, planets and exoplanets, real-time
space weather alerts, the latest findings, and a cosmic definitions glossary.

## Sections

- **Overview** (`/`) — APOD hero and highlights from every section.
- **3D Galaxy** (`/galaxy-3d`) — a 3D field of real, NASA-cataloged galaxy images (react-three-fiber) you can orbit and zoom through; click a marker to open that galaxy's real detail page. Reseeds daily.
- **Galaxies** (`/galaxies`) — searchable gallery from the NASA Image and Video Library; each result has a seeded 3D viewer alongside the real photo.
- **Planets & Exoplanets** (`/planets`) — tabbed library: Solar System facts (with per-planet 3D viewer modals), the real Exoplanet Archive catalog, and searchable NASA imagery.
- **Stars** (`/stars`) — searchable NASA imagery of stars, clusters, and stellar phenomena.
- **Findings** (`/findings`) — latest articles aggregated from NASA, ESA, and ESO RSS feeds, filterable by source, with a static fallback if the NASA feed is unavailable.
- **Alerts** (`/alerts`) — real-time space weather notifications (DONKI) and near-earth object close approaches (NeoWs).
- **Research** (`/research`) — confirmed exoplanets from the NASA Exoplanet Archive.
- **Glossary** (`/glossary`) — searchable astronomy/space-science terms; each term opens a modal with a beginner-friendly explanation, history, fun facts, and a 3D viewer.
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
npm run test        # Vitest unit tests for the NASA data normalization layer
npm run test:e2e     # Playwright smoke test (requires `npm run build && npm run start` or `npm run dev` running)
```

## Architecture

- `src/lib/nasa/*` — one module per data source; fetches, normalizes upstream data into
  stable app-level types, and applies Next.js cache revalidation.
- `src/lib/galaxy3d/*` — procedural spiral-galaxy generation and seeding helpers shared
  by every 3D viewer instance across the app.
- `src/app/api/*` — route handlers used by client components for interactive re-fetching
  (search, filters); they wrap the same `lib/nasa` modules.
- Server Components (pages) import `lib/nasa/*` directly for first-paint data.
- `src/data/*.json` — static content (glossary, solar system facts, findings fallback)
  with no live API dependency.
