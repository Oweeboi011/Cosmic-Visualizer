import { HTMLAttributes } from "react";

export function Grid({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
      {...props}
    />
  );
}
