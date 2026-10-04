"use client";

import { useSearchParam } from "@/components/ui/useSearchParam";

export function ExoplanetFilterBar({
  methods,
  basePath = "/research",
}: {
  methods: string[];
  basePath?: string;
}) {
  const [method, setMethod] = useSearchParam("discovery_method", basePath);

  return (
    <select
      aria-label="Filter by discovery method"
      value={method}
      onChange={(e) => setMethod(e.target.value)}
      className="mb-6 rounded-lg border border-space-border bg-space-surface px-3 py-2 text-sm text-text-primary focus:border-nebula-primary focus:outline-none"
    >
      <option value="">All discovery methods</option>
      {methods.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
  );
}
