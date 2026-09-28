"use client";

import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { GalaxySceneLoader } from "@/components/galaxy3d/GalaxySceneLoader";
import { hashStringToSeed } from "@/lib/galaxy3d/seed";
import type { GlossaryEntry as GlossaryEntryType } from "@/types/nasa";

/** Terms the 3D galaxy actually illustrates; other terms get no decorative scene. */
const GALAXY_SCENE_TERMS = new Set(["Galaxy", "Milky Way"]);

export function GlossaryDefinitionModal({
  entry,
  onClose,
}: {
  entry: GlossaryEntryType;
  onClose: () => void;
}) {
  const seed = hashStringToSeed(entry.term);

  return (
    <Modal title={entry.term} onClose={onClose}>
      <div className="flex flex-col gap-6">
        {entry.category && <Badge tone="neutral">{entry.category}</Badge>}

        {GALAXY_SCENE_TERMS.has(entry.term) && <GalaxySceneLoader seed={seed} compact />}

        <section>
          <h3 className="mb-1 text-sm font-semibold text-text-primary">
            In simple terms
          </h3>
          <p className="text-sm text-text-muted">
            {entry.simpleExplanation ?? entry.definition}
          </p>
        </section>

        {entry.history && (
          <section>
            <h3 className="mb-1 text-sm font-semibold text-text-primary">History</h3>
            <p className="text-sm text-text-muted">{entry.history}</p>
          </section>
        )}

        {entry.funFacts && entry.funFacts.length > 0 && (
          <section>
            <h3 className="mb-1 text-sm font-semibold text-text-primary">Fun facts</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-text-muted">
              {entry.funFacts.map((fact, i) => (
                <li key={i}>{fact}</li>
              ))}
            </ul>
          </section>
        )}

        {entry.relatedTerms && entry.relatedTerms.length > 0 && (
          <section>
            <h3 className="mb-1 text-sm font-semibold text-text-primary">
              Related terms
            </h3>
            <p className="text-xs text-text-muted">{entry.relatedTerms.join(", ")}</p>
          </section>
        )}
      </div>
    </Modal>
  );
}
