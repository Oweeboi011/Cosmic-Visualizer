import { fetchNasaApi } from "@/lib/nasa/client";
import type { NeoItem } from "@/types/nasa";
import { clampDateRange } from "@/lib/utils";

const REVALIDATE_SECONDS = 60 * 60; // 1h
/** NASA's NeoWs feed endpoint itself enforces a 7-day max range. */
const MAX_RANGE_DAYS = 7;

interface RawCloseApproach {
  close_approach_date: string;
  miss_distance: { kilometers: string };
  relative_velocity: { kilometers_per_hour: string };
}

interface RawNeo {
  id: string;
  name: string;
  is_potentially_hazardous_asteroid: boolean;
  estimated_diameter: {
    meters: { estimated_diameter_min: number; estimated_diameter_max: number };
  };
  close_approach_data: RawCloseApproach[];
}

interface RawNeoFeed {
  near_earth_objects: Record<string, RawNeo[]>;
}

function normalize(raw: RawNeo): NeoItem | null {
  const approach = raw.close_approach_data[0];
  if (!approach) return null;

  return {
    id: raw.id,
    name: raw.name,
    closeApproachDate: approach.close_approach_date,
    missDistanceKm: Number.parseFloat(approach.miss_distance.kilometers),
    diameterMinM: raw.estimated_diameter.meters.estimated_diameter_min,
    diameterMaxM: raw.estimated_diameter.meters.estimated_diameter_max,
    isPotentiallyHazardous: raw.is_potentially_hazardous_asteroid,
    relativeVelocityKph: Number.parseFloat(approach.relative_velocity.kilometers_per_hour),
  };
}

export interface GetNeosParams {
  startDate?: string;
  endDate?: string;
}

export async function getNeos(params: GetNeosParams = {}): Promise<NeoItem[]> {
  const { startDate, endDate } = clampDateRange(params.startDate, params.endDate, MAX_RANGE_DAYS, 7);

  const raw = await fetchNasaApi<RawNeoFeed>(
    "/neo/rest/v1/feed",
    { start_date: startDate, end_date: endDate },
    { revalidate: REVALIDATE_SECONDS, tags: ["neows"] }
  );

  return Object.values(raw.near_earth_objects)
    .flat()
    .map(normalize)
    .filter((n): n is NeoItem => n !== null)
    .sort((a, b) => (a.closeApproachDate < b.closeApproachDate ? -1 : 1));
}
