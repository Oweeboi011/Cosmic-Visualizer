export class NasaApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 502, code = "UPSTREAM_ERROR") {
    super(message);
    this.name = "NasaApiError";
    this.status = status;
    this.code = code;
  }
}

export interface ApodItem {
  date: string;
  title: string;
  explanation: string;
  mediaType: "image" | "video" | "other";
  url: string;
  hdurl?: string;
  copyright?: string;
}

export interface GalleryItem {
  nasaId: string;
  title: string;
  description: string;
  dateCreated: string;
  thumbnailUrl: string | null;
  mediaType: string;
  keywords: string[];
  center?: string;
}

export interface GalleryAsset {
  nasaId: string;
  imageUrls: string[];
  metadataUrl?: string;
}

export type AlertSeverity = "info" | "watch" | "warning" | "severe";

export interface AlertItem {
  id: string;
  type: string;
  issuedAt: string;
  title: string;
  summary: string;
  severity: AlertSeverity;
  sourceUrl?: string;
}

export interface NeoItem {
  id: string;
  name: string;
  closeApproachDate: string;
  missDistanceKm: number;
  diameterMinM: number;
  diameterMaxM: number;
  isPotentiallyHazardous: boolean;
  relativeVelocityKph: number;
}

export interface ExoplanetItem {
  name: string;
  hostname: string;
  discoveryYear: number | null;
  discoveryMethod: string;
  radiusEarth: number | null;
  massEarth: number | null;
  orbitalPeriodDays: number | null;
  distanceParsecs: number | null;
}

export const FINDING_AGENCIES = ["NASA", "ESA", "ESO"] as const;

export type FindingAgency = (typeof FINDING_AGENCIES)[number];

export interface FindingItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  publishedAt: string;
  imageUrl?: string;
  source: "live" | "fallback";
  agency: FindingAgency;
}

export interface SolarSystemPlanet {
  name: string;
  type: string;
  description: string;
  diameterKm: number;
  distanceFromSunAu: number;
  moons: number;
  orbitalPeriodDays: number;
  dayLengthHours: number;
  funFact: string;
}

export interface GlossaryEntry {
  term: string;
  definition: string;
  category?: string;
  relatedTerms?: string[];
  simpleExplanation?: string;
  history?: string;
  funFacts?: string[];
}
