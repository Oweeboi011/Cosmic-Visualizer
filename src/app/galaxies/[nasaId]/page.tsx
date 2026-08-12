import { GalleryDetailView } from "@/components/gallery/GalleryDetailView";

export default async function GalaxyDetailPage({
  params,
}: {
  params: Promise<{ nasaId: string }>;
}) {
  const { nasaId } = await params;
  return <GalleryDetailView nasaId={nasaId} basePath="/galaxies" backLabel="Back to gallery" />;
}
