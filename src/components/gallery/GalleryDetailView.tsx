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
}: {
  nasaId: string;
  basePath: string;
  backLabel: string;
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
  const seed = dailySeedForAsset(nasaId);

  return (
    <div>
      <Link
        href={basePath}
        className="mb-6 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> {backLabel}
      </Link>

      <GalaxySceneLoader seed={seed} />

      <Card className="mt-6 overflow-hidden p-0">
        {primaryImage && (
          <div className="relative aspect-video bg-space-bg">
            <Image
              src={primaryImage}
              alt={nasaId}
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
