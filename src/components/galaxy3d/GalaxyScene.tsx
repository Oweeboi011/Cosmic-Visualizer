"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { GalaxyParticles, type ClickableStar } from "@/components/galaxy3d/GalaxyParticles";
import { StarInfoModal } from "@/components/galaxy3d/StarInfoModal";
import { getStarCatalogEntry } from "@/lib/galaxy3d/starCatalog";
import type { GalleryItem } from "@/types/nasa";

const FULL_PARTICLE_COUNT = 20000;
const REDUCED_PARTICLE_COUNT = 5000;
const FULL_STAR_COUNT = 80;
const REDUCED_STAR_COUNT = 40;

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

export function GalaxyScene({
  seed,
  realGalaxies,
}: {
  seed?: number;
  realGalaxies?: GalleryItem[];
} = {}) {
  const router = useRouter();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [selectedSyntheticStar, setSelectedSyntheticStar] = useState<{
    id: number;
    label: string;
    searchTerm: string;
  } | null>(null);
  const [lowPerf, setLowPerf] = useState(false);

  const clickableStarCount = prefersReducedMotion
    ? REDUCED_STAR_COUNT
    : lowPerf
      ? REDUCED_STAR_COUNT
      : FULL_STAR_COUNT;
  const particleCount = prefersReducedMotion
    ? REDUCED_PARTICLE_COUNT
    : lowPerf
      ? REDUCED_PARTICLE_COUNT
      : FULL_PARTICLE_COUNT;

  function handleSelectStar(star: ClickableStar) {
    if (star.nasaId) {
      router.push(`/galaxies/${star.nasaId}`);
    } else if (star.searchTerm) {
      setSelectedSyntheticStar({ id: star.id, label: star.label, searchTerm: star.searchTerm });
    }
  }

  const fallbackStars: ClickableStar[] = realGalaxies
    ? realGalaxies
        .slice(0, 12)
        .map((item) => ({ id: 0, label: item.title, nasaId: item.nasaId }))
    : Array.from({ length: 12 }, (_, i) => {
        const entry = getStarCatalogEntry(i * 7);
        return { id: entry.id, label: entry.label, searchTerm: entry.searchTerm };
      });

  return (
    <div>
      <div
        className="h-[75vh] w-full overflow-hidden rounded-xl border border-space-border bg-black"
        tabIndex={0}
        aria-label="Interactive 3D spiral galaxy visualization. Drag to orbit, scroll to zoom, click a star to view related NASA imagery."
      >
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 8, 22], fov: 60, near: 0.1, far: 200 }}
        >
          <PerformanceMonitor onDecline={() => setLowPerf(true)} />
          <AdaptiveDpr pixelated />
          <ambientLight intensity={0.4} />
          <GalaxyParticles
            particleCount={particleCount}
            clickableStarCount={clickableStarCount}
            seed={seed}
            realGalaxies={realGalaxies}
            animate={!prefersReducedMotion}
            onSelectStar={handleSelectStar}
          />
          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            minDistance={4}
            maxDistance={60}
            autoRotate={false}
          />
        </Canvas>
      </div>

      <div className="mt-6">
        <h2 className="mb-2 text-sm font-medium text-text-primary">
          Browse featured objects
        </h2>
        <p className="mb-3 text-xs text-text-muted">
          Can&apos;t use the 3D view? These links surface the same NASA imagery as the
          clickable stars above.
        </p>
        <ul className="flex flex-wrap gap-2">
          {fallbackStars.map((star, i) => (
            <li key={star.nasaId ?? star.id ?? i}>
              <button
                type="button"
                onClick={() => handleSelectStar(star)}
                className="rounded-full border border-space-border px-3 py-1 text-xs text-text-muted transition-colors hover:border-nebula-primary/50 hover:text-text-primary"
              >
                {star.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {selectedSyntheticStar && (
        <StarInfoModal
          key={selectedSyntheticStar.id}
          star={selectedSyntheticStar}
          onClose={() => setSelectedSyntheticStar(null)}
        />
      )}
    </div>
  );
}
