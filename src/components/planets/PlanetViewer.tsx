"use client";

import { OrbitControls, Stars } from "@react-three/drei";
import { SceneCanvas } from "@/components/space3d/SceneCanvas";
import { PlanetBody } from "@/components/space3d/PlanetBody";
import { usePrefersReducedMotion } from "@/components/space3d/hooks";
import { getPlanetAppearance } from "@/lib/space3d/planetAppearance";

const PLANET_RADIUS = 1.4;

export function PlanetViewer({ name }: { name: string }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const appearance = getPlanetAppearance(name);
  const cameraDistance = appearance.rings ? 8.5 : 5;

  return (
    <SceneCanvas
      label={`Rotating 3D model of ${name}, shown with its real axial tilt of ${appearance.axialTiltDeg}°. Drag to rotate and scroll to zoom.`}
      className="h-72 w-full sm:h-80"
      camera={{ position: [0, 0.6, cameraDistance], fov: 40 }}
    >
      <ambientLight intensity={0.06} />
      <directionalLight position={[5, 1.5, 3]} intensity={2.6} />
      <Stars radius={100} depth={40} count={2500} factor={4} fade speed={0} />
      <PlanetBody
        name={name}
        radius={PLANET_RADIUS}
        textureWidth={1024}
        spinRate={prefersReducedMotion ? 0 : 0.15}
      />
      <OrbitControls
        enablePan={false}
        enableDamping
        minDistance={PLANET_RADIUS * 1.8}
        maxDistance={cameraDistance * 2.5}
      />
    </SceneCanvas>
  );
}
