import Link from "next/link";
import { Orbit, Globe2, Star, FlaskConical, BookOpen, type LucideIcon } from "lucide-react";
import { RemoteImage } from "@/components/ui/RemoteImage";
import { getApod } from "@/lib/nasa/apod";
import { getAlerts } from "@/lib/nasa/donki";
import { getFindings } from "@/lib/nasa/findings";
import { searchGallery } from "@/lib/nasa/gallery";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ExternalLink } from "@/components/ui/ExternalLink";

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

const SCENES: { href: string; title: string; description: string; icon: LucideIcon }[] = [
  {
    href: "/galaxy-3d",
    title: "3D Galaxy",
    description: "Fly through a procedurally generated galaxy, seeded fresh every day.",
    icon: Orbit,
  },
  {
    href: "/planets",
    title: "Planets",
    description: "Orbit the solar system and inspect each world up close.",
    icon: Globe2,
  },
  {
    href: "/stars",
    title: "Stars",
    description: "Compare stellar spectral classes, from blue giants to red dwarfs.",
    icon: Star,
  },
];

const LABEL_CLASSES = "text-xs font-medium uppercase tracking-wide text-text-muted";

function SectionHeading({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="text-lg font-semibold text-text-primary">
      {children}
    </h2>
  );
}

function ResourceCard({
  href,
  icon: Icon,
  title,
  description,
  cta,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Card className="flex items-start gap-4 p-5">
      <Icon className="mt-0.5 h-6 w-6 shrink-0 text-nebula-primary" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-text-primary">{title}</p>
        <p className="mt-1 text-sm text-text-muted">{description}</p>
        <ArrowLink href={href} className="mt-3">
          {cta}
        </ArrowLink>
      </div>
    </Card>
  );
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
    <div className="flex flex-col gap-12">
      <section className="pt-4">
        <p className="text-sm font-medium uppercase tracking-widest text-nebula-secondary">
          NASA data, visualized
        </p>
        <h1 className="mt-2 max-w-3xl text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
          Explore galaxies, space weather, and the latest{" "}
          <span className="bg-linear-to-r from-nebula-primary to-nebula-secondary bg-clip-text text-transparent">
            cosmic research
          </span>
          .
        </h1>
        <p className="mt-4 max-w-2xl text-base text-text-muted">
          Live data from NASA, ESA and ESO: today&apos;s astronomy picture, space weather alerts, exoplanets,
          and interactive 3D scenes.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/galaxy-3d"
            className="inline-flex items-center gap-2 rounded-lg bg-nebula-primary px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-nebula-primary/85"
          >
            <Orbit className="h-4 w-4" aria-hidden="true" />
            Launch the 3D galaxy
          </Link>
          <Link
            href="/findings"
            className="inline-flex items-center gap-2 rounded-lg border border-space-border bg-space-surface/60 px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:border-nebula-secondary/60"
          >
            Latest findings
          </Link>
        </div>
      </section>

      {todayApod && (
        <Card className="overflow-hidden p-0">
          <div className="grid gap-0 md:grid-cols-5">
            <div className="relative aspect-video md:col-span-3 md:aspect-auto md:min-h-80">
              {todayApod.mediaType === "image" ? (
                <RemoteImage
                  src={todayApod.url}
                  alt={todayApod.title}
                  fill
                  priority
                  sizes="(min-width: 768px) 60vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full min-h-64 items-center justify-center bg-space-bg text-sm text-text-muted">
                  Today&apos;s Astronomy Picture of the Day is a video — view on{" "}
                  <ExternalLink href={todayApod.url} className="ml-1 text-nebula-secondary underline">
                    NASA&apos;s site
                  </ExternalLink>
                </div>
              )}
            </div>
            <div className="flex flex-col items-start justify-center gap-3 p-6 md:col-span-2">
              <Badge tone="info">Astronomy Picture of the Day</Badge>
              <h2 className="text-xl font-semibold text-text-primary">{todayApod.title}</h2>
              <p className="line-clamp-5 text-sm text-text-muted">{todayApod.explanation}</p>
              <ArrowLink href="/explorations" className="mt-1">
                Browse the archive
              </ArrowLink>
            </div>
          </div>
        </Card>
      )}

      <section className="flex flex-col gap-4" aria-labelledby="scenes-heading">
        <SectionHeading id="scenes-heading">Explore in 3D</SectionHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {SCENES.map(({ href, title, description, icon: Icon }) => (
            <Link key={href} href={href} className="group rounded-xl">
              <Card className="h-full p-5 group-hover:shadow-glow">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-nebula-primary/15 text-nebula-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="mt-4 font-semibold text-text-primary group-hover:text-nebula-secondary">
                  {title}
                </p>
                <p className="mt-1 text-sm text-text-muted">{description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="live-heading">
        <SectionHeading id="live-heading">Live from the cosmos</SectionHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col p-5">
            <p className={LABEL_CLASSES}>Latest cosmic alert</p>
            {latestAlert ? (
              <>
                <div className="mt-2">
                  <Badge tone={latestAlert.severity}>{latestAlert.type}</Badge>
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-text-primary">{latestAlert.title}</p>
              </>
            ) : (
              // `alerts` is null when DONKI failed; an empty list genuinely means no alerts.
              <p className="mt-2 text-sm text-text-muted">
                {alerts ? "No active alerts right now." : "Couldn't load space weather alerts right now."}
              </p>
            )}
            <ArrowLink href="/alerts" className="mt-auto pt-3">
              View all alerts
            </ArrowLink>
          </Card>

          <Card className="flex flex-col p-5">
            <p className={LABEL_CLASSES}>Latest finding</p>
            {latestFinding ? (
              <p className="mt-2 line-clamp-3 text-sm text-text-primary">{latestFinding.title}</p>
            ) : (
              <p className="mt-2 text-sm text-text-muted">
                {findings ? "No findings available." : "Couldn't load the latest findings right now."}
              </p>
            )}
            <ArrowLink href="/findings" className="mt-auto pt-3">
              Read more
            </ArrowLink>
          </Card>

          <Card className="flex flex-col p-5">
            <p className={LABEL_CLASSES}>Featured galaxy imagery</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {featuredImages.map((img) => (
                <div
                  key={img.nasaId}
                  className="relative aspect-square overflow-hidden rounded-md bg-space-bg"
                >
                  {img.thumbnailUrl && (
                    <RemoteImage
                      src={img.thumbnailUrl}
                      alt={img.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
            <ArrowLink href="/galaxies" className="mt-auto pt-3">
              Browse gallery
            </ArrowLink>
          </Card>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ResourceCard
          href="/research"
          icon={FlaskConical}
          title="Cosmic Research"
          description="Explore confirmed exoplanets from the NASA Exoplanet Archive."
          cta="Open research explorer"
        />
        <ResourceCard
          href="/glossary"
          icon={BookOpen}
          title="Cosmic Definitions"
          description="A searchable glossary of key astronomy and space-science terms."
          cta="Browse glossary"
        />
      </section>
    </div>
  );
}
