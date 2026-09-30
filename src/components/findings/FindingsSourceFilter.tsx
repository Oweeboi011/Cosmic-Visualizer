"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FINDING_AGENCIES } from "@/types/nasa";

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
    <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="News source">
      <button
        type="button"
        aria-pressed={current === ""}
        onClick={() => setAgency("")}
        className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
          current === ""
            ? "bg-nebula-primary/20 text-nebula-primary"
            : "text-text-muted hover:text-text-primary"
        }`}
      >
        All
      </button>
      {FINDING_AGENCIES.map((agency) => (
        <button
          key={agency}
          type="button"
          aria-pressed={current === agency}
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
