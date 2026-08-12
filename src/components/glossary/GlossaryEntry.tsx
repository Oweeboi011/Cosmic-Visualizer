import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { GlossaryEntry as GlossaryEntryType } from "@/types/nasa";

export function GlossaryEntry({ entry }: { entry: GlossaryEntryType }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-text-primary">{entry.term}</h3>
        {entry.category && <Badge tone="neutral">{entry.category}</Badge>}
      </div>
      <p className="mt-2 text-sm text-text-muted">{entry.definition}</p>
      {entry.relatedTerms && entry.relatedTerms.length > 0 && (
        <p className="mt-3 text-xs text-text-muted">
          Related:{" "}
          {entry.relatedTerms.map((t, i) => (
            <span key={t}>
              {i > 0 && ", "}
              {t}
            </span>
          ))}
        </p>
      )}
    </Card>
  );
}
