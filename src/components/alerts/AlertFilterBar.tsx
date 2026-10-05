"use client";

import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { useSearchParam } from "@/components/ui/useSearchParam";

const TYPES = [
  { value: "all", label: "All" },
  { value: "CME", label: "Coronal Mass Ejections" },
  { value: "FLR", label: "Solar Flares" },
  { value: "GST", label: "Geomagnetic Storms" },
  { value: "SEP", label: "Solar Particle Events" },
];

export function AlertFilterBar() {
  const [type, setType] = useSearchParam("type", "/alerts", "all");
  return <ToggleGroup label="Alert type" options={TYPES} value={type} onChange={setType} />;
}
