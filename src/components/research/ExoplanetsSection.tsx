import { ExoplanetFilterBar } from "@/components/research/ExoplanetFilterBar";
import { ExoplanetTable } from "@/components/research/ExoplanetTable";
import { ErrorState } from "@/components/ui/ErrorState";
import { getExoplanets, getKnownDiscoveryMethods } from "@/lib/nasa/exoplanets";
import type { ExoplanetItem } from "@/types/nasa";

export async function ExoplanetsSection({
  discoveryMethod,
  basePath = "/research",
}: {
  discoveryMethod?: string;
  basePath?: string;
}) {
  let items: ExoplanetItem[];
  try {
    ({ items } = await getExoplanets({ discoveryMethod, limit: 50 }));
  } catch {
    return (
      <ErrorState message="We couldn't load exoplanet data from the NASA Exoplanet Archive right now." />
    );
  }

  return (
    <>
      <ExoplanetFilterBar methods={getKnownDiscoveryMethods()} basePath={basePath} />
      <ExoplanetTable items={items} />
    </>
  );
}
