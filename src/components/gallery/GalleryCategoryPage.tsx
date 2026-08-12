import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { GalleryFilters } from "@/components/gallery/GalleryFilters";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { searchGallery } from "@/lib/nasa/gallery";

async function GalleryResults({ q, page, basePath }: { q: string; page: number; basePath: string }) {
  let items;
  try {
    ({ items } = await searchGallery({ q, page }));
  } catch {
    return <ErrorState message="We couldn't load images from the NASA Image and Video Library." />;
  }
  return <GalleryGrid items={items} basePath={basePath} />;
}

export interface GalleryCategoryPageProps {
  title: string;
  description: string;
  basePath: string;
  defaultQuery: string;
  placeholder: string;
  suggestions: string[];
  searchParams: Promise<{ q?: string; page?: string }>;
  showHeader?: boolean;
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
}: GalleryCategoryPageProps) {
  const params = await searchParams;
  const q = params.q ?? defaultQuery;
  const page = params.page ? Math.max(1, Number.parseInt(params.page, 10) || 1) : 1;

  return (
    <div>
      {showHeader && <PageHeader title={title} description={description} />}
      <GalleryFilters basePath={basePath} placeholder={placeholder} suggestions={suggestions} />
      <Suspense fallback={<LoadingSkeleton shape="card" />}>
        <GalleryResults q={q} page={page} basePath={basePath} />
      </Suspense>
    </div>
  );
}
