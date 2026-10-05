"use client";

import { SearchInput } from "@/components/ui/SearchInput";
import { useSearchParam } from "@/components/ui/useSearchParam";

export function GalleryFilters({
  basePath,
  placeholder,
  suggestions,
}: {
  basePath: string;
  placeholder: string;
  suggestions: string[];
}) {
  const [query, setQuery] = useSearchParam("q", basePath);
  const search = (value: string) => setQuery(value.trim());

  return (
    <div className="mb-6 flex flex-col gap-3">
      <SearchInput defaultValue={query} placeholder={placeholder} onChange={search} />
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => search(s)}
            className="rounded-full border border-space-border px-3 py-1 text-xs text-text-muted transition-colors hover:border-nebula-primary hover:text-text-primary"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
