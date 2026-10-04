# 0001. Keep the NASA API key on the server; no proxy routes

- Status: Accepted
- Date: 2026-09-28

## Context

`api.nasa.gov` (APOD, NeoWs) needs a key with a small hourly quota. The first version
exposed seven public `/api/*` routes. Six were unused by the app, and three forwarded the
key, so anyone could exhaust the quota (for example by iterating `/api/apod?date=`).

## Decision

- Pages are Server Components that call `src/lib/nasa/*` directly.
- `NASA_API_KEY` is read only in `src/lib/nasa/client.ts`, which imports `server-only`.
- Add an API route only when a Client Component needs data. The upstream must be keyless
  and the route must set `Cache-Control`. Today that's only `/api/gallery`.
- Bound every upstream input (`clampDateRange`, `parseIntParam`, allowlists). The Exoplanet
  Archive has no parameterized queries, so only allowlisted values reach ADQL.

## Consequences

- Importing `lib/nasa` from a Client Component is a build error (`server-only`) and a lint error.
- Reading `process.env` outside `client.ts` is a lint error.
- Every client-side feature that needs live data costs a route; that friction is intended.
