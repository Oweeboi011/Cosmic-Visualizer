import { fetchJson } from "@/lib/nasa/client";
import type { AlertItem, AlertSeverity } from "@/types/nasa";
import { clampDateRange } from "@/lib/utils";

/**
 * CCMC moved DONKI off kauai.ccmc.gsfc.nasa.gov on 2026-09-30; the api.nasa.gov proxy
 * still points at the old host and now answers with a 301 to an HTML notice. The new
 * base is keyless and keeps the same parameters and response schema.
 */
const DONKI_API_BASE = "https://ccmc.gsfc.nasa.gov/DONKI-API/get";
const REVALIDATE_SECONDS = 15 * 60; // 15min — most time-sensitive data source
const MAX_RANGE_DAYS = 30;

interface RawNotification {
  messageType: string;
  messageID: string;
  messageIssueTime: string;
  messageURL?: string;
  messageBody: string;
}

const TYPE_NAMES: Record<string, string> = {
  CME: "Coronal mass ejection",
  FLR: "Solar flare",
  GST: "Geomagnetic storm",
  SEP: "Solar energetic particle event",
  IPS: "Interplanetary shock",
  MPC: "Magnetopause crossing",
  RBE: "Radiation belt enhancement",
  REPORT: "Space weather report",
};

/**
 * Checked most severe first. NOAA scale levels (R radio blackout, S radiation storm,
 * G geomagnetic storm) follow NOAA's own wording: 1–2 minor/moderate, 3 strong,
 * 4 severe, 5 extreme. Scale levels and flare classes are matched as whole uppercase
 * tokens, so "R1" doesn't match inside "FR1" or "R12"; words match case-insensitively.
 */
const SEVERITY_RULES: [AlertSeverity, RegExp[]][] = [
  ["severe", [/\b(extreme|severe)\b/i, /\b[RSG][45]\b/, /\bX\d+(\.\d+)?\b/, /\bX-class\b/i]],
  ["warning", [/\b(warning|strong)\b/i, /\b[RSG]3\b/, /\bM\d+(\.\d+)?\b/, /\bM-class\b/i]],
  ["watch", [/\b(watch|moderate)\b/i, /\b[RSG][12]\b/]],
];

export function deriveSeverity(type: string, body: string): AlertSeverity {
  const haystack = `${type} ${body}`;
  for (const [severity, patterns] of SEVERITY_RULES) {
    if (patterns.some((p) => p.test(haystack))) return severity;
  }
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
  // The DONKI API currently returns bodies that are just "## ", so this is the usual path.
  return firstContentLine?.trim().slice(0, 140) ?? TYPE_NAMES[raw.messageType.toUpperCase()] ?? `${raw.messageType} notification`;
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

  const url = new URL(`${DONKI_API_BASE}/notifications`);
  url.search = new URLSearchParams({ startDate, endDate, type }).toString();
  const raw = await fetchJson<RawNotification[]>(url.toString(), {
    revalidate: REVALIDATE_SECONDS,
    tags: ["alerts"],
  });

  return raw
    .map(normalize)
    .sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1));
}
