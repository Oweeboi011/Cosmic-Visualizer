import { Suspense, type ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { GalleryFilters } from "@/components/gallery/GalleryFilters";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { parseIntParam } from "@/lib/utils";
import { Pagination } from "@/components/ui/Pagination";
import { GALLERY_MAX_PAGE, GALLERY_PAGE_SIZE, searchGallery } from "@/lib/nasa/gallery";

async function GalleryResults({
  q,
  page,
  basePath,
  params,
}: {
  q: string;
  page: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  let result;
  try {
    result = await searchGallery({ q, page });
  } catch {
    return <ErrorState message="We couldn't load images from the NASA Image and Video Library." />;
  }
  const totalPages = Math.min(Math.ceil(result.totalHits / GALLERY_PAGE_SIZE), GALLERY_MAX_PAGE);
  return (
    <>
      <GalleryGrid items={result.items} basePath={basePath} />
      <Pagination page={result.page} totalPages={totalPages} basePath={basePath} params={params} />
    </>
  );
}

export interface GalleryCategoryPageProps {
  title: string;
  description: string;
  basePath: string;
  defaultQuery: string;
  placeholder: string;
  suggestions: string[];
  searchParams: Promise<Record<string, string | undefined>>;
  showHeader?: boolean;
  /** Optional content rendered between the header and the search filters. */
  intro?: ReactNode;
}

export async function GalleryCategoryPage({
  title,
  description,
  basePath,
  defaultQuery,
  placeholder,
  suggestions,
  searchParams,
  showHeader = true,
  intro,
}: GalleryCategoryPageProps) {
  const params = await searchParams;
  const q = params.q ?? defaultQuery;
  const page = parseIntParam(params.page, 1, 1, GALLERY_MAX_PAGE);

  return (
    <div>
      {showHeader && <PageHeader title={title} description={description} />}
      {intro}
      <GalleryFilters basePath={basePath} placeholder={placeholder} suggestions={suggestions} />
      <Suspense fallback={<LoadingSkeleton shape="card" />}>
        <GalleryResults q={q} page={page} basePath={basePath} params={params} />
      </Suspense>
    </div>
  );
}
