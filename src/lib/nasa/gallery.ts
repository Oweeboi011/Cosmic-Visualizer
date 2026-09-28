import { fetchJson } from "@/lib/nasa/client";
import type { GalleryAsset, GalleryItem } from "@/types/nasa";

const IMAGES_API_BASE = "https://images-api.nasa.gov";
const REVALIDATE_SECONDS = 24 * 60 * 60; // 24h — search index is fairly stable
const DEFAULT_QUERY = "galaxy";

interface RawSearchLink {
  href: string;
  rel: string;
  render?: string;
}

interface RawSearchDataItem {
  nasa_id: string;
  title: string;
  description?: string;
  date_created?: string;
  media_type: string;
  keywords?: string[];
  center?: string;
}

interface RawSearchItem {
  href: string;
  data: RawSearchDataItem[];
  links?: RawSearchLink[];
}

interface RawSearchResponse {
  collection: {
    items: RawSearchItem[];
    metadata?: { total_hits: number };
  };
}

function normalize(item: RawSearchItem): GalleryItem | null {
  const data = item.data?.[0];
  if (!data) return null;
  const thumb = item.links?.find((l) => l.rel === "preview")?.href ?? null;

  return {
    nasaId: data.nasa_id,
    title: data.title,
    description: data.description ?? "",
    dateCreated: data.date_created ?? "",
    thumbnailUrl: thumb,
    mediaType: data.media_type,
    keywords: data.keywords ?? [],
    center: data.center,
  };
}

export interface SearchGalleryParams {
  q?: string;
  page?: number;
}

export async function searchGallery(
  params: SearchGalleryParams = {}
): Promise<{ items: GalleryItem[]; page: number; totalHits: number }> {
  const q = params.q?.trim() || DEFAULT_QUERY;
  const page = params.page && params.page > 0 ? params.page : 1;

  const url = new URL(`${IMAGES_API_BASE}/search`);
  url.searchParams.set("q", q);
  url.searchParams.set("media_type", "image");
  url.searchParams.set("page", String(page));

  const raw = await fetchJson<RawSearchResponse>(url.toString(), {
    revalidate: REVALIDATE_SECONDS,
    tags: ["gallery"],
  });

  const items = raw.collection.items
    .map(normalize)
    .filter((i): i is GalleryItem => i !== null)
    .sort((a, b) => (a.dateCreated < b.dateCreated ? 1 : a.dateCreated > b.dateCreated ? -1 : 0));

  return {
    items,
    page,
    totalHits: raw.collection.metadata?.total_hits ?? items.length,
  };
}

interface RawAssetResponse {
  collection: {
    items: { href: string }[];
  };
}

export async function getGalleryAsset(nasaId: string): Promise<GalleryAsset> {
  const raw = await fetchJson<RawAssetResponse>(`${IMAGES_API_BASE}/asset/${encodeURIComponent(nasaId)}`, {
    revalidate: REVALIDATE_SECONDS,
    tags: ["gallery", `gallery-asset-${nasaId}`],
  });

  const imageUrls = raw.collection.items
    .map((i) => i.href)
    .filter((href) => /\.(jpg|jpeg|png)$/i.test(href));

  return { nasaId, imageUrls };
}
