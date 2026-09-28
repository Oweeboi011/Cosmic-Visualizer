import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getApod } from "@/lib/nasa/apod";
import { getAlerts } from "@/lib/nasa/donki";
import { getFindings } from "@/lib/nasa/findings";
import { searchGallery } from "@/lib/nasa/gallery";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { AlertSeverity } from "@/types/nasa";

const SEVERITY_TONE: Record<AlertSeverity, "info" | "watch" | "warning" | "severe"> = {
  info: "info",
  watch: "watch",
  warning: "warning",
  severe: "severe",
};

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

export default async function Home() {
  const [apod, alerts, findings, gallery] = await Promise.all([
    safe(() => getApod()),
    safe(() => getAlerts()),
    safe(() => getFindings()),
    safe(() => searchGallery({ q: "galaxy" })),
  ]);

  const todayApod = apod?.[0];
  const latestAlert = alerts?.[0];
  const latestFinding = findings?.[0];
  const featuredImages = gallery?.items.slice(0, 3) ?? [];

  return (
    <div className="flex flex-col gap-10">
      <section>
        <p className="text-sm font-medium uppercase tracking-widest text-nebula-secondary">
          NASA data, visualized
        </p>
        <h1 className="mt-2 max-w-2xl text-3xl font-semibold text-text-primary sm:text-4xl">
          Explore galaxies, space weather, and the latest cosmic research.
        </h1>

        {todayApod && (
          <Card className="mt-6 overflow-hidden p-0">
            <div className="grid gap-0 sm:grid-cols-2">
              <div className="relative aspect-video sm:aspect-auto">
                {todayApod.mediaType === "image" ? (
                  <Image
                    src={todayApod.url}
                    alt={todayApod.title}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full min-h-64 items-center justify-center bg-space-bg text-sm text-text-muted">
                    Today&apos;s Astronomy Picture of the Day is a video — view on{" "}
                    <a href={todayApod.url} className="ml-1 text-nebula-secondary underline">
                      NASA&apos;s site
                    </a>
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center gap-2 p-6">
                <Badge tone="info">Astronomy Picture of the Day</Badge>
                <h2 className="text-xl font-semibold text-text-primary">{todayApod.title}</h2>
                <p className="line-clamp-4 text-sm text-text-muted">{todayApod.explanation}</p>
                <Link
                  href="/explorations"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-nebula-secondary hover:underline"
                >
                  Browse the archive <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Card>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Latest cosmic alert
          </p>
          {latestAlert ? (
            <>
              <div className="mt-2">
                <Badge tone={SEVERITY_TONE[latestAlert.severity]}>{latestAlert.type}</Badge>
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-text-primary">{latestAlert.title}</p>
            </>
          ) : (
            // `alerts` is null when DONKI failed; an empty list genuinely means no alerts.
            <p className="mt-2 text-sm text-text-muted">
              {alerts ? "No active alerts right now." : "Couldn't load space weather alerts right now."}
            </p>
          )}
          <Link
            href="/alerts"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-nebula-secondary hover:underline"
          >
            View all alerts <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Latest finding
          </p>
          {latestFinding ? (
            <p className="mt-2 line-clamp-3 text-sm text-text-primary">{latestFinding.title}</p>
          ) : (
            <p className="mt-2 text-sm text-text-muted">
              {findings ? "No findings available." : "Couldn't load the latest findings right now."}
            </p>
          )}
          <Link
            href="/findings"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-nebula-secondary hover:underline"
          >
            Read more <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Featured galaxy imagery
          </p>
          <div className="mt-2 flex gap-2">
            {featuredImages.map((img) => (
              <div key={img.nasaId} className="relative h-14 w-14 overflow-hidden rounded-md bg-space-bg">
                {img.thumbnailUrl && (
                  <Image
                    src={img.thumbnailUrl}
                    alt={img.title}
                    fill
                    sizes="56px"
                    className="object-cover"
                    unoptimized
                  />
                )}
              </div>
            ))}
          </div>
          <Link
            href="/galaxies"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-nebula-secondary hover:underline"
          >
            Browse gallery <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm font-medium text-text-primary">Cosmic Research</p>
          <p className="mt-1 text-sm text-text-muted">
            Explore confirmed exoplanets from the NASA Exoplanet Archive.
          </p>
          <Link
            href="/research"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-nebula-secondary hover:underline"
          >
            Open research explorer <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium text-text-primary">Cosmic Definitions</p>
          <p className="mt-1 text-sm text-text-muted">
            A searchable glossary of key astronomy and space-science terms.
          </p>
          <Link
            href="/glossary"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-nebula-secondary hover:underline"
          >
            Browse glossary <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </section>
    </div>
  );
}
