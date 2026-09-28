import { XMLParser } from "fast-xml-parser";
import { fetchText } from "@/lib/nasa/client";
import { NasaApiError, type FindingItem, type FindingAgency } from "@/types/nasa";
import fallbackData from "@/data/findings.fallback.json";

/**
 * Verified live at implementation time (2026-08): all three of these are standard
 * RSS 2.0 feeds requiring no API key. JAXA, NAOJ, STScI, and Max Planck (MPIA) were
 * researched and found to have no public RSS/JSON feed as of this date — only HTML
 * news pages, which would require fragile scraping — so they're intentionally
 * omitted rather than built against an unstable source.
 */
const AGENCY_FEEDS: Record<FindingAgency, string> = {
  NASA: "https://science.nasa.gov/feed/",
  ESA: "https://www.esa.int/rssfeed/Our_Activities/Space_News",
  ESO: "https://www.eso.org/public/news/feed/",
};

const REVALIDATE_SECONDS = 6 * 60 * 60; // 6h

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&#8230;/g, "…")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;/g, "’")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** Feed content is third-party and rendered as href/src, so only allow web URLs. */
function safeHttpUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function extractFirstImage(html: string): string | undefined {
  const match = html.match(/<img[^>]*\ssrc="([^"]+)"/);
  return safeHttpUrl(match?.[1]);
}

/** A malformed pubDate must not throw — that would discard the agency's whole feed. */
function toIsoOrNow(date: string | undefined): string {
  const parsed = date ? new Date(date) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : new Date().toISOString();
}

interface RawRssItem {
  title?: string;
  link?: string;
  description?: string;
  pubDate?: string;
  guid?: { "#text"?: string } | string;
}

function normalize(item: RawRssItem, agency: FindingAgency, index: number): FindingItem | null {
  const link = safeHttpUrl(item.link);
  if (!item.title || !link) return null;
  const description = item.description ?? "";
  const guid = typeof item.guid === "string" ? item.guid : item.guid?.["#text"];

  return {
    id: guid ?? `${link}-${index}`,
    title: stripHtml(item.title),
    summary: stripHtml(description).slice(0, 400),
    link,
    publishedAt: toIsoOrNow(item.pubDate),
    imageUrl: extractFirstImage(description),
    source: "live",
    agency,
  };
}

async function fetchAgencyFeed(agency: FindingAgency): Promise<FindingItem[]> {
  const xml = await fetchText(AGENCY_FEEDS[agency], {
    revalidate: REVALIDATE_SECONDS,
    tags: ["findings", `findings-${agency.toLowerCase()}`],
  });
  const parsed = parser.parse(xml);
  const rawItems = parsed?.rss?.channel?.item;
  const items: RawRssItem[] = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

  if (items.length === 0) {
    throw new NasaApiError(`${agency} feed returned no items`, 502, "EMPTY_FEED");
  }

  const normalized = items
    .map((item, i) => normalize(item, agency, i))
    .filter((f): f is FindingItem => f !== null);

  if (normalized.length === 0) {
    throw new NasaApiError(`${agency} feed items could not be parsed`, 502, "UNPARSEABLE_FEED");
  }

  return normalized;
}

function getFallback(): FindingItem[] {
  return (fallbackData as Omit<FindingItem, "source" | "agency">[]).map((f) => ({
    ...f,
    source: "fallback",
    agency: "NASA",
  }));
}

export interface GetFindingsParams {
  agency?: FindingAgency;
}

export async function getFindings(params: GetFindingsParams = {}): Promise<FindingItem[]> {
  const agencies = params.agency ? [params.agency] : (Object.keys(AGENCY_FEEDS) as FindingAgency[]);

  const results = await Promise.allSettled(agencies.map((agency) => fetchAgencyFeed(agency)));

  const items: FindingItem[] = [];
  results.forEach((result, i) => {
    const agency = agencies[i];
    if (result.status === "fulfilled") {
      items.push(...result.value);
    } else {
      console.warn(
        `[nasa/findings] ${agency} feed fetch/parse failed:`,
        result.reason instanceof Error ? result.reason.message : result.reason
      );
      if (agency === "NASA") {
        items.push(...getFallback());
      }
    }
  });

  return items.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0));
}
