"use client";

import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { useSearchParam } from "@/components/ui/useSearchParam";
import { FINDING_AGENCIES } from "@/types/nasa";

const OPTIONS = [
  { value: "", label: "All" },
  ...FINDING_AGENCIES.map((agency) => ({ value: agency, label: agency })),
];

export function FindingsSourceFilter() {
  const [agency, setAgency] = useSearchParam("agency", "/findings");
  return <ToggleGroup label="News source" options={OPTIONS} value={agency} onChange={setAgency} />;
}
