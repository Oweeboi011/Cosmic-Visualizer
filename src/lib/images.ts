/**
 * Hosts whose images next/image may optimize (resize, re-encode, cache). Shared by
 * `images.remotePatterns` in next.config.ts and `isOptimizableImage`, so the two can't
 * drift. A leading `**.` allows any subdomain (but not the bare domain).
 *
 * - NASA: APOD (science.nasa.gov, apod.nasa.gov), the Image and Video Library
 *   (images-assets.nasa.gov), and science.nasa.gov feed images (assets.science.nasa.gov,
 *   www.nasa.gov)
 * - ESA and ESO feed images
 */
export const OPTIMIZED_IMAGE_HOSTS = ["**.nasa.gov", "www.esa.int", "**.eso.org"] as const;

function hostMatches(hostname: string, pattern: string): boolean {
  return pattern.startsWith("**.")
    ? hostname.endsWith(pattern.slice(2))
    : hostname === pattern;
}

/**
 * Whether next/image can optimize `src`. Third-party feeds may link images anywhere;
 * those must render with `unoptimized` or the optimizer rejects them with a 400.
 */
export function isOptimizableImage(src: string): boolean {
  try {
    const { protocol, hostname } = new URL(src);
    if (protocol !== "https:" && protocol !== "http:") return false;
    return OPTIMIZED_IMAGE_HOSTS.some((pattern) => hostMatches(hostname, pattern));
  } catch {
    return false;
  }
}
