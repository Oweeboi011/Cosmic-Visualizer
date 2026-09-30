import Image from "next/image";
import { isOptimizableImage } from "@/lib/images";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FormattedDate } from "@/components/ui/FormattedDate";
import type { FindingItem } from "@/types/nasa";

export function FindingCard({ item }: { item: FindingItem }) {
  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer">
      <Card className="flex h-full flex-col overflow-hidden p-0">
        {item.imageUrl && (
          <div className="relative aspect-video bg-space-bg">
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
              unoptimized={!isOptimizableImage(item.imageUrl)}
            />
          </div>
        )}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex flex-wrap gap-2">
            <Badge tone="info">{item.agency}</Badge>
            {item.source === "fallback" && <Badge tone="neutral">Curated</Badge>}
          </div>
          <p className="line-clamp-2 text-sm font-semibold text-text-primary">{item.title}</p>
          <p className="line-clamp-3 flex-1 text-xs text-text-muted">{item.summary}</p>
          <p className="text-xs text-text-muted">
            <FormattedDate value={item.publishedAt} />
          </p>
        </div>
      </Card>
    </a>
  );
}
