import { PageHeader } from "@/components/layout/PageHeader";
import { GlossaryList } from "@/components/glossary/GlossaryList";
import glossaryData from "@/data/glossary.json";
import type { GlossaryEntry } from "@/types/nasa";

export default function GlossaryPage() {
  return (
    <div>
      <PageHeader
        title="Cosmic Definitions"
        description="A glossary of key astronomy and space-science terms."
      />
      <GlossaryList entries={glossaryData as GlossaryEntry[]} />
    </div>
  );
}
