"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function ExoplanetFilterBar({
  methods,
  basePath = "/research",
}: {
  methods: string[];
  basePath?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("discovery_method") ?? "";

  function setMethod(method: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (method) {
      params.set("discovery_method", method);
    } else {
      params.delete("discovery_method");
    }
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <select
      value={current}
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
