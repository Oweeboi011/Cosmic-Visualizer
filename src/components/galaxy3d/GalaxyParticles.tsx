"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Instances, Instance } from "@react-three/drei";
import type { Group } from "three";
import { generateSpiralGalaxy } from "@/lib/galaxy3d/generateSpiralGalaxy";
import { getStarCatalogEntry } from "@/lib/galaxy3d/starCatalog";
import type { GalleryItem } from "@/types/nasa";

export interface ClickableStar {
  id: number;
  label: string;
  /** Present when this marker represents a real cataloged galaxy image. */
  nasaId?: string;
  /** Present for synthetic/decorative markers, used to search NASA imagery. */
  searchTerm?: string;
}

export function GalaxyParticles({
  particleCount,
  clickableStarCount,
  seed,
  animate,
  realGalaxies,
  onSelectStar,
}: {
  particleCount: number;
  clickableStarCount: number;
  seed?: number;
  animate: boolean;
  realGalaxies?: GalleryItem[];
  onSelectStar: (star: ClickableStar) => void;
}) {
  const groupRef = useRef<Group>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const effectiveClickableCount = realGalaxies
    ? Math.min(realGalaxies.length, clickableStarCount)
    : clickableStarCount;

  const { positions, colors, clickableIndices } = useMemo(
    () => generateSpiralGalaxy({ particleCount, clickableStarCount: effectiveClickableCount, seed }),
    [particleCount, effectiveClickableCount, seed]
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

  return (
    <group ref={groupRef}>
      <Points positions={positions} colors={colors} stride={3}>
        <PointMaterial
          transparent
          vertexColors
          size={0.06}
          sizeAttenuation
          depthWrite={false}
          opacity={0.85}
        />
      </Points>
      <Instances limit={clickableStars.length}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshBasicMaterial color="#fff7d6" />
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
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              setHoveredId(null);
              document.body.style.cursor = "auto";
            }}
          />
        ))}
      </Instances>
    </group>
  );
}
