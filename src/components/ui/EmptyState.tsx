import { Telescope } from "lucide-react";

export function EmptyState({ message = "No results found." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-space-border px-6 py-12 text-center">
      <Telescope className="h-8 w-8 text-text-muted" aria-hidden="true" />
      <p className="max-w-md text-sm text-text-muted">{message}</p>
    </div>
  );
}
