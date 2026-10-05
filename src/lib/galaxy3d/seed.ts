/** Deterministic 32-bit string hash (djb2) used to derive spiral-galaxy seeds. */
export function hashStringToSeed(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return hash >>> 0;
}

/** A date as YYYY-MM-DD in UTC, used so a seed reseeds once per day. `now` is injectable for tests. */
export function todayUtcDateString(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Seed for a per-asset galaxy scene: stable per nasaId, reseeds once per UTC day. */
export function dailySeedForAsset(nasaId: string, now: Date = new Date()): number {
  return hashStringToSeed(`${nasaId}-${todayUtcDateString(now)}`);
}
