import { GalleryDetailView, galleryDetailMetadata } from "@/components/gallery/GalleryDetailView";

export async function generateMetadata({ params }: { params: Promise<{ nasaId: string }> }) {
  return galleryDetailMetadata((await params).nasaId, "Star image");
}

export default async function StarDetailPage({
  params,
}: {
  params: Promise<{ nasaId: string }>;
}) {
  const { nasaId } = await params;
  return <GalleryDetailView nasaId={nasaId} basePath="/stars" backLabel="Back to gallery" />;
}
