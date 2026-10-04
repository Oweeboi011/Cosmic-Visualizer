import type { Metadata } from "next";
import { RemoteImage } from "@/components/ui/RemoteImage";
import { ExternalLink } from "@/components/ui/ExternalLink";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getGalleryAsset, getGalleryItem } from "@/lib/nasa/gallery";
import { NasaApiError, type GalleryItem } from "@/types/nasa";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FormattedDate } from "@/components/ui/FormattedDate";
import { GalaxySceneLoader } from "@/components/galaxy3d/GalaxySceneLoader";
import { dailySeedForAsset } from "@/lib/galaxy3d/seed";

/** Metadata is a nicety: the page still renders from the asset alone if search fails. */
async function getItemOrNull(nasaId: string): Promise<GalleryItem | null> {
  try {
    return await getGalleryItem(nasaId);
  } catch {
    return null;
  }
}

/** `generateMetadata` for detail pages; the fetch is shared with the page render. */
export async function galleryDetailMetadata(nasaId: string, fallbackTitle: string): Promise<Metadata> {
  const item = await getItemOrNull(nasaId);
  return {
    title: item?.title ?? fallbackTitle,
    description: item?.description ? item.description.slice(0, 200) : undefined,
  };
}

/**
 * Rendered with no Suspense boundary above it (the list pages' loading.tsx live in route
 * groups), so `notFound()` runs before the response starts and returns a real 404.
 */
export async function GalleryDetailView({
  nasaId,
  basePath,
  backLabel,
  showGalaxyScene = false,
}: {
  nasaId: string;
  basePath: string;
  backLabel: string;
  /** Only meaningful for galaxy imagery — a spiral galaxy above a Mars photo isn't. */
  showGalaxyScene?: boolean;
}) {
  // Started first so both requests run in parallel; it never rejects.
  const itemPromise = getItemOrNull(nasaId);
  let imageUrls: string[];
  try {
    ({ imageUrls } = await getGalleryAsset(nasaId));
  } catch (err) {
    if (err instanceof NasaApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }
  const item = await itemPromise;

  const title = item?.title ?? `NASA image ${nasaId}`;
  const primaryImage = imageUrls.find((u) => /~large|~medium/.test(u)) ?? imageUrls[0];
  return (
    <div>
      <Link
        href={basePath}
        className="mb-6 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> {backLabel}
      </Link>

      {showGalaxyScene && (
        <div className="mb-6">
          <GalaxySceneLoader seed={dailySeedForAsset(nasaId)} />
        </div>
      )}

      <Card className="overflow-hidden p-0">
        {primaryImage && (
          <div className="relative aspect-video bg-space-bg">
            <RemoteImage
              src={primaryImage}
              alt={title}
              fill
              sizes="(min-width: 1152px) 1152px, 100vw"
              className="object-contain"
            />
          </div>
        )}
        <div className="p-6">
          <Badge tone="info">NASA Image and Video Library</Badge>
          <h1 className="mt-3 text-2xl font-semibold text-text-primary">{title}</h1>
          {item ? <ItemDetails item={item} /> : <AssetIdLine nasaId={nasaId} />}
          <ExternalLink
            href={`https://images.nasa.gov/details/${encodeURIComponent(nasaId)}`}
            className="mt-4 inline-block text-sm font-medium text-nebula-secondary hover:underline"
          >
            View full details on images.nasa.gov
          </ExternalLink>
        </div>
      </Card>
    </div>
  );
}

function AssetIdLine({ nasaId, item }: { nasaId: string; item?: GalleryItem }) {
  return (
    <p className="mt-1 text-xs text-text-muted">
      {item?.dateCreated && (
        <>
          <FormattedDate value={item.dateCreated} /> ·{" "}
        </>
      )}
      {item?.center && <>{item.center} · </>}
      Asset ID: {nasaId}
    </p>
  );
}

function ItemDetails({ item }: { item: GalleryItem }) {
  return (
    <>
      <AssetIdLine nasaId={item.nasaId} item={item} />
      {item.description && <p className="mt-4 text-sm leading-relaxed text-text-muted">{item.description}</p>}
      {item.keywords.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Keywords">
          {item.keywords.slice(0, 12).map((keyword) => (
            <li key={keyword}>
              <Badge>{keyword}</Badge>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
