import { GalleryDetailView } from "@/components/gallery/GalleryDetailView";

export default async function PlanetDetailPage({
  params,
}: {
  params: Promise<{ nasaId: string }>;
}) {
  const { nasaId } = await params;
  return <GalleryDetailView nasaId={nasaId} basePath="/planets?tab=gallery" backLabel="Back to gallery" />;
}
