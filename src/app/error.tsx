"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <ErrorState message="Something went wrong loading this page." />
      <button
        type="button"
        onClick={reset}
        className="rounded-lg border border-space-border px-4 py-2 text-sm text-text-primary hover:border-nebula-primary"
      >
        Try again
      </button>
    </div>
  );
}
