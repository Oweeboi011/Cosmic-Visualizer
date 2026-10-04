"use client";

import { useMemo, useState } from "react";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlossaryEntry } from "@/components/glossary/GlossaryEntry";
import { GlossaryDefinitionModal } from "@/components/glossary/GlossaryDefinitionModal";
import type { GlossaryEntry as GlossaryEntryType } from "@/types/nasa";

function filterGlossary(entries: GlossaryEntryType[], query: string): GlossaryEntryType[] {
  const q = query.trim().toLowerCase();
  if (!q) return entries;
  return entries.filter(
    (e) =>
      e.term.toLowerCase().includes(q) ||
      e.definition.toLowerCase().includes(q) ||
      e.category?.toLowerCase().includes(q),
  );
}

export function GlossaryList({ entries }: { entries: GlossaryEntryType[] }) {
  const [query, setQuery] = useState("");
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const filtered = useMemo(() => filterGlossary(entries, query), [entries, query]);
  const selectedEntry = entries.find((e) => e.term === selectedTerm) ?? null;

  return (
    <div>
      <div className="mb-6 max-w-md">
        <SearchInput placeholder="Search terms…" onChange={setQuery} />
      </div>
      {filtered.length === 0 ? (
        <EmptyState message="No glossary terms match your search." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((entry) => (
            <button
              key={entry.term}
              type="button"
              onClick={() => setSelectedTerm(entry.term)}
              className="text-left"
            >
              <GlossaryEntry entry={entry} />
            </button>
          ))}
        </div>
      )}

      {selectedEntry && (
        <GlossaryDefinitionModal
          key={selectedEntry.term}
          entry={selectedEntry}
          onClose={() => setSelectedTerm(null)}
        />
      )}
    </div>
  );
}
