import { ExternalLink } from "@/components/ui/ExternalLink";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormattedDate } from "@/components/ui/FormattedDate";
import type { AlertItem } from "@/types/nasa";

export function AlertTimeline({ items }: { items: AlertItem[] }) {
  if (items.length === 0) {
    return <EmptyState message="No space weather notifications in this window." />;
  }

  return (
    <ol className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.id} className="rounded-lg border border-space-border bg-space-surface/60 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={item.severity}>{item.type}</Badge>
            <span className="text-xs text-text-muted">
              <FormattedDate value={item.issuedAt} withTime />
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-text-primary">{item.title}</p>
          <p className="mt-1 line-clamp-3 text-xs text-text-muted">{item.summary}</p>
          {item.sourceUrl && (
            <ExternalLink
              href={item.sourceUrl}
              className="mt-2 inline-block text-xs font-medium text-nebula-secondary hover:underline"
            >
              View source report
            </ExternalLink>
          )}
        </li>
      ))}
    </ol>
  );
}
