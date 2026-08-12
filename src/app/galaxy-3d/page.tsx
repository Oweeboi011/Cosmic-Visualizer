import { PageHeader } from "@/components/layout/PageHeader";
import { GalaxySceneLoader } from "@/components/galaxy3d/GalaxySceneLoader";
import { hashStringToSeed, todayUtcDateString } from "@/lib/galaxy3d/seed";
import { searchGallery } from "@/lib/nasa/gallery";

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
        description="Fly through a 3D field of real, NASA-cataloged galaxy images. Drag to orbit, scroll to zoom, and click a marker to open that galaxy's real detail page. Reseeds daily."
      />
      <GalaxySceneLoader seed={seed} realGalaxies={realGalaxies} />
    </div>
  );
}
