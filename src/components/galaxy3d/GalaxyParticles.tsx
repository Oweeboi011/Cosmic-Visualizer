"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Instances, Instance } from "@react-three/drei";
import * as THREE from "three";
import { generateGalaxy, type GalaxyMorphology } from "@/lib/galaxy3d/generateGalaxy";
import { getStarCatalogEntry } from "@/lib/galaxy3d/starCatalog";
import { useHoverCursor } from "@/components/space3d/hooks";
import { getGlowTexture } from "@/components/space3d/textures";
import type { GalleryItem } from "@/types/nasa";

export interface ClickableStar {
  id: number;
  label: string;
  /** Present when this marker represents a real cataloged galaxy image. */
  nasaId?: string;
  /** Present for synthetic/decorative markers, used to search NASA imagery. */
  searchTerm?: string;
}

const CORE_GLOW: Record<GalaxyMorphology, { color: string; size: number } | null> = {
  spiral: { color: "#ffe9c4", size: 9 },
  "barred-spiral": { color: "#ffe9c4", size: 10 },
  elliptical: { color: "#ffd9a3", size: 16 },
  irregular: null,
};

export function GalaxyParticles({
  morphology,
  particleCount,
  clickableStarCount,
  seed,
  animate,
  realGalaxies,
  onSelectStar,
}: {
  morphology: GalaxyMorphology;
  particleCount: number;
  clickableStarCount: number;
  seed?: number;
  animate: boolean;
  realGalaxies?: GalleryItem[];
  onSelectStar: (star: ClickableStar) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  useHoverCursor(hoveredId !== null);

  const effectiveClickableCount = realGalaxies
    ? Math.min(realGalaxies.length, clickableStarCount)
    : clickableStarCount;

  const { positions, colors, clickableIndices } = useMemo(
    () =>
      generateGalaxy({
        morphology,
        particleCount,
        clickableStarCount: effectiveClickableCount,
        seed: seed ?? 1337,
      }),
    [morphology, particleCount, effectiveClickableCount, seed]
  );

  const clickableStars = useMemo(
    () =>
      clickableIndices.map((index, i) => {
        let star: ClickableStar;
        if (realGalaxies) {
          star = { id: index, label: realGalaxies[i].title, nasaId: realGalaxies[i].nasaId };
        } else {
          const catalogEntry = getStarCatalogEntry(index);
          star = { id: index, label: catalogEntry.label, searchTerm: catalogEntry.searchTerm };
        }
        return {
          star,
          position: [
            positions[index * 3],
            positions[index * 3 + 1],
            positions[index * 3 + 2],
          ] as [number, number, number],
        };
      }),
    [clickableIndices, positions, realGalaxies]
  );

  useFrame((_, delta) => {
    if (animate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.02;
    }
  });

  const glow = CORE_GLOW[morphology];

  return (
    <group ref={groupRef}>
      {/* Keyed so drei rebuilds the buffer when the particle count changes. */}
      <Points key={`${morphology}-${particleCount}`} positions={positions} colors={colors} stride={3}>
        <PointMaterial
          transparent
          vertexColors
          size={0.07}
          sizeAttenuation
          depthWrite={false}
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      {glow && (
        <sprite scale={[glow.size, glow.size, 1]}>
          <spriteMaterial
            map={getGlowTexture()}
            color={glow.color}
            opacity={0.55}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            transparent
          />
        </sprite>
      )}
      <Instances limit={clickableStars.length}>
        <sphereGeometry args={[0.11, 8, 8]} />
        <meshBasicMaterial color="#ffe7a3" />
        {clickableStars.map(({ star, position }) => (
          <Instance
            key={star.id}
            position={position}
            scale={hoveredId === star.id ? 1.8 : 1}
            onClick={(e) => {
              e.stopPropagation();
              onSelectStar(star);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredId(star.id);
            }}
            onPointerOut={() => setHoveredId(null)}
          />
        ))}
      </Instances>
    </group>
  );
}
