const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateString(value: string | undefined | null): value is string {
  if (!value || !DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime());
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function clampDateRange(
  startDate: string | undefined,
  endDate: string | undefined,
  maxDays: number,
  defaultDays = 7
): { startDate: string; endDate: string } {
  const today = new Date();
  const validStart = isValidDateString(startDate) ? startDate : undefined;
  const validEnd = isValidDateString(endDate) ? endDate : undefined;

  let end = validEnd ?? toIsoDate(today);
  let start =
    validStart ??
    toIsoDate(new Date(today.getTime() - defaultDays * 24 * 60 * 60 * 1000));

  const startMs = new Date(`${start}T00:00:00Z`).getTime();
  const endMs = new Date(`${end}T00:00:00Z`).getTime();
  const spanDays = (endMs - startMs) / (24 * 60 * 60 * 1000);

  if (spanDays > maxDays) {
    start = toIsoDate(new Date(endMs - maxDays * 24 * 60 * 60 * 1000));
  } else if (spanDays < 0) {
    // start after end — swap to keep the range sane
    [start, end] = [end, start];
  }

  return { startDate: start, endDate: end };
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function parseIntParam(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number
): number {
  const parsed = value ? Number.parseInt(value, 10) : NaN;
  if (Number.isNaN(parsed)) return fallback;
  return clampNumber(parsed, min, max);
}

// Dates render in Server Components, so an unpinned formatter would use the server's
// timezone and locale. Pin both: date-only values (YYYY-MM-DD from NASA) are UTC dates,
// and timestamps are shown in UTC with the zone labelled.
const DATE_FORMAT = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });
const DATE_TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
  hourCycle: "h23",
});

/**
 * "Sep 2, 2026", or "Sep 2, 2026, 12:23 UTC" with `withTime`. Returns null for
 * unparseable input so callers can fall back to the raw value.
 */
export function formatUtcDate(value: string, withTime = false): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return withTime ? `${DATE_TIME_FORMAT.format(date)} UTC` : DATE_FORMAT.format(date);
}
