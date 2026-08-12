"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { FindingAgency } from "@/types/nasa";

const AGENCIES: FindingAgency[] = ["NASA", "ESA", "ESO"];

export function FindingsSourceFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("agency") ?? "";

  function setAgency(agency: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (agency) {
      params.set("agency", agency);
    } else {
      params.delete("agency");
    }
    router.push(`/findings?${params.toString()}`);
  }

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setAgency("")}
        className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
          current === ""
            ? "bg-nebula-primary/20 text-nebula-primary"
            : "text-text-muted hover:text-text-primary"
        }`}
      >
        All
      </button>
      {AGENCIES.map((agency) => (
        <button
          key={agency}
          type="button"
          onClick={() => setAgency(agency)}
          className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
            current === agency
              ? "bg-nebula-primary/20 text-nebula-primary"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          {agency}
        </button>
      ))}
    </div>
  );
}
