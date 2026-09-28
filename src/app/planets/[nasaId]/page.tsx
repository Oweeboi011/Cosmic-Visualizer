import type { Metadata } from "next";
import { GalleryDetailView } from "@/components/gallery/GalleryDetailView";

export const metadata: Metadata = { title: "Planet image" };

export default async function PlanetDetailPage({
  params,
}: {
  params: Promise<{ nasaId: string }>;
}) {
  const { nasaId } = await params;
  return <GalleryDetailView nasaId={nasaId} basePath="/planets?tab=gallery" backLabel="Back to gallery" />;
}
