import { PageHeader } from "@/components/layout/PageHeader";
import { FindingsList } from "@/components/findings/FindingsList";
import { FindingsSourceFilter } from "@/components/findings/FindingsSourceFilter";
import { getFindings } from "@/lib/nasa/findings";
import type { FindingAgency } from "@/types/nasa";

const KNOWN_AGENCIES: FindingAgency[] = ["NASA", "ESA", "ESO"];

export default async function FindingsPage({
  searchParams,
}: {
  searchParams: Promise<{ agency?: string }>;
}) {
  const params = await searchParams;
  const agency = KNOWN_AGENCIES.find((a) => a === params.agency);
  const items = await getFindings({ agency });

  return (
    <div>
      <PageHeader
        title="New Findings"
        description="The latest space and astronomy news and discoveries from NASA, ESA, and ESO."
      />
      <FindingsSourceFilter />
      <FindingsList items={items} />
    </div>
  );
}
