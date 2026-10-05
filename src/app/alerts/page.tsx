import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { AlertFilterBar } from "@/components/alerts/AlertFilterBar";
import { AlertTimeline } from "@/components/alerts/AlertTimeline";
import { NeoWidget } from "@/components/alerts/NeoWidget";
import { ErrorState } from "@/components/ui/ErrorState";
import { getAlerts } from "@/lib/nasa/donki";
import { getNeos } from "@/lib/nasa/neows";

export const metadata: Metadata = { title: "Cosmic Alerts" };

export default async function AlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;

  const [alertsResult, neosResult] = await Promise.allSettled([
    getAlerts({ type: params.type }),
    getNeos(),
  ]);

  return (
    <div>
      <PageHeader
        title="Cosmic Alerts"
        description="Real-time space weather notifications from NASA's DONKI system, plus near-earth object close approaches."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AlertFilterBar />
          {alertsResult.status === "fulfilled" ? (
            <AlertTimeline items={alertsResult.value} />
          ) : (
            <ErrorState message="We couldn't load space weather notifications right now." />
          )}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-text-primary">
            Close approaches this week
          </h2>
          {neosResult.status === "fulfilled" ? (
            <NeoWidget items={neosResult.value} />
          ) : (
            <ErrorState message="We couldn't load near-earth object data right now." />
          )}
        </div>
      </div>
    </div>
  );
}
