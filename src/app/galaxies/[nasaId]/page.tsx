import type { Metadata } from "next";
import { GalleryDetailView } from "@/components/gallery/GalleryDetailView";

export const metadata: Metadata = { title: "Galaxy image" };

export default async function GalaxyDetailPage({
  params,
}: {
  params: Promise<{ nasaId: string }>;
}) {
  const { nasaId } = await params;
  return <GalleryDetailView nasaId={nasaId} basePath="/galaxies" backLabel="Back to gallery" showGalaxyScene />;
}
