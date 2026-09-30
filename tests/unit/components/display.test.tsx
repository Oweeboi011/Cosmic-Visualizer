// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { AlertTimeline } from "@/components/alerts/AlertTimeline";
import { NeoWidget } from "@/components/alerts/NeoWidget";
import { FindingsList } from "@/components/findings/FindingsList";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { ErrorState } from "@/components/ui/ErrorState";
import { FormattedDate } from "@/components/ui/FormattedDate";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import type { AlertItem, FindingItem, GalleryItem, NeoItem } from "@/types/nasa";

afterEach(cleanup);

describe("FormattedDate", () => {
  it("renders a machine-readable <time> in UTC", () => {
    render(<FormattedDate value="2026-09-02T12:23Z" withTime />);
    const time = screen.getByText("Sep 2, 2026, 12:23 UTC");
    expect(time.tagName).toBe("TIME");
    expect(time).toHaveAttribute("dateTime", "2026-09-02T12:23:00.000Z");
  });

  it("falls back to the raw value when it can't be parsed", () => {
    render(<FormattedDate value="sometime" />);
    expect(screen.getByText("sometime").tagName).not.toBe("TIME");
  });
});

describe("Pagination", () => {
  const params = { tab: "gallery", q: "mars", page: "2" };

  it("links to neighbouring pages and keeps other params", () => {
    render(<Pagination page={2} totalPages={5} basePath="/planets" params={params} />);
    expect(screen.getByRole("link", { name: /Previous/ })).toHaveAttribute("href", "/planets?tab=gallery&q=mars");
    expect(screen.getByRole("link", { name: /Next/ })).toHaveAttribute("href", "/planets?tab=gallery&q=mars&page=3");
    expect(screen.getByText("Page 2 of 5")).toBeInTheDocument();
  });

  it("disables the ends", () => {
    const { rerender } = render(<Pagination page={1} totalPages={3} basePath="/stars" params={{}} />);
    expect(screen.queryByRole("link", { name: /Previous/ })).toBeNull();
    expect(screen.getByRole("link", { name: /Next/ })).toHaveAttribute("href", "/stars?page=2");

    rerender(<Pagination page={3} totalPages={3} basePath="/stars" params={{}} />);
    expect(screen.getByRole("link", { name: /Previous/ })).toHaveAttribute("href", "/stars?page=2");
    expect(screen.queryByRole("link", { name: /Next/ })).toBeNull();
  });

  it("renders nothing for a single page", () => {
    const { container } = render(<Pagination page={1} totalPages={1} basePath="/stars" params={{}} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("AlertTimeline", () => {
  const alert: AlertItem = {
    id: "a1",
    type: "FLR",
    issuedAt: "2026-09-02T12:23Z",
    title: "Solar flare",
    summary: "An M-class flare.",
    severity: "warning",
    sourceUrl: "https://ccmc.gsfc.nasa.gov/DONKI-Editor/view/Alert/1/1",
  };

  it("shows each alert with a UTC timestamp and source link", () => {
    render(<AlertTimeline items={[alert, { ...alert, id: "a2", sourceUrl: undefined }]} />);
    const [first, second] = screen.getAllByRole("listitem");
    expect(within(first).getByText("Sep 2, 2026, 12:23 UTC")).toBeInTheDocument();
    expect(within(first).getByRole("link", { name: "View source report" })).toHaveAttribute("href", alert.sourceUrl);
    expect(within(second).queryByRole("link")).toBeNull();
  });

  it("shows an empty state", () => {
    render(<AlertTimeline items={[]} />);
    expect(screen.getByText("No space weather notifications in this window.")).toBeInTheDocument();
  });
});

describe("NeoWidget", () => {
  const neo: NeoItem = {
    id: "n1",
    name: "(2026 AB)",
    closeApproachDate: "2026-10-01",
    missDistanceKm: 1234567.8,
    diameterMinM: 10,
    diameterMaxM: 20,
    isPotentiallyHazardous: true,
    relativeVelocityKph: 50000,
  };

  it("formats date and distance independent of server locale", () => {
    render(<NeoWidget items={[neo, { ...neo, id: "n2", isPotentiallyHazardous: false }]} />);
    expect(screen.getAllByText(/1,234,568 km miss distance/)).toHaveLength(2);
    expect(screen.getAllByText("Oct 1, 2026")).toHaveLength(2);
    expect(screen.getAllByText("PHA")).toHaveLength(1);
  });

  it("shows an empty state", () => {
    render(<NeoWidget items={[]} />);
    expect(screen.getByText("No close approaches in the next 7 days.")).toBeInTheDocument();
  });
});

describe("FindingsList", () => {
  const finding: FindingItem = {
    id: "f1",
    title: "Webb spots a galaxy",
    summary: "Summary",
    link: "https://science.nasa.gov/a",
    publishedAt: "2026-09-29T08:00:00Z",
    imageUrl: "https://example.com/unknown-host.jpg",
    source: "fallback",
    agency: "NASA",
  };

  it("links each finding out and serves unknown image hosts unoptimized", () => {
    render(<FindingsList items={[finding]} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", finding.link);
    expect(screen.getByRole("img", { name: finding.title })).toHaveAttribute("src", finding.imageUrl);
    expect(screen.getByText("Curated")).toBeInTheDocument();
    expect(screen.getByText("Sep 29, 2026")).toBeInTheDocument();
  });

  it("shows an empty state", () => {
    render(<FindingsList items={[]} />);
    expect(screen.getByText("No findings available right now.")).toBeInTheDocument();
  });
});

describe("GalleryGrid", () => {
  const item: GalleryItem = {
    nasaId: "PIA04921",
    title: "Andromeda Galaxy",
    description: "",
    dateCreated: "2003-12-10T22:41:32Z",
    thumbnailUrl: "https://images-assets.nasa.gov/image/PIA04921/PIA04921~thumb.jpg",
    mediaType: "image",
    keywords: [],
  };

  it("links to detail pages and optimizes NASA thumbnails", () => {
    render(<GalleryGrid items={[item]} basePath="/galaxies" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/galaxies/PIA04921");
    expect(screen.getByRole("img", { name: item.title }).getAttribute("src")).toMatch(/^\/_next\/image\?url=/);
    expect(screen.getByText("Dec 10, 2003")).toBeInTheDocument();
  });

  it("shows an empty state", () => {
    render(<GalleryGrid items={[]} basePath="/galaxies" />);
    expect(screen.getByText(/No images found/)).toBeInTheDocument();
  });
});

describe("ErrorState", () => {
  it("has a default message", () => {
    render(<ErrorState />);
    expect(screen.getByText("We couldn't load this data right now.")).toBeInTheDocument();
  });
});

describe("Modal", () => {
  it("focuses the dialog, traps Tab, and closes on Escape or backdrop click", () => {
    const onClose = vi.fn();
    const opener = document.createElement("button");
    document.body.appendChild(opener);
    opener.focus();

    const { unmount } = render(
      <Modal title="Details" onClose={onClose}>
        <a href="#x">Inner link</a>
      </Modal>
    );
    const dialog = screen.getByRole("dialog", { name: "Details" });
    const close = screen.getByRole("button", { name: "Close" });
    const link = screen.getByRole("link", { name: "Inner link" });
    expect(dialog.contains(document.activeElement)).toBe(true);

    link.focus();
    fireEvent.keyDown(link, { key: "Tab" });
    expect(document.activeElement).toBe(close);
    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(link);

    fireEvent.keyDown(dialog, { key: "Escape" });
    fireEvent.click(dialog);
    fireEvent.click(close);
    expect(onClose).toHaveBeenCalledTimes(3);

    unmount();
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });
});
