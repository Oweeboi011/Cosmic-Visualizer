import { Grid } from "@/components/ui/Grid";

export function LoadingSkeleton({
  shape = "card",
  count = 6,
}: {
  shape?: "card" | "row" | "hero";
  count?: number;
}) {
  if (shape === "hero") {
    return <div className="h-80 w-full animate-pulse rounded-xl bg-space-surface" />;
  }

  if (shape === "row") {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-space-surface" />
        ))}
      </div>
    );
  }

  return (
    <Grid>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-56 w-full animate-pulse rounded-xl bg-space-surface" />
      ))}
    </Grid>
  );
}
