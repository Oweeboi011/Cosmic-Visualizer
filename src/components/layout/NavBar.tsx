"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Telescope,
  Orbit,
  Images,
  Globe2,
  Star,
  Newspaper,
  Radio,
  FlaskConical,
  BookOpen,
  Rocket,
} from "lucide-react";

const SECTIONS = [
  { href: "/", label: "Overview", icon: Telescope },
  { href: "/galaxy-3d", label: "3D Galaxy", icon: Orbit },
  { href: "/galaxies", label: "Galaxies", icon: Images },
  { href: "/planets", label: "Planets & Exoplanets", icon: Globe2 },
  { href: "/stars", label: "Stars", icon: Star },
  { href: "/findings", label: "Findings", icon: Newspaper },
  { href: "/alerts", label: "Alerts", icon: Radio },
  { href: "/research", label: "Research", icon: FlaskConical },
  { href: "/glossary", label: "Glossary", icon: BookOpen },
  { href: "/explorations", label: "Explorations", icon: Rocket },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-space-border bg-space-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-text-primary">
          <Telescope className="h-5 w-5 text-nebula-primary" aria-hidden="true" />
          Cosmic Visualizer
        </Link>
        <nav className="flex flex-1 flex-wrap gap-x-4 gap-y-1 text-sm">
          {SECTIONS.slice(1).map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname?.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors ${
                  active
                    ? "text-nebula-primary"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
