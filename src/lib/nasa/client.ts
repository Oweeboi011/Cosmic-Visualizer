import "server-only";
import { NasaApiError } from "@/types/nasa";

const NASA_API_BASE = "https://api.nasa.gov";

/**
 * Maps an upstream HTTP failure to an app-level error. 404 and 429 keep their meaning
 * (callers render not-found / back off); everything else is a generic bad gateway.
 */
function upstreamError(status: number, label: string): NasaApiError {
  if (status === 404) return new NasaApiError(`${label} returned 404`, 404, "UPSTREAM_NOT_FOUND");
  if (status === 429) return new NasaApiError(`${label} returned 429`, 429, "UPSTREAM_RATE_LIMITED");
  return new NasaApiError(`${label} returned ${status}`, 502, "UPSTREAM_ERROR");
}

function getApiKey(): string {
  const key = process.env.NASA_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[nasa/client] NASA_API_KEY is not set — falling back to DEMO_KEY (very low rate limits). Set NASA_API_KEY in .env.local.",
      );
    }
    return "DEMO_KEY";
  }
  return key;
}

interface FetchOptions {
  revalidate: number;
  tags?: string[];
}

/** The one place upstream requests are made: caching, unreachable hosts and HTTP errors. */
async function request(url: string, options: FetchOptions, label: string): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url, {
      next: { revalidate: options.revalidate, tags: options.tags },
    });
  } catch {
    throw new NasaApiError(`Failed to reach ${label}`, 502, "UPSTREAM_UNREACHABLE");
  }
  if (!response.ok) {
    throw upstreamError(response.status, label);
  }
  return response;
}

/**
 * Fetches from an api.nasa.gov endpoint with the server-only API key attached.
 * The `server-only` import makes a Client Component importing this a build error.
 */
export async function fetchNasaApi<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined>,
  options: FetchOptions,
): Promise<T> {
  const url = new URL(`${NASA_API_BASE}${path}`);
  url.searchParams.set("api_key", getApiKey());
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return fetchJson<T>(url.toString(), options);
}

/**
 * Fetches from a keyless external URL (images-api.nasa.gov, Exoplanet Archive, RSS feeds)
 * with the same caching/error conventions as fetchNasaApi.
 */
export async function fetchJson<T>(url: string, options: FetchOptions): Promise<T> {
  const response = await request(url, options, "upstream NASA service");
  try {
    return (await response.json()) as T;
  } catch {
    throw new NasaApiError("Upstream NASA service returned malformed data", 502, "UPSTREAM_MALFORMED");
  }
}

export async function fetchText(url: string, options: FetchOptions): Promise<string> {
  const response = await request(url, options, "upstream service");
  return response.text();
}
