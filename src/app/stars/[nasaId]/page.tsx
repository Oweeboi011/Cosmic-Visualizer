import type { Metadata } from "next";
import { GalleryDetailView } from "@/components/gallery/GalleryDetailView";

export const metadata: Metadata = { title: "Star image" };

export default async function StarDetailPage({
  params,
}: {
  params: Promise<{ nasaId: string }>;
}) {
  const { nasaId } = await params;
  return <GalleryDetailView nasaId={nasaId} basePath="/stars" backLabel="Back to gallery" />;
}
