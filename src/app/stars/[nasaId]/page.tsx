import { GalleryDetailView } from "@/components/gallery/GalleryDetailView";

export default async function StarDetailPage({
  params,
}: {
  params: Promise<{ nasaId: string }>;
}) {
  const { nasaId } = await params;
  return <GalleryDetailView nasaId={nasaId} basePath="/stars" backLabel="Back to gallery" />;
}
