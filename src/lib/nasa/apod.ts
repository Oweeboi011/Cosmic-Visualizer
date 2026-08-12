import { fetchNasaApi } from "@/lib/nasa/client";
import type { ApodItem } from "@/types/nasa";
import { isValidDateString } from "@/lib/utils";

interface RawApod {
  date: string;
  title: string;
  explanation: string;
  media_type: string;
  url: string;
  hdurl?: string;
  copyright?: string;
}

const REVALIDATE_SECONDS = 6 * 60 * 60; // 6h — APOD updates once per day

function normalize(raw: RawApod): ApodItem {
  return {
    date: raw.date,
    title: raw.title,
    explanation: raw.explanation,
    mediaType: raw.media_type === "image" || raw.media_type === "video" ? raw.media_type : "other",
    url: raw.url,
    hdurl: raw.hdurl,
    copyright: raw.copyright,
  };
}

export interface GetApodParams {
  date?: string;
  startDate?: string;
  endDate?: string;
  count?: number;
}

/** Max span for archive range requests, to keep payloads and upstream load bounded. */
const MAX_RANGE_DAYS = 30;

export async function getApod(params: GetApodParams = {}): Promise<ApodItem[]> {
  const query: Record<string, string | number | undefined> = {};

  if (params.count) {
    query.count = Math.min(Math.max(params.count, 1), 50);
  } else if (params.startDate && isValidDateString(params.startDate)) {
    query.start_date = params.startDate;
    if (params.endDate && isValidDateString(params.endDate)) {
      const start = new Date(params.startDate);
      const end = new Date(params.endDate);
      const spanDays = (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000);
      query.end_date = spanDays > MAX_RANGE_DAYS
        ? new Date(start.getTime() + MAX_RANGE_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        : params.endDate;
    }
  } else if (params.date && isValidDateString(params.date)) {
    query.date = params.date;
  }

  const raw = await fetchNasaApi<RawApod | RawApod[]>("/planetary/apod", query, {
    revalidate: REVALIDATE_SECONDS,
    tags: ["apod"],
  });

  const items = Array.isArray(raw) ? raw : [raw];
  return items.map(normalize).sort((a, b) => (a.date < b.date ? 1 : -1));
}
