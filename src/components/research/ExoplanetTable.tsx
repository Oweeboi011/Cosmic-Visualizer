import { EmptyState } from "@/components/ui/EmptyState";
import type { ExoplanetItem } from "@/types/nasa";

function formatNumber(value: number | null, fractionDigits = 2): string {
  if (value === null || Number.isNaN(value)) return "—";
  return value.toFixed(fractionDigits);
}

export function ExoplanetTable({ items }: { items: ExoplanetItem[] }) {
  if (items.length === 0) {
    return <EmptyState message="No exoplanets matched this filter." />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-space-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-space-surface text-xs uppercase tracking-wide text-text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Planet</th>
            <th className="px-4 py-3 font-medium">Host Star</th>
            <th className="px-4 py-3 font-medium">Discovered</th>
            <th className="px-4 py-3 font-medium">Method</th>
            <th className="px-4 py-3 font-medium">Radius (Earth)</th>
            <th className="px-4 py-3 font-medium">Mass (Earth)</th>
            <th className="px-4 py-3 font-medium">Orbital Period (days)</th>
            <th className="px-4 py-3 font-medium">Distance (pc)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-space-border">
          {items.map((p) => (
            <tr key={`${p.name}-${p.hostname}`} className="hover:bg-space-surface/60">
              <td className="px-4 py-3 font-medium text-text-primary">{p.name}</td>
              <td className="px-4 py-3 text-text-muted">{p.hostname}</td>
              <td className="px-4 py-3 text-text-muted">{p.discoveryYear ?? "—"}</td>
              <td className="px-4 py-3 text-text-muted">{p.discoveryMethod}</td>
              <td className="px-4 py-3 text-text-muted">{formatNumber(p.radiusEarth)}</td>
              <td className="px-4 py-3 text-text-muted">{formatNumber(p.massEarth)}</td>
              <td className="px-4 py-3 text-text-muted">{formatNumber(p.orbitalPeriodDays, 1)}</td>
              <td className="px-4 py-3 text-text-muted">{formatNumber(p.distanceParsecs, 1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
