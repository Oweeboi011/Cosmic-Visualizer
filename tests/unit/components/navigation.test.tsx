// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NavBar } from "@/components/layout/NavBar";
import { AlertFilterBar } from "@/components/alerts/AlertFilterBar";
import { FindingsSourceFilter } from "@/components/findings/FindingsSourceFilter";
import { GalleryFilters } from "@/components/gallery/GalleryFilters";

const nav = vi.hoisted(() => ({ pathname: "/", search: "", push: vi.fn() }));

vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useSearchParams: () => new URLSearchParams(nav.search),
  useRouter: () => ({ push: nav.push }),
}));

beforeEach(() => {
  nav.pathname = "/";
  nav.search = "";
  nav.push.mockReset();
});

afterEach(cleanup);

describe("NavBar", () => {
  it("marks the current section, including its detail pages", () => {
    nav.pathname = "/galaxies/PIA04921";
    render(<NavBar />);
    expect(screen.getByRole("link", { name: "Galaxies" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Stars" })).not.toHaveAttribute("aria-current");
  });

  it("toggles the mobile menu and closes it on Escape, returning focus", () => {
    render(<NavBar />);
    const button = screen.getByRole("button", { name: "Open menu" });
    const menu = document.getElementById("site-nav")!;
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(menu.className).toMatch(/(^|\s)hidden(\s|$)/);

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button).toHaveAccessibleName("Close menu");
    expect(menu.className).not.toMatch(/(^|\s)hidden(\s|$)/);

    fireEvent.keyDown(screen.getByRole("link", { name: "Stars" }), { key: "Escape" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(button);
  });

  it("closes the menu when a link is chosen", () => {
    render(<NavBar />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const link = screen.getByRole("link", { name: "Alerts" });
    // jsdom can't navigate; stop the browser default without stopping React's handler.
    link.addEventListener("click", (e) => e.preventDefault());
    fireEvent.click(link);
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the menu after navigation", () => {
    const { rerender } = render(<NavBar />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    nav.pathname = "/alerts";
    rerender(<NavBar />);
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
  });
});

describe("filter controls", () => {
  it("AlertFilterBar reflects and updates the type param", () => {
    nav.search = "type=FLR&startDate=2026-09-01";
    render(<AlertFilterBar />);
    expect(screen.getByRole("button", { name: "Solar Flares" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Geomagnetic Storms" }));
    expect(nav.push).toHaveBeenLastCalledWith("/alerts?type=GST&startDate=2026-09-01");

    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(nav.push).toHaveBeenLastCalledWith("/alerts?startDate=2026-09-01");
  });

  it("FindingsSourceFilter reflects and updates the agency param", () => {
    nav.search = "agency=ESA";
    render(<FindingsSourceFilter />);
    expect(screen.getByRole("button", { name: "ESA" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(screen.getByRole("button", { name: "ESO" }));
    expect(nav.push).toHaveBeenLastCalledWith("/findings?agency=ESO");
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(nav.push).toHaveBeenLastCalledWith("/findings?");
  });

  it("GalleryFilters searches from a suggestion and resets paging", () => {
    nav.search = "tab=gallery&q=mars&page=3";
    render(<GalleryFilters basePath="/planets" placeholder="Search planets" suggestions={["Jupiter"]} />);
    expect(screen.getByRole("searchbox", { name: "Search planets" })).toHaveValue("mars");

    fireEvent.click(screen.getByRole("button", { name: "Jupiter" }));
    expect(nav.push).toHaveBeenLastCalledWith("/planets?tab=gallery&q=Jupiter");
  });

  it("GalleryFilters debounces typed searches and clears an empty query", () => {
    vi.useFakeTimers();
    try {
      nav.search = "q=mars";
      render(<GalleryFilters basePath="/stars" placeholder="Search stars" suggestions={[]} />);
      fireEvent.change(screen.getByRole("searchbox"), { target: { value: "  " } });
      expect(nav.push).not.toHaveBeenCalled();
      vi.advanceTimersByTime(400);
      expect(nav.push).toHaveBeenLastCalledWith("/stars?");
    } finally {
      vi.useRealTimers();
    }
  });
});
