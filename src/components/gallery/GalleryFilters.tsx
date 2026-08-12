"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SearchInput } from "@/components/ui/SearchInput";

export function GalleryFilters({
  basePath,
  placeholder,
  suggestions,
}: {
  basePath: string;
  placeholder: string;
  suggestions: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";

  function handleSearch(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="mb-6 flex flex-col gap-3">
      <SearchInput
        defaultValue={currentQuery}
        placeholder={placeholder}
        onChange={handleSearch}
      />
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleSearch(s)}
            className="rounded-full border border-space-border px-3 py-1 text-xs text-text-muted transition-colors hover:border-nebula-primary hover:text-text-primary"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
