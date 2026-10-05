"use client";

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line, OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { Pause, Play, RotateCcw } from "lucide-react";
import { SceneCanvas } from "@/components/space3d/SceneCanvas";
import { PlanetBody } from "@/components/space3d/PlanetBody";
import { useHoverCursor, usePrefersReducedMotion } from "@/components/space3d/hooks";
import { getGlowTexture, useProceduralTexture } from "@/components/space3d/textures";
import {
  PLANET_ORBITS,
  dateFromDaysSinceJ2000,
  daysSinceJ2000,
  getPlanetAppearance,
  meanLongitudeRad,
  orbitDisplayRadius,
  planetDisplayRadius,
} from "@/lib/space3d/planetAppearance";
import type { SolarSystemPlanet } from "@/types/nasa";

const SPEEDS = [
  { daysPerSecond: 1, label: "1 day / sec" },
  { daysPerSecond: 7, label: "1 week / sec" },
  { daysPerSecond: 30, label: "1 month / sec" },
  { daysPerSecond: 365, label: "1 year / sec" },
];

/** Cap on visual spin so fast-forwarded gas giants don't strobe. */
const MAX_SPIN_RAD_PER_SEC = 2;
const SUN_RADIUS = 4;

type DaysRef = MutableRefObject<number>;

function SimulationClock({ daysRef, playing, speed }: { daysRef: DaysRef; playing: boolean; speed: number }) {
  useFrame((_, delta) => {
    // Clamp delta so returning to a backgrounded tab doesn't jump years ahead.
    if (playing) daysRef.current += Math.min(delta, 0.1) * speed;
  });
  return null;
}

const SUN_TEXTURE = { type: "sun", width: 512 } as const;

function Sun() {
  const ref = useRef<THREE.Mesh>(null);
  const map = useProceduralTexture(SUN_TEXTURE);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.05;
  });

  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[SUN_RADIUS, 64, 32]} />
        <meshBasicMaterial
          key={map ? "textured" : "placeholder"}
          map={map}
          color={map ? "#ffffff" : "#ffb347"}
          toneMapped={false}
        />
      </mesh>
      <sprite scale={[SUN_RADIUS * 5, SUN_RADIUS * 5, 1]}>
        <spriteMaterial
          map={getGlowTexture()}
          color="#ffb347"
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          transparent
        />
      </sprite>
      <pointLight intensity={3.2} decay={0} distance={0} />
    </group>
  );
}

function OrbitPath({ radius, highlighted }: { radius: number; highlighted: boolean }) {
  const points = useMemo(
    () =>
      Array.from({ length: 129 }, (_, i) => {
        const a = (i / 128) * Math.PI * 2;
        return [Math.cos(a) * radius, 0, Math.sin(a) * radius] as [number, number, number];
      }),
    [radius]
  );
  return (
    <Line
      points={points}
      color={highlighted ? "#7c5cff" : "#3a4266"}
      lineWidth={highlighted ? 1.6 : 1}
      transparent
      opacity={highlighted ? 0.9 : 0.55}
    />
  );
}

