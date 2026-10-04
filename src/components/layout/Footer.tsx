import { ExternalLink } from "@/components/ui/ExternalLink";
export function Footer() {
  return (
    <footer className="border-t border-space-border px-4 py-6 text-center text-xs text-text-muted sm:px-6">
      <p>
        Data courtesy of <ExternalLink href="https://science.nasa.gov/">NASA Science</ExternalLink> and the{" "}
        <ExternalLink href="https://api.nasa.gov/">NASA Open APIs</ExternalLink>. Cosmic Visualizer is an
        independent project and is not affiliated with or endorsed by NASA.
      </p>
      <p className="mt-1">Based on the curiosity and personal vision boarding of Owee Penaranda.</p>
    </footer>
  );
}
