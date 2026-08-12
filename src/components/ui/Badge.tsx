import { ReactNode } from "react";

type Tone = "info" | "watch" | "warning" | "severe" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  info: "bg-alert-info/15 text-alert-info border-alert-info/30",
  watch: "bg-alert-watch/15 text-alert-watch border-alert-watch/30",
  warning: "bg-alert-warning/15 text-alert-warning border-alert-warning/30",
  severe: "bg-alert-severe/15 text-alert-severe border-alert-severe/30",
  neutral: "bg-space-border/40 text-text-muted border-space-border",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
