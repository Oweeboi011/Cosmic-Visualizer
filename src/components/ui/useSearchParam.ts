"use client";

import { useRouter, useSearchParams } from "next/navigation";

/**
 * One URL query parameter as state, so filters are shareable links. Setting it to the
 * default (or "") removes it, and any change resets pagination to page 1.
 */
export function useSearchParam(key: string, basePath: string, defaultValue = "") {
  const router = useRouter();
  const searchParams = useSearchParams();
  const value = searchParams.get(key) ?? defaultValue;

  function setValue(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next && next !== defaultValue) {
      params.set(key, next);
    } else {
      params.delete(key);
    }
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  }

  return [value, setValue] as const;
}
