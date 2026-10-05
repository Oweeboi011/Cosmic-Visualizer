import { GalleryDetailView, galleryDetailMetadata } from "@/components/gallery/GalleryDetailView";

export async function generateMetadata({ params }: { params: Promise<{ nasaId: string }> }) {
  return galleryDetailMetadata((await params).nasaId, "Planet image");
}

export default async function PlanetDetailPage({
  params,
}: {
  params: Promise<{ nasaId: string }>;
}) {
  const { nasaId } = await params;
  return <GalleryDetailView nasaId={nasaId} basePath="/planets?tab=gallery" backLabel="Back to gallery" />;
}
