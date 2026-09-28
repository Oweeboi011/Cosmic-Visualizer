"use client";

/**
 * Client-only, code-split entry points for the WebGL views. three.js is large and
 * can't render on the server, so each scene loads lazily with `ssr: false` (which
 * Next.js only allows from a Client Component like this one).
 */

import dynamic from "next/dynamic";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export const SolarSystemSceneLoader = dynamic(
  () => import("@/components/planets/SolarSystemScene").then((mod) => mod.SolarSystemScene),
  { ssr: false, loading: () => <LoadingSkeleton shape="hero" /> }
);

export const PlanetViewerLoader = dynamic(
  () => import("@/components/planets/PlanetViewer").then((mod) => mod.PlanetViewer),
  { ssr: false, loading: () => <LoadingSkeleton shape="hero" /> }
);

export const StarViewerLoader = dynamic(
  () => import("@/components/stars/StarViewer").then((mod) => mod.StarViewer),
  { ssr: false, loading: () => <LoadingSkeleton shape="hero" /> }
);
