import { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-space-border bg-space-surface/60 backdrop-blur-sm transition-colors hover:border-nebula-primary/50 ${className}`}
      {...props}
    />
  );
}
