import { PageHeader } from "@/components/layout/PageHeader";
import { ExoplanetsSection } from "@/components/research/ExoplanetsSection";

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ discovery_method?: string }>;
}) {
  const params = await searchParams;

  return (
    <div>
      <PageHeader
        title="Cosmic Research"
        description="Confirmed exoplanets from the NASA Exoplanet Archive, sorted by most recently discovered."
      />
      <ExoplanetsSection discoveryMethod={params.discovery_method} basePath="/research" />
    </div>
  );
}
