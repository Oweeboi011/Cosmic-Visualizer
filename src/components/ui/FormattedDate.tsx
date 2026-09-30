import { formatUtcDate } from "@/lib/utils";

/** A `<time>` element formatted in UTC; see `formatUtcDate`. */
export function FormattedDate({ value, withTime = false }: { value: string; withTime?: boolean }) {
  const text = formatUtcDate(value, withTime);
  if (!text) return <>{value}</>;
  return <time dateTime={new Date(value).toISOString()}>{text}</time>;
}
