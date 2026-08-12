import { fetchNasaApi } from "@/lib/nasa/client";
import type { AlertItem, AlertSeverity } from "@/types/nasa";
import { clampDateRange } from "@/lib/utils";

const REVALIDATE_SECONDS = 15 * 60; // 15min — most time-sensitive data source
const MAX_RANGE_DAYS = 30;

interface RawNotification {
  messageType: string;
  messageID: string;
  messageIssueTime: string;
  messageURL?: string;
  messageBody: string;
}

const SEVERE_KEYWORDS = ["extreme", "severe", "R3", "R4", "R5", "G4", "G5", "X-class"];
const WARNING_KEYWORDS = ["warning", "strong", "G3", "M-class", "R2"];
const WATCH_KEYWORDS = ["watch", "moderate", "G1", "G2", "R1"];

function deriveSeverity(type: string, body: string): AlertSeverity {
  const haystack = `${type} ${body}`;
  if (SEVERE_KEYWORDS.some((k) => haystack.includes(k))) return "severe";
  if (WARNING_KEYWORDS.some((k) => haystack.toLowerCase().includes(k.toLowerCase()))) return "warning";
  if (WATCH_KEYWORDS.some((k) => haystack.toLowerCase().includes(k.toLowerCase()))) return "watch";
  return "info";
}

/**
 * DONKI message bodies open with a fixed "## Message Type: ..." / disclaimer header
 * block before any human-readable content. Pull the descriptive type line for the
 * title, and the "## Summary:" section (when present) for the summary, rather than
 * surfacing the boilerplate header as if it were the notification itself.
 */
function deriveTitle(raw: RawNotification): string {
  const typeLineMatch = raw.messageBody.match(/^##\s*Message Type:\s*(.+)$/m);
  if (typeLineMatch) return typeLineMatch[1].trim().slice(0, 140);

  const firstContentLine = raw.messageBody
    .split("\n")
    .find((l) => l.trim().length > 0 && !l.trim().startsWith("##"));
  return firstContentLine?.trim().slice(0, 140) ?? `${raw.messageType} notification`;
}

function deriveSummary(body: string): string {
  const summaryMatch = body.match(/##\s*Summary:\s*\n+([\s\S]+?)(\n##|\n\n\n|$)/);
  const content = summaryMatch ? summaryMatch[1] : body;
  return content
    .split("\n")
    .filter((l) => l.trim().length > 0 && !l.trim().startsWith("##"))
    .join(" ")
    .trim()
    .slice(0, 500);
}

function normalize(raw: RawNotification): AlertItem {
  return {
    id: raw.messageID,
    type: raw.messageType,
    issuedAt: raw.messageIssueTime,
    title: deriveTitle(raw),
    summary: deriveSummary(raw.messageBody),
    severity: deriveSeverity(raw.messageType, raw.messageBody),
    sourceUrl: raw.messageURL,
  };
}

export interface GetAlertsParams {
  type?: string;
  startDate?: string;
  endDate?: string;
}

const VALID_TYPES = new Set(["all", "CME", "FLR", "GST", "SEP", "IPS", "MPC", "RBE", "report"]);

export async function getAlerts(params: GetAlertsParams = {}): Promise<AlertItem[]> {
  const { startDate, endDate } = clampDateRange(params.startDate, params.endDate, MAX_RANGE_DAYS, 7);
  const type = params.type && VALID_TYPES.has(params.type) ? params.type : "all";

  const raw = await fetchNasaApi<RawNotification[]>(
    "/DONKI/notifications",
    { startDate, endDate, type },
    { revalidate: REVALIDATE_SECONDS, tags: ["alerts"] }
  );

  return raw
    .map(normalize)
    .sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1));
}
