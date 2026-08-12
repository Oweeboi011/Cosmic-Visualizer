"use client";

import { useRouter, useSearchParams } from "next/navigation";

const TYPES = [
  { value: "all", label: "All" },
  { value: "CME", label: "Coronal Mass Ejections" },
  { value: "FLR", label: "Solar Flares" },
  { value: "GST", label: "Geomagnetic Storms" },
  { value: "SEP", label: "Solar Particle Events" },
];

export function AlertFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("type") ?? "all";

  function setType(type: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (type === "all") {
      params.delete("type");
    } else {
      params.set("type", type);
    }
    router.push(`/alerts?${params.toString()}`);
  }

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {TYPES.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setType(value)}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
            current === value
              ? "border-nebula-primary bg-nebula-primary/15 text-nebula-primary"
              : "border-space-border text-text-muted hover:border-nebula-primary hover:text-text-primary"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
