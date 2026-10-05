"use client";

import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { PlanetViewerLoader } from "@/components/space3d/SceneLoaders";
import { getPlanetAppearance } from "@/lib/space3d/planetAppearance";
import type { SolarSystemPlanet } from "@/types/nasa";

export function SolarSystemPlanetModal({
  planet,
  onClose,
}: {
  planet: SolarSystemPlanet;
  onClose: () => void;
}) {
  const { axialTiltDeg } = getPlanetAppearance(planet.name);

  return (
    <Modal title={planet.name} onClose={onClose}>
      <div className="flex flex-col gap-6">
        <Badge tone="neutral">{planet.type}</Badge>

        <PlanetViewerLoader name={planet.name} />

        <section>
          <h3 className="mb-1 text-sm font-semibold text-text-primary">Overview</h3>
          <p className="text-sm text-text-muted">{planet.description}</p>
        </section>

        <section className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-5">
          <div>
            <p className="text-xs text-text-muted">Diameter</p>
            <p className="text-text-primary">{planet.diameterKm.toLocaleString()} km</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Distance from Sun</p>
            <p className="text-text-primary">{planet.distanceFromSunAu} AU</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Orbital period</p>
            <p className="text-text-primary">{planet.orbitalPeriodDays.toLocaleString()} days</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Day length</p>
            <p className="text-text-primary">{planet.dayLengthHours.toLocaleString()} hrs</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Axial tilt</p>
            <p className="text-text-primary">{axialTiltDeg}°</p>
          </div>
        </section>

        <section>
          <h3 className="mb-1 text-sm font-semibold text-text-primary">Fun fact</h3>
          <p className="text-sm text-text-muted">{planet.funFact}</p>
        </section>

        <Link
          href={`/planets?tab=gallery&q=${encodeURIComponent(planet.name)}`}
          className="text-sm font-medium text-nebula-secondary hover:underline"
        >
          Browse real NASA imagery of {planet.name}
        </Link>
      </div>
    </Modal>
  );
}
