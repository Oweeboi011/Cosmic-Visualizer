"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { SceneCanvas } from "@/components/space3d/SceneCanvas";
import { usePrefersReducedMotion } from "@/components/space3d/hooks";
import { getGlowTexture } from "@/components/space3d/textures";
import {
  STELLAR_CLASSES,
  starDisplayRadius,
  type SpectralClass,
  type StellarClassInfo,
} from "@/lib/space3d/stellarClasses";

const STAR_VERTEX = /* glsl */ `
varying vec3 vPos;
varying vec3 vNormal;
void main() {
  vPos = position;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

// Animated granulation + starspots + limb darkening, all procedural on the GPU.
const STAR_FRAGMENT = /* glsl */ `
uniform float uTime;
uniform vec3 uColor;
varying vec3 vPos;
varying vec3 vNormal;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x),
        mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
        mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}

float fbm(vec3 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    sum += amp * noise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return sum;
}

void main() {
  vec3 p = normalize(vPos);
  float cells = fbm(p * 7.0 + vec3(uTime * 0.04));
  float spots = fbm(p * 2.2 - vec3(uTime * 0.012));
  float mu = clamp(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
  float limb = 0.3 + 0.7 * pow(mu, 0.45);

  float lum = dot(uColor, vec3(0.299, 0.587, 0.114));
  vec3 col = clamp(mix(vec3(lum), uColor, 1.8), 0.0, 1.0);
  col *= (0.7 + 0.7 * cells) * limb;
  col *= 1.0 - smoothstep(0.66, 0.74, spots) * 0.22;

  gl_FragColor = vec4(col * 1.35, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

function StarModel({ info, animate }: { info: StellarClassInfo; animate: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [uniforms] = useState(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(info.color) },
  }));
  const targetScale = starDisplayRadius(info.typicalRadiusSolar);

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (material) {
      if (animate) material.uniforms.uTime.value += delta;
      material.uniforms.uColor.value.set(info.color);
    }
    const group = groupRef.current;
    if (!group) return;
    // Ease toward the new size when switching class (snap if motion is reduced).
    const next = animate ? THREE.MathUtils.damp(group.scale.x, targetScale, 4, delta) : targetScale;
    group.scale.setScalar(next);
    if (animate) group.rotation.y += delta * 0.04;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[1, 96, 48]} />
        <shaderMaterial ref={materialRef} vertexShader={STAR_VERTEX} fragmentShader={STAR_FRAGMENT} uniforms={uniforms} />
      </mesh>
      {/* Corona: the glow texture peaks at its center, which the sphere hides, so the
          sprites are sized to keep a bright falloff just past the limb. */}
      <sprite scale={[5, 5, 1]}>
        <spriteMaterial
          map={getGlowTexture()}
          color={info.color}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          transparent
        />
      </sprite>
      <sprite scale={[10, 10, 1]}>
        <spriteMaterial
          map={getGlowTexture()}
          color={info.color}
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          transparent
        />
      </sprite>
    </group>
  );
}

export function StarViewer() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [selected, setSelected] = useState<SpectralClass>("G");
  const info = STELLAR_CLASSES.find((c) => c.spectralClass === selected) ?? STELLAR_CLASSES[4];

  return (
    <section className="mb-10 grid gap-6 lg:grid-cols-[1fr_320px]" aria-labelledby="star-viewer-heading">
      <SceneCanvas
        label={`Animated 3D model of a ${info.spectralClass}-type star, colored by its surface temperature. Drag to rotate and scroll to zoom.`}
        className="h-96 w-full lg:h-[460px]"
        camera={{ position: [0, 0, 22], fov: 45 }}
      >
        <Stars radius={120} depth={50} count={3000} factor={4} fade speed={0} />
        <StarModel info={info} animate={!prefersReducedMotion} />
        <OrbitControls enablePan={false} enableDamping minDistance={8} maxDistance={50} />
      </SceneCanvas>

      <div>
        <h2 id="star-viewer-heading" className="text-sm font-semibold text-text-primary">
          Star types in 3D
        </h2>
        <p className="mt-1 text-xs text-text-muted">
          Pick a spectral class. Hotter stars glow blue, cooler stars red. Sizes are log-compressed.
        </p>

        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Spectral class">
          {STELLAR_CLASSES.map((c) => (
            <button
              key={c.spectralClass}
              type="button"
              aria-pressed={c.spectralClass === selected}
              onClick={() => setSelected(c.spectralClass)}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
                c.spectralClass === selected
                  ? "border-nebula-primary bg-nebula-primary/20 text-text-primary"
                  : "border-space-border text-text-muted hover:text-text-primary"
              }`}
            >
              <span className="sr-only">Class </span>
              <span style={{ color: c.color }}>{c.spectralClass}</span>
            </button>
          ))}
        </div>

        <h3 className="mt-5 text-base font-semibold text-text-primary">{info.spectralClass}-type star</h3>
        <p className="mt-1 text-sm text-text-muted">{info.description}</p>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-text-muted">Surface temperature</dt>
            <dd className="text-text-primary">{info.temperatureK}</dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted">Mass (Suns)</dt>
            <dd className="text-text-primary">{info.massSolar}</dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted">Radius (Suns)</dt>
            <dd className="text-text-primary">{info.radiusSolar}</dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted">Example</dt>
            <dd className="text-text-primary">{info.example}</dd>
          </div>
        </dl>

        <Link
          href={`/stars?q=${encodeURIComponent(info.searchTerm)}`}
          scroll={false}
          className="mt-4 inline-block text-sm font-medium text-nebula-secondary hover:underline"
        >
          Search NASA imagery for “{info.searchTerm}”
        </Link>
      </div>
    </section>
  );
}
