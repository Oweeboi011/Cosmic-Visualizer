import { AlertTriangle } from "lucide-react";

export function ErrorState({
  message = "We couldn't load this data right now.",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-space-border bg-space-surface/60 px-6 py-12 text-center">
      <AlertTriangle className="h-8 w-8 text-alert-warning" aria-hidden="true" />
      <p className="max-w-md text-sm text-text-muted">{message}</p>
    </div>
  );
}
