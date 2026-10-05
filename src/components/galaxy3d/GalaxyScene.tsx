"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useThree } from "@react-three/fiber";
import { OrbitControls, AdaptiveDpr, PerformanceMonitor, Stars } from "@react-three/drei";
import { RotateCcw } from "lucide-react";
import * as THREE from "three";
import { GalaxyParticles, type ClickableStar } from "@/components/galaxy3d/GalaxyParticles";
import { StarInfoModal } from "@/components/galaxy3d/StarInfoModal";
import { SceneCanvas } from "@/components/space3d/SceneCanvas";
import { usePrefersReducedMotion } from "@/components/space3d/hooks";
import { getStarCatalogEntry } from "@/lib/galaxy3d/starCatalog";
import { GALAXY_MORPHOLOGIES, type GalaxyMorphology } from "@/lib/galaxy3d/generateGalaxy";
import type { GalleryItem } from "@/types/nasa";

const FULL_PARTICLE_COUNT = 20000;
const REDUCED_PARTICLE_COUNT = 5000;
const FULL_STAR_COUNT = 80;
const REDUCED_STAR_COUNT = 40;

const CAMERA_FOV = 60;
/** Default viewing direction: slightly above the disk so the arms read clearly. */
const CAMERA_DIRECTION = new THREE.Vector3(0, 8, 22).normalize();
const MIN_FIT_DISTANCE = 23.4;
/** Spiral disk radius is 14; the margin covers perspective widening of the near rim. */
const GALAXY_FIT_RADIUS = 18;

/**
 * Frames the whole galaxy on mount and whenever `resetKey` changes. Wide viewports
 * use the default distance; narrow/portrait ones back off until the disk fits
 * horizontally.
 */
function CameraRig({ resetKey }: { resetKey: number }) {
  const camera = useThree((s) => s.camera);
  // Populated by <OrbitControls makeDefault />.
  const controls = useThree((s) => s.controls) as unknown as { target: THREE.Vector3; update: () => void } | null;
  const size = useThree((s) => s.size);

  useEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const halfHFov = Math.atan(Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2)) * aspect);
    const distance = Math.max(MIN_FIT_DISTANCE, GALAXY_FIT_RADIUS / Math.tan(halfHFov));
    camera.position.copy(CAMERA_DIRECTION).multiplyScalar(distance);
    camera.lookAt(0, 0, 0);
    if (controls) {
      controls.target.set(0, 0, 0);
      controls.update();
    }
    // Deliberately not refitting on every resize, which would undo the user's orbiting.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, controls, camera]);

  return null;
}

export function GalaxyScene({
  seed,
  realGalaxies,
  compact = false,
}: {
  seed?: number;
  realGalaxies?: GalleryItem[];
  /** Embedded use (e.g. in a modal): shorter canvas, no description or featured list. */
  compact?: boolean;
} = {}) {
  const router = useRouter();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [morphology, setMorphology] = useState<GalaxyMorphology>("spiral");
  const [selectedSyntheticStar, setSelectedSyntheticStar] = useState<{
    id: number;
    label: string;
    searchTerm: string;
  } | null>(null);
  const [lowPerf, setLowPerf] = useState(false);
  const [viewResetKey, setViewResetKey] = useState(0);

  const reduced = prefersReducedMotion || lowPerf;
  const clickableStarCount = reduced ? REDUCED_STAR_COUNT : FULL_STAR_COUNT;
  const particleCount = reduced ? REDUCED_PARTICLE_COUNT : FULL_PARTICLE_COUNT;
  const morphologyInfo = GALAXY_MORPHOLOGIES.find((m) => m.key === morphology) ?? GALAXY_MORPHOLOGIES[0];

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
      {!compact && (
        <p className="mb-3 text-sm text-text-muted">
          <span className="font-medium text-text-primary">
            {morphologyInfo.label} ({morphologyInfo.hubbleClass}):
          </span>{" "}
          {morphologyInfo.description}
        </p>
      )}

      <SceneCanvas
        label={`Interactive 3D ${morphologyInfo.label.toLowerCase()} galaxy visualization. Drag to orbit, scroll to zoom, click a bright marker to view related NASA imagery.`}
        className={compact ? "h-72 w-full sm:h-80" : "h-[75vh] min-h-96 w-full"}
        camera={{ position: [0, 8, 22], fov: CAMERA_FOV, near: 0.1, far: 400 }}
        overlay={
          // Right padding leaves room for the full-window button.
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[31] flex flex-wrap items-center gap-2 p-3 pr-14">
            <div className="pointer-events-auto flex flex-wrap gap-2" role="group" aria-label="Galaxy type">
              {GALAXY_MORPHOLOGIES.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  aria-pressed={m.key === morphology}
                  onClick={() => setMorphology(m.key)}
                  className={`rounded-full border px-3 py-1 text-sm backdrop-blur transition-colors ${
                    m.key === morphology
                      ? "border-nebula-primary bg-nebula-primary/30 text-text-primary"
                      : "border-space-border bg-black/60 text-text-muted hover:text-text-primary"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setViewResetKey((k) => k + 1)}
              className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-space-border bg-black/60 px-3 py-1 text-sm text-text-muted backdrop-blur transition-colors hover:text-text-primary"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset view
            </button>
          </div>
        }
      >
        <PerformanceMonitor onDecline={() => setLowPerf(true)} />
        <AdaptiveDpr pixelated />
        <ambientLight intensity={0.4} />
        <Stars radius={150} depth={60} count={2500} factor={4} fade speed={0} />
        <GalaxyParticles
          morphology={morphology}
          particleCount={particleCount}
          clickableStarCount={clickableStarCount}
          seed={seed}
          realGalaxies={realGalaxies}
          animate={!prefersReducedMotion}
          onSelectStar={handleSelectStar}
        />
        <CameraRig resetKey={viewResetKey} />
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={4}
          maxDistance={100}
          autoRotate={false}
        />
      </SceneCanvas>

      {!compact && (
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
      )}

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
