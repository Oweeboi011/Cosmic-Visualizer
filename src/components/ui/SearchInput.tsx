"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function SearchInput({
  defaultValue = "",
  placeholder = "Search…",
  onChange,
  debounceMs = 350,
  label,
}: {
  defaultValue?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  debounceMs?: number;
  /** Accessible name; defaults to the placeholder, which alone isn't a label. */
  label?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  function handleChange(next: string) {
    setValue(next);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => onChange(next), debounceMs);
  }

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
        aria-hidden="true"
      />
      <input
        type="search"
        aria-label={label ?? placeholder}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-space-border bg-space-surface py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-nebula-primary focus:outline-none"
      />
    </div>
  );
}
