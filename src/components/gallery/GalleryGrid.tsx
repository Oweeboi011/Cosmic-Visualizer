import Image from "next/image";
import Link from "next/link";
import { Grid } from "@/components/ui/Grid";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { GalleryItem } from "@/types/nasa";

export function GalleryGrid({
  items,
  basePath,
}: {
  items: GalleryItem[];
  basePath: string;
}) {
  if (items.length === 0) {
    return <EmptyState message="No images found for this search. Try a different term." />;
  }

  return (
    <Grid>
      {items.map((item) => (
        <Link key={item.nasaId} href={`${basePath}/${item.nasaId}`}>
          <Card className="group h-full overflow-hidden p-0">
            <div className="relative aspect-square bg-space-bg">
              {item.thumbnailUrl && (
                <Image
                  src={item.thumbnailUrl}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform group-hover:scale-105"
                  unoptimized
                />
              )}
            </div>
            <div className="p-3">
              <p className="line-clamp-2 text-sm font-medium text-text-primary">{item.title}</p>
              {item.dateCreated && (
                <p className="mt-1 text-xs text-text-muted">
                  {new Date(item.dateCreated).toLocaleDateString()}
                </p>
              )}
            </div>
          </Card>
        </Link>
      ))}
    </Grid>
  );
}