function OrbitingPlanet({
  planet,
  daysRef,
  playing,
  speed,
  showLabel,
  onSelect,
}: {
  planet: SolarSystemPlanet;
  daysRef: DaysRef;
  playing: boolean;
  speed: number;
  showLabel: boolean;
  onSelect: (name: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  useHoverCursor(hovered);

  const orbit = PLANET_ORBITS[planet.name];
  const distance = orbitDisplayRadius(orbit.semiMajorAxisAu);
  const radius = planetDisplayRadius(planet.diameterKm);
  const appearance = getPlanetAppearance(planet.name);
  const spinRate = playing
    ? Math.min((Math.PI * 2 * speed * 24) / appearance.siderealRotationHours, MAX_SPIN_RAD_PER_SEC)
    : 0;

  useFrame(() => {
    if (!groupRef.current) return;
    const longitude = meanLongitudeRad(orbit, daysRef.current);
    // Counter-clockwise when viewed from above the ecliptic's north pole (+y).
    groupRef.current.position.set(Math.cos(longitude) * distance, 0, -Math.sin(longitude) * distance);
  });

  const labelHeight = radius * (appearance.rings ? 1.4 : 1) + 0.7;

  return (
    <>
      <OrbitPath radius={distance} highlighted={hovered} />
      <group ref={groupRef}>
        <PlanetBody
          name={planet.name}
          radius={radius}
          textureWidth={256}
          spinRate={spinRate}
          interactive
          onClick={() => onSelect(planet.name)}
          onHoverChange={setHovered}
        />
        {(showLabel || hovered) && (
          <Html
            position={[0, labelHeight, 0]}
            center
            // Keep labels below the sticky navbar (z-40) and modals (z-50).
            zIndexRange={[30, 0]}
            style={{ pointerEvents: "none" }}
          >
            <span
              className={`whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-medium ${
                hovered ? "bg-nebula-primary text-white" : "bg-black/60 text-text-primary"
              }`}
            >
              {planet.name}
            </span>
          </Html>
        )}
      </group>
    </>
  );
}

export function SolarSystemScene({
  planets,
  onSelectPlanet,
}: {
  planets: SolarSystemPlanet[];
  onSelectPlanet: (name: string) => void;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [playing, setPlaying] = useState(!prefersReducedMotion);
  const [speed, setSpeed] = useState(SPEEDS[1].daysPerSecond);
  const [showLabels, setShowLabels] = useState(true);
  const [initialDays] = useState(() => daysSinceJ2000(new Date()));
  const daysRef = useRef(initialDays);
  const [displayDate, setDisplayDate] = useState(() => dateFromDaysSinceJ2000(initialDays));

  useEffect(() => {
    const id = window.setInterval(() => setDisplayDate(dateFromDaysSinceJ2000(daysRef.current)), 250);
    return () => window.clearInterval(id);
  }, []);

  const orbitingPlanets = planets.filter((p) => PLANET_ORBITS[p.name]);

  return (
    <div className="mb-8">
      <SceneCanvas
        label="Interactive 3D model of the Solar System. Planets start at their real positions for today and orbit the Sun. Drag to rotate, scroll to zoom, and click a planet for details."
        className="h-[60vh] min-h-80 w-full"
        camera={{ position: [0, 42, 70], fov: 45, near: 0.1, far: 1000 }}
        overlay={
          // z-[31] keeps controls above the planet labels (zIndexRange 30).
          <div className="absolute inset-x-0 bottom-0 z-[31] flex flex-wrap items-center gap-3 bg-gradient-to-t from-black/85 to-transparent px-3 pb-3 pt-8 text-sm">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="inline-flex items-center gap-1.5 rounded-full border border-space-border bg-black/60 px-3 py-1 text-text-primary transition-colors hover:border-nebula-primary/60"
            >
              {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              {playing ? "Pause" : "Play"}
            </button>
            <label className="inline-flex items-center gap-2 text-text-muted">
              Speed
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="rounded-md border border-space-border bg-space-surface px-2 py-1 text-text-primary"
              >
                {SPEEDS.map((s) => (
                  <option key={s.daysPerSecond} value={s.daysPerSecond}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => {
                daysRef.current = daysSinceJ2000(new Date());
                setDisplayDate(new Date());
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-space-border bg-black/60 px-3 py-1 text-text-primary transition-colors hover:border-nebula-primary/60"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Today
            </button>
            <label className="inline-flex items-center gap-2 text-text-muted">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="accent-nebula-primary"
              />
              Labels
            </label>
            <p className="text-text-muted sm:ml-auto" aria-live="off">
              Simulated date:{" "}
              <time dateTime={displayDate.toISOString()} className="font-mono text-text-primary">
                {displayDate.toISOString().slice(0, 10)}
              </time>
            </p>
          </div>
        }
      >
        <SimulationClock daysRef={daysRef} playing={playing} speed={speed} />
        <ambientLight intensity={0.12} />
        <Stars radius={300} depth={80} count={4000} factor={5} fade speed={prefersReducedMotion ? 0 : 0.5} />
        <Sun />
        {orbitingPlanets.map((planet) => (
          <OrbitingPlanet
            key={planet.name}
            planet={planet}
            daysRef={daysRef}
            playing={playing}
            speed={speed}
            showLabel={showLabels}
            onSelect={onSelectPlanet}
          />
        ))}
        <OrbitControls enableDamping dampingFactor={0.08} minDistance={8} maxDistance={180} />
      </SceneCanvas>

      <p className="mt-2 text-xs text-text-muted">
        Planet positions come from real orbital periods (circular-orbit approximation). Distances and
        sizes are compressed so every planet fits on screen.
      </p>
    </div>
  );
}
