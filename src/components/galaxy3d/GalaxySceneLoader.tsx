"use client";

import dynamic from "next/dynamic";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import type { GalleryItem } from "@/types/nasa";

const GalaxyScene = dynamic(
  () => import("@/components/galaxy3d/GalaxyScene").then((mod) => mod.GalaxyScene),
  { ssr: false, loading: () => <LoadingSkeleton shape="hero" /> }
);

export function GalaxySceneLoader({
  seed,
  realGalaxies,
  compact,
}: {
  seed?: number;
  realGalaxies?: GalleryItem[];
  compact?: boolean;
} = {}) {
  return <GalaxyScene seed={seed} realGalaxies={realGalaxies} compact={compact} />;
}
