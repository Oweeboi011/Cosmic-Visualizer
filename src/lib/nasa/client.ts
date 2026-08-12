import { NasaApiError } from "@/types/nasa";

const NASA_API_BASE = "https://api.nasa.gov";

function getApiKey(): string {
  const key = process.env.NASA_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[nasa/client] NASA_API_KEY is not set — falling back to DEMO_KEY (very low rate limits). Set NASA_API_KEY in .env.local."
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

/**
 * Fetches from an api.nasa.gov endpoint with the server-only API key attached.
 * Never call this from client components — the key must stay server-side.
 */
export async function fetchNasaApi<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined>,
  options: FetchOptions
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
  let response: Response;
  try {
    response = await fetch(url, {
      next: { revalidate: options.revalidate, tags: options.tags },
    });
  } catch {
    throw new NasaApiError("Failed to reach upstream NASA service", 502, "UPSTREAM_UNREACHABLE");
  }

  if (!response.ok) {
    throw new NasaApiError(
      `Upstream NASA service returned ${response.status}`,
      response.status === 429 ? 429 : 502,
      response.status === 429 ? "UPSTREAM_RATE_LIMITED" : "UPSTREAM_ERROR"
    );
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new NasaApiError("Upstream NASA service returned malformed data", 502, "UPSTREAM_MALFORMED");
  }
}

export async function fetchText(url: string, options: FetchOptions): Promise<string> {
  let response: Response;
  try {
    response = await fetch(url, {
      next: { revalidate: options.revalidate, tags: options.tags },
    });
  } catch {
    throw new NasaApiError("Failed to reach upstream service", 502, "UPSTREAM_UNREACHABLE");
  }

  if (!response.ok) {
    throw new NasaApiError(`Upstream service returned ${response.status}`, 502, "UPSTREAM_ERROR");
  }

  return response.text();
}
