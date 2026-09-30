import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const LINK_CLASSES =
  "inline-flex items-center gap-1 rounded-full border border-space-border px-3 py-1.5 text-sm text-text-muted transition-colors hover:border-nebula-primary hover:text-text-primary";
const DISABLED_CLASSES =
  "inline-flex items-center gap-1 rounded-full border border-space-border/50 px-3 py-1.5 text-sm text-text-muted/50";

/** Previous/next links that keep every other query parameter (search, tab, …). */
export function Pagination({
  page,
  totalPages,
  basePath,
  params,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(target: number) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && key !== "page") query.set(key, value);
    }
    if (target > 1) query.set("page", String(target));
    const qs = query.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-4">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={LINK_CLASSES}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous
        </Link>
      ) : (
        <span aria-disabled="true" className={DISABLED_CLASSES}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous
        </span>
      )}
      <span className="text-sm text-text-muted" aria-current="page">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} rel="next" className={LINK_CLASSES}>
          Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <span aria-disabled="true" className={DISABLED_CLASSES}>
          Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
