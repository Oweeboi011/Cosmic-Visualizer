import { Grid } from "@/components/ui/Grid";
import { EmptyState } from "@/components/ui/EmptyState";
import { FindingCard } from "@/components/findings/FindingCard";
import type { FindingItem } from "@/types/nasa";

export function FindingsList({ items }: { items: FindingItem[] }) {
  if (items.length === 0) {
    return <EmptyState message="No findings available right now." />;
  }

  return (
    <Grid>
      {items.map((item) => (
        <FindingCard key={item.id} item={item} />
      ))}
    </Grid>
  );
}
