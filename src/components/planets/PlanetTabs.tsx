"use client";

import Link from "next/link";

const TABS = [
  { key: "solar-system", label: "Solar System" },
  { key: "exoplanets", label: "Exoplanets" },
  { key: "gallery", label: "Image Gallery" },
] as const;

export type PlanetTabKey = (typeof TABS)[number]["key"];

export function PlanetTabs({ activeTab }: { activeTab: PlanetTabKey }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2 border-b border-space-border pb-3">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={`/planets?tab=${tab.key}`}
          className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
            activeTab === tab.key
              ? "bg-nebula-primary/20 text-nebula-primary"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
