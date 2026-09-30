import { GalleryDetailView, galleryDetailMetadata } from "@/components/gallery/GalleryDetailView";

export async function generateMetadata({ params }: { params: Promise<{ nasaId: string }> }) {
  return galleryDetailMetadata((await params).nasaId, "Galaxy image");
}

export default async function GalaxyDetailPage({
  params,
}: {
  params: Promise<{ nasaId: string }>;
}) {
  const { nasaId } = await params;
  return <GalleryDetailView nasaId={nasaId} basePath="/galaxies" backLabel="Back to gallery" showGalaxyScene />;
}
