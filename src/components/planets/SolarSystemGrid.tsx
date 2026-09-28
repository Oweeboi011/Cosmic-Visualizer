"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SolarSystemPlanetModal } from "@/components/planets/SolarSystemPlanetModal";
import { SolarSystemSceneLoader } from "@/components/space3d/SceneLoaders";
import type { SolarSystemPlanet } from "@/types/nasa";

export function SolarSystemGrid({ planets }: { planets: SolarSystemPlanet[] }) {
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const selected = planets.find((p) => p.name === selectedName) ?? null;

  return (
    <div>
      <SolarSystemSceneLoader planets={planets} onSelectPlanet={setSelectedName} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {planets.map((planet) => (
          <button
            key={planet.name}
            type="button"
            onClick={() => setSelectedName(planet.name)}
            className="text-left"
          >
            <Card className="h-full p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-text-primary">{planet.name}</h3>
              </div>
              <Badge tone="neutral">{planet.type}</Badge>
              <p className="mt-2 line-clamp-3 text-sm text-text-muted">{planet.description}</p>
              <p className="mt-3 text-xs text-text-muted">
                {planet.distanceFromSunAu} AU from the Sun · {planet.moons} moon
                {planet.moons === 1 ? "" : "s"}
              </p>
            </Card>
          </button>
        ))}
      </div>

      {selected && (
        <SolarSystemPlanetModal
          key={selected.name}
          planet={selected}
          onClose={() => setSelectedName(null)}
        />
      )}
    </div>
  );
}
