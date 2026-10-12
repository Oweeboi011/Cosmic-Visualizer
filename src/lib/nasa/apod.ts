import { fetchNasaApi } from "@/lib/nasa/client";
import type { ApodItem } from "@/types/nasa";
import { DAY_MS, clampDateRange, clampNumber, isValidDateString, safeHttpUrl, toIsoDate } from "@/lib/utils";

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

/** Entries whose `url` isn't a web URL are dropped: it becomes an href/src. */
function normalize(raw: RawApod): ApodItem | null {
  const url = safeHttpUrl(raw.url);
  if (!url) return null;
  return {
    date: raw.date,
    title: raw.title,
    explanation: raw.explanation,
    mediaType: raw.media_type === "image" || raw.media_type === "video" ? raw.media_type : "other",
    url,
    hdurl: safeHttpUrl(raw.hdurl),
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
    query.count = clampNumber(params.count, 1, 50);
  } else if (params.startDate || params.endDate) {
    // Always send a bounded, ordered range: a start date alone would make APOD return
    // everything up to today (thousands of entries), and start > end is an upstream 400.
    // With only a start date, anchor the window there rather than at today.
    const endDate =
      !isValidDateString(params.endDate) && isValidDateString(params.startDate)
        ? toIsoDate(new Date(Math.min(Date.parse(params.startDate) + MAX_RANGE_DAYS * DAY_MS, Date.now())))
        : params.endDate;
    const range = clampDateRange(params.startDate, endDate, MAX_RANGE_DAYS, 13);
    query.start_date = range.startDate;
    query.end_date = range.endDate;
  } else if (params.date && isValidDateString(params.date)) {
    query.date = params.date;
  }

  const raw = await fetchNasaApi<RawApod | RawApod[]>("/planetary/apod", query, {
    revalidate: REVALIDATE_SECONDS,
    tags: ["apod"],
  });

  const items = Array.isArray(raw) ? raw : [raw];
  return items
    .map(normalize)
    .filter((item): item is ApodItem => item !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
