import type { Metadata } from "next";
import { Orbit } from "lucide-react";
import { GalleryCategoryPage } from "@/components/gallery/GalleryCategoryPage";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Galaxies" };

export default function GalaxiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  return (
    <GalleryCategoryPage
      title="Galaxies"
      description="Search NASA's Image and Video Library for galaxies, nebulae, and deep space imagery."
      basePath="/galaxies"
      defaultQuery="galaxy"
      placeholder="Search galaxies, nebulae, deep space imagery…"
      suggestions={["galaxy", "nebula", "deep space", "spiral galaxy", "star cluster"]}
      searchParams={searchParams}
      intro={
        <Card className="mb-6 flex flex-wrap items-center gap-4 p-5">
          <Orbit className="h-8 w-8 shrink-0 text-nebula-primary" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text-primary">Explore galaxy types in 3D</p>
            <p className="text-sm text-text-muted">
              Fly around spiral, barred-spiral, elliptical, and irregular galaxies.
            </p>
          </div>
          <ArrowLink href="/galaxy-3d">Open 3D galaxy</ArrowLink>
        </Card>
      }
    />
  );
}
