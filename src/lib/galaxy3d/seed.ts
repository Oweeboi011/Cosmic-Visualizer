/** Deterministic 32-bit string hash (djb2) used to derive spiral-galaxy seeds. */
export function hashStringToSeed(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return hash >>> 0;
}

/** Today's UTC date as YYYY-MM-DD, used so a seed reseeds once per day. */
export function todayUtcDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Seed for a per-asset galaxy scene: stable per nasaId, reseeds once per day. */
export function dailySeedForAsset(nasaId: string): number {
  return hashStringToSeed(`${nasaId}-${todayUtcDateString()}`);
}
