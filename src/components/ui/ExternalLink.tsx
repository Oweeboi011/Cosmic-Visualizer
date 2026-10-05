import type { AnchorHTMLAttributes } from "react";

const DEFAULT_CLASSES = "text-nebula-secondary hover:underline";

/** A link that opens off-site in a new tab without giving the target `window.opener`. */
export function ExternalLink({
  className = DEFAULT_CLASSES,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel">) {
  return <a target="_blank" rel="noopener noreferrer" className={className} {...props} />;
}
