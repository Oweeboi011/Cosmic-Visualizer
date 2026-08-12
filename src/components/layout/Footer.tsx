export function Footer() {
  return (
    <footer className="border-t border-space-border px-4 py-6 text-center text-xs text-text-muted sm:px-6">
      <p>
        Data courtesy of{" "}
        <a
          href="https://science.nasa.gov/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-nebula-secondary hover:underline"
        >
          NASA Science
        </a>{" "}
        and the{" "}
        <a
          href="https://api.nasa.gov/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-nebula-secondary hover:underline"
        >
          NASA Open APIs
        </a>
        . Cosmic Visualizer is an independent project and is not affiliated with or
        endorsed by NASA.
      </p>
      <p className="mt-1">
        Based on the curiosity and personal vision boarding of Owee Penaranda.
      </p>
    </footer>
  );
}
