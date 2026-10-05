import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { GalaxySceneLoader } from "@/components/galaxy3d/GalaxySceneLoader";
import { hashStringToSeed, todayUtcDateString } from "@/lib/galaxy3d/seed";
import { searchGallery } from "@/lib/nasa/gallery";

export const metadata: Metadata = { title: "3D Galaxy" };

export default async function Galaxy3dPage() {
  const seed = hashStringToSeed(todayUtcDateString());

  let realGalaxies;
  try {
    const { items } = await searchGallery({ q: "galaxy", page: 1 });
    realGalaxies = items;
  } catch {
    realGalaxies = undefined;
  }

  return (
    <div>
      <PageHeader
        title="3D Galaxy"
        description="Fly around the four main galaxy types in 3D. Drag to orbit, scroll to zoom, and click a bright marker to open a real NASA-cataloged galaxy image. Reseeds daily."
      />
      <GalaxySceneLoader seed={seed} realGalaxies={realGalaxies} />
    </div>
  );
}
