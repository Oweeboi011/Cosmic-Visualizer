import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PlanetTabs, type PlanetTabKey } from "@/components/planets/PlanetTabs";
import { SolarSystemGrid } from "@/components/planets/SolarSystemGrid";
import { ExoplanetsSection } from "@/components/research/ExoplanetsSection";
import { GalleryCategoryPage } from "@/components/gallery/GalleryCategoryPage";
import solarSystemData from "@/data/solarSystem.json";
import type { SolarSystemPlanet } from "@/types/nasa";

export const metadata: Metadata = { title: "Planets & Exoplanets" };

function resolveTab(value: string | undefined): PlanetTabKey {
  if (value === "exoplanets" || value === "gallery") return value;
  return "solar-system";
}

export default async function PlanetsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string; page?: string; discovery_method?: string }>;
}) {
  const params = await searchParams;
  const tab = resolveTab(params.tab);

  return (
    <div>
      <PageHeader
        title="Planets & Exoplanets"
        description="A library of our Solar System's planets, confirmed exoplanets from the NASA Exoplanet Archive, and searchable NASA imagery."
      />
      <PlanetTabs activeTab={tab} />

      {tab === "solar-system" && (
        <SolarSystemGrid planets={solarSystemData as SolarSystemPlanet[]} />
      )}

      {tab === "exoplanets" && (
        <ExoplanetsSection discoveryMethod={params.discovery_method} basePath="/planets" />
      )}

      {tab === "gallery" && (
        <GalleryCategoryPage
          title="Planets & Exoplanets"
          description=""
          basePath="/planets"
          defaultQuery="planet"
          placeholder="Search planets, exoplanets, solar system imagery…"
          suggestions={["planet", "exoplanet", "solar system", "Mars", "Jupiter", "Saturn"]}
          searchParams={searchParams}
          showHeader={false}
        />
      )}
    </div>
  );
}
