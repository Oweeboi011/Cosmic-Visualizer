import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getGalleryAsset } from "@/lib/nasa/gallery";
import { NasaApiError } from "@/types/nasa";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { GalaxySceneLoader } from "@/components/galaxy3d/GalaxySceneLoader";
import { dailySeedForAsset } from "@/lib/galaxy3d/seed";

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
  let imageUrls: string[] = [];
  try {
    const asset = await getGalleryAsset(nasaId);
    imageUrls = asset.imageUrls;
  } catch (err) {
    if (err instanceof NasaApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

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
            <Image
              src={primaryImage}
              // The asset endpoint has no title/description; see docs/AUDIT.md backlog.
              alt={`NASA Image and Video Library image ${nasaId}`}
              fill
              sizes="100vw"
              className="object-contain"
              unoptimized
            />
          </div>
        )}
        <div className="p-6">
          <Badge tone="info">NASA Image and Video Library</Badge>
          <p className="mt-2 text-sm text-text-muted">Asset ID: {nasaId}</p>
          <a
            href={`https://images.nasa.gov/details/${nasaId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-medium text-nebula-secondary hover:underline"
          >
            View full details on images.nasa.gov
          </a>
        </div>
      </Card>
    </div>
  );
}
