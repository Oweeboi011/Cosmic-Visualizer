"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { getPlanetAppearance, type RingKind } from "@/lib/space3d/planetAppearance";
import { getRingTexture, useProceduralTexture } from "@/components/space3d/textures";

const ATMOSPHERE_VERTEX = /* glsl */ `
varying vec3 vNormal;
void main() {
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

// Rendered on the back faces of a slightly larger shell: brightest just outside the
// planet's limb, fading to nothing at the shell edge.
const ATMOSPHERE_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
varying vec3 vNormal;
void main() {
  float rim = pow(clamp(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 4.0);
  gl_FragColor = vec4(uColor * rim * uIntensity, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const PLACEHOLDER_COLOR = "#4a4f5c";

function Atmosphere({ radius, color, intensity }: { radius: number; color: string; intensity: number }) {
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color(color) }, uIntensity: { value: intensity } }),
    [color, intensity]
  );

  return (
    <mesh scale={1.08}>
      <sphereGeometry args={[radius, 48, 24]} />
      <shaderMaterial
        vertexShader={ATMOSPHERE_VERTEX}
        fragmentShader={ATMOSPHERE_FRAGMENT}
        uniforms={uniforms}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

function Rings({
  kind,
  innerRadius,
  outerRadius,
}: {
  kind: RingKind;
  innerRadius: number;
  outerRadius: number;
}) {
  // RingGeometry's default UVs are planar; remap so u runs radially inner→outer and
  // the 1-D band texture wraps around the ring.
  const geometry = useMemo(() => {
    const g = new THREE.RingGeometry(innerRadius, outerRadius, 160, 1);
    const pos = g.attributes.position;
    const uv = g.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const r = Math.hypot(pos.getX(i), pos.getY(i));
      uv.setXY(i, (r - innerRadius) / (outerRadius - innerRadius), 0.5);
    }
    return g;
  }, [innerRadius, outerRadius]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial
        map={getRingTexture(kind)}
        side={THREE.DoubleSide}
        transparent
        depthWrite={false}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}

export function PlanetBody({
  name,
  radius,
  textureWidth,
  spinRate,
  interactive = false,
  onClick,
  onHoverChange,
}: {
  name: string;
  radius: number;
  textureWidth: number;
  /** Visual spin in radians per second. */
  spinRate: number;
  interactive?: boolean;
  onClick?: () => void;
  onHoverChange?: (hovered: boolean) => void;
}) {
  const appearance = getPlanetAppearance(name);
  const surfaceRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  // Generated in a worker; until then the surface is a plain placeholder and clouds are off.
  const map = useProceduralTexture({ type: "planet", kind: appearance.surface, width: textureWidth });
  const cloudMap = useProceduralTexture(appearance.clouds ? { type: "clouds", width: textureWidth } : null);

  useFrame((_, delta) => {
    if (surfaceRef.current) surfaceRef.current.rotation.y += spinRate * delta;
    if (cloudsRef.current) cloudsRef.current.rotation.y += spinRate * 1.15 * delta;
  });

  const handlers = interactive
    ? {
        onClick: (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onClick?.();
        },
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onHoverChange?.(true);
        },
        onPointerOut: () => onHoverChange?.(false),
      }
    : {};

  return (
    // Tilt toward the default camera (about x) so rings open up rather than sit edge-on.
    <group rotation={[THREE.MathUtils.degToRad(appearance.axialTiltDeg), 0, 0]} {...handlers}>
      <mesh ref={surfaceRef}>
        <sphereGeometry args={[radius, 64, 32]} />
        {/* Keyed so three.js compiles a textured program once the map arrives. */}
        <meshStandardMaterial
          key={map ? "textured" : "placeholder"}
          map={map}
          color={map ? "#ffffff" : PLACEHOLDER_COLOR}
          roughness={0.95}
          metalness={0}
        />
      </mesh>

      {cloudMap && (
        <mesh ref={cloudsRef} scale={1.015}>
          <sphereGeometry args={[radius, 64, 32]} />
          <meshStandardMaterial map={cloudMap} transparent depthWrite={false} roughness={1} />
        </mesh>
      )}

      {appearance.atmosphere && (
        <Atmosphere
          radius={radius}
          color={appearance.atmosphere.color}
          intensity={appearance.atmosphere.intensity}
        />
      )}

      {appearance.rings && (
        <Rings
          kind={appearance.rings.kind}
          innerRadius={radius * appearance.rings.innerRadius}
          outerRadius={radius * appearance.rings.outerRadius}
        />
      )}

      {interactive && (
        // Generous invisible hit target so small, distant planets are easy to click.
        <mesh>
          <sphereGeometry args={[Math.max(radius * 1.6, 1.2), 16, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
