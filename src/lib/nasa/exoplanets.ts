import { fetchJson } from "@/lib/nasa/client";
import type { ExoplanetItem } from "@/types/nasa";
import { clampNumber } from "@/lib/utils";

const TAP_BASE = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync";
const REVALIDATE_SECONDS = 24 * 60 * 60; // 24h — archive updates infrequently

const COLUMNS = [
  "pl_name",
  "hostname",
  "disc_year",
  "discoverymethod",
  "pl_rade",
  "pl_bmasse",
  "pl_orbper",
  "sy_dist",
] as const;

/**
 * Discovery methods are validated against this allowlist before being embedded in the
 * ADQL query string — the Exoplanet Archive TAP endpoint has no parameterized-query
 * support, so untrusted values must never be concatenated directly.
 */
const KNOWN_DISCOVERY_METHODS = new Set([
  "Transit",
  "Radial Velocity",
  "Imaging",
  "Microlensing",
  "Transit Timing Variations",
  "Eclipse Timing Variations",
  "Orbital Brightness Modulation",
  "Pulsar Timing",
  "Pulsation Timing Variations",
  "Astrometry",
  "Disk Kinematics",
]);

interface RawExoplanetRow {
  pl_name: string;
  hostname: string;
  disc_year: number | null;
  discoverymethod: string;
  pl_rade: number | null;
  pl_bmasse: number | null;
  pl_orbper: number | null;
  sy_dist: number | null;
}

function normalize(row: RawExoplanetRow): ExoplanetItem {
  return {
    name: row.pl_name,
    hostname: row.hostname,
    discoveryYear: row.disc_year,
    discoveryMethod: row.discoverymethod,
    radiusEarth: row.pl_rade,
    massEarth: row.pl_bmasse,
    orbitalPeriodDays: row.pl_orbper,
    distanceParsecs: row.sy_dist,
  };
}

export interface GetExoplanetsParams {
  limit?: number;
  discoveryMethod?: string;
}

/**
 * The Exoplanet Archive TAP service is Oracle-backed ADQL, not standard SQL — it
 * supports `TOP n` for row limiting but rejects `OFFSET`/`LIMIT` (ORA-00933), so
 * pagination isn't available here; only a bounded top-N result set is fetched.
 */
export async function getExoplanets(params: GetExoplanetsParams = {}): Promise<{ items: ExoplanetItem[] }> {
  const limit = clampNumber(params.limit ?? 50, 1, 200);

  let where = "";
  if (params.discoveryMethod && KNOWN_DISCOVERY_METHODS.has(params.discoveryMethod)) {
    where = ` where discoverymethod = '${params.discoveryMethod}'`;
  }

  const adql =
    `select top ${limit} ${COLUMNS.join(",")} from pscomppars${where}` + ` order by disc_year desc`;

  const url = new URL(TAP_BASE);
  url.searchParams.set("query", adql);
  url.searchParams.set("format", "json");

  const raw = await fetchJson<RawExoplanetRow[]>(url.toString(), {
    revalidate: REVALIDATE_SECONDS,
    tags: ["exoplanets"],
  });

  return { items: raw.map(normalize) };
}

export function getKnownDiscoveryMethods(): string[] {
  return Array.from(KNOWN_DISCOVERY_METHODS);
}
