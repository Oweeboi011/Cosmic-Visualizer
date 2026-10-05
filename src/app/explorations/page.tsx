import { ExternalLink } from "@/components/ui/ExternalLink";
import type { Metadata } from "next";
import { RemoteImage } from "@/components/ui/RemoteImage";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Grid } from "@/components/ui/Grid";
import { ErrorState } from "@/components/ui/ErrorState";
import { FormattedDate } from "@/components/ui/FormattedDate";
import { getApod } from "@/lib/nasa/apod";
import { DAY_MS, toIsoDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Explorations" };

export default async function ExplorationsPage({
  searchParams,
}: {
  searchParams: Promise<{ start_date?: string; end_date?: string }>;
}) {
  const params = await searchParams;
  // getApod validates, orders and bounds the range (max 30 days); an omitted end date
  // means "30 days from the start, capped at today".
  const today = new Date();
  const defaultStart = toIsoDate(new Date(today.getTime() - 13 * DAY_MS));
  const startDate = params.start_date ?? defaultStart;
  const endDate = params.end_date;

  let items: Awaited<ReturnType<typeof getApod>> = [];
  let failed = false;
  try {
    items = await getApod({ startDate, endDate });
  } catch {
    failed = true;
  }

  return (
    <div>
      <PageHeader
        title="Explorations"
        description="Browse NASA's Astronomy Picture of the Day archive, plus other ways to explore NASA's cosmic data."
      />

      {failed ? (
        <ErrorState message="We couldn't load the Astronomy Picture of the Day archive right now." />
      ) : (
        <Grid>
          {items.map((item) => (
            <Card key={item.date} className="overflow-hidden p-0">
              <div className="relative aspect-video bg-space-bg">
                {item.mediaType === "image" ? (
                  <RemoteImage
                    src={item.url}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <ExternalLink
                    href={item.url}
                    className="flex h-full items-center justify-center text-xs text-nebula-secondary underline"
                  >
                    View video
                  </ExternalLink>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-text-muted">
                  <FormattedDate value={item.date} />
                </p>
                <p className="mt-1 line-clamp-2 text-sm font-semibold text-text-primary">{item.title}</p>
              </div>
            </Card>
          ))}
        </Grid>
      )}

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm font-medium text-text-primary">Space weather &amp; near-earth objects</p>
          <p className="mt-1 text-sm text-text-muted">Track real-time cosmic alerts.</p>
          <Link
            href="/alerts"
            className="mt-3 inline-block text-sm font-medium text-nebula-secondary hover:underline"
          >
            View alerts
          </Link>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium text-text-primary">Confirmed exoplanets</p>
          <p className="mt-1 text-sm text-text-muted">Explore worlds beyond our Solar System.</p>
          <Link
            href="/research"
            className="mt-3 inline-block text-sm font-medium text-nebula-secondary hover:underline"
          >
            Open research explorer
          </Link>
        </Card>
      </div>
    </div>
  );
}
