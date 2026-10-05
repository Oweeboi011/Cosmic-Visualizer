import type { Metadata } from "next";
import { GalleryCategoryPage } from "@/components/gallery/GalleryCategoryPage";
import { StarViewerLoader } from "@/components/space3d/SceneLoaders";

export const metadata: Metadata = { title: "Stars" };

export default function StarsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  return (
    <GalleryCategoryPage
      title="Stars"
      description="Explore the stellar spectral classes in 3D, then search NASA's Image and Video Library for stars, star clusters, and stellar phenomena."
      basePath="/stars"
      defaultQuery="star"
      placeholder="Search stars, star clusters, supernovae…"
      suggestions={["star", "star cluster", "supernova", "binary star", "star formation"]}
      searchParams={searchParams}
      intro={<StarViewerLoader />}
    />
  );
}
