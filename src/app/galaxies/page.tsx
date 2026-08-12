import { GalleryCategoryPage } from "@/components/gallery/GalleryCategoryPage";

export default function GalaxiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  return (
    <GalleryCategoryPage
      title="Galaxies"
      description="Search NASA's Image and Video Library for galaxies, nebulae, and deep space imagery."
      basePath="/galaxies"
      defaultQuery="galaxy"
      placeholder="Search galaxies, nebulae, deep space imagery…"
      suggestions={["galaxy", "nebula", "deep space", "spiral galaxy", "star cluster"]}
      searchParams={searchParams}
    />
  );
}
