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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-56 w-full animate-pulse rounded-xl bg-space-surface" />
      ))}
    </div>
  );
}
