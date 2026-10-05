"use client";

import { useState, type KeyboardEvent } from "react";
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
  Menu,
  X,
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

/**
 * Inline links on large screens; below `lg` the same links collapse behind a menu
 * button (nine links otherwise wrap into several rows on a phone).
 */
export function NavBar() {
  const pathname = usePathname();
  // The menu is open for the path it was opened on, so navigating closes it without an effect.
  const [openOnPath, setOpenOnPath] = useState<string | null>(null);
  const menuOpen = openOnPath !== null && openOnPath === pathname;

  function handleKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (e.key === "Escape" && menuOpen) {
      setOpenOnPath(null);
      document.getElementById("nav-menu-button")?.focus();
    }
  }

  return (
    <header
      className="sticky top-0 z-40 border-b border-space-border bg-space-bg/80 backdrop-blur-md"
      onKeyDown={handleKeyDown}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-text-primary">
          <Telescope className="h-5 w-5 text-nebula-primary" aria-hidden="true" />
          Cosmic Visualizer
        </Link>
        <button
          id="nav-menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setOpenOnPath(menuOpen ? null : pathname)}
          className="ml-auto rounded-md p-2 text-text-muted transition-colors hover:text-text-primary lg:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
        <nav
          id="site-nav"
          aria-label="Sections"
          className={`${
            menuOpen ? "flex" : "hidden"
          } w-full flex-col gap-1 pb-2 text-sm lg:flex lg:w-auto lg:flex-1 lg:flex-row lg:flex-wrap lg:gap-x-4 lg:gap-y-1 lg:pb-0`}
        >
          {SECTIONS.slice(1).map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname?.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                // Clicking the current page doesn't change the path, so close explicitly.
                onClick={() => setOpenOnPath(null)}
                className={`flex items-center gap-1.5 rounded-md px-2 py-2 transition-colors lg:py-1 ${
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
