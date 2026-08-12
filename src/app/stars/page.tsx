import { GalleryCategoryPage } from "@/components/gallery/GalleryCategoryPage";

export default function StarsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  return (
    <GalleryCategoryPage
      title="Stars"
      description="Search NASA's Image and Video Library for stars, star clusters, and stellar phenomena."
      basePath="/stars"
      defaultQuery="star"
      placeholder="Search stars, star clusters, supernovae…"
      suggestions={["star", "star cluster", "supernova", "binary star", "star formation"]}
      searchParams={searchParams}
    />
  );
}
