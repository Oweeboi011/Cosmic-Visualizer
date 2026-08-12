"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import type { GalleryItem } from "@/types/nasa";

export function StarInfoModal({
  star,
  onClose,
}: {
  star: { id: number; label: string; searchTerm: string };
  onClose: () => void;
}) {
  const [items, setItems] = useState<GalleryItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/gallery?q=${encodeURIComponent(star.searchTerm)}&page=1`)
      .then((res) => {
        if (!res.ok) throw new Error("request failed");
        return res.json();
      })
      .then((data: { items: GalleryItem[] }) => {
        if (!cancelled) setItems(data.items.slice(0, 3));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [star.searchTerm]);

  return (
    <Modal title={star.label} onClose={onClose}>
      <p className="mb-4 text-xs text-text-muted">
        A stylized point in this visualization — not a real star position. Here&apos;s
        real NASA imagery related to &ldquo;{star.searchTerm}&rdquo;.
      </p>

      {error && <ErrorState message="We couldn't load imagery from the NASA Image and Video Library." />}

      {!error && !items && <LoadingSkeleton shape="row" count={3} />}

      {!error && items && items.length === 0 && (
        <p className="text-sm text-text-muted">
          No results found. Try browsing{" "}
          <Link
            href={`/galaxies?q=${encodeURIComponent(star.searchTerm)}`}
            className="text-nebula-primary hover:underline"
          >
            the full gallery search
          </Link>{" "}
          instead.
        </p>
      )}

      {!error && items && items.length > 0 && (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.nasaId}>
              <Link
                href={`/galaxies/${item.nasaId}`}
                className="flex gap-3 rounded-lg border border-space-border p-2 transition-colors hover:border-nebula-primary/50"
              >
                {item.thumbnailUrl && (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-space-bg">
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="line-clamp-1 text-sm font-medium text-text-primary">
                    {item.title}
                  </p>
                  <p className="line-clamp-2 text-xs text-text-muted">{item.description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
