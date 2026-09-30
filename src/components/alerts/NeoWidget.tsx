import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormattedDate } from "@/components/ui/FormattedDate";
import type { NeoItem } from "@/types/nasa";

export function NeoWidget({ items }: { items: NeoItem[] }) {
  if (items.length === 0) {
    return <EmptyState message="No close approaches in the next 7 days." />;
  }

  return (
    <div className="flex flex-col gap-2">
      {items.slice(0, 8).map((neo) => (
        <div
          key={neo.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-space-border bg-space-surface/60 px-3 py-2"
        >
          <div className="min-w-0">
            <p className="truncate text-sm text-text-primary">{neo.name}</p>
            <p className="text-xs text-text-muted">
              <FormattedDate value={neo.closeApproachDate} /> ·{" "}
              {Math.round(neo.missDistanceKm).toLocaleString("en-US")} km miss distance
            </p>
          </div>
          {neo.isPotentiallyHazardous && <Badge tone="warning">PHA</Badge>}
        </div>
      ))}
    </div>
  );
}
