"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import { Maximize2, Minimize2 } from "lucide-react";

/**
 * Canvas wrapper shared by every 3D view: a labelled container, a readable fallback
 * when WebGL is unavailable (old devices, disabled GPU, some VMs), and a full-window
 * mode. Full window pins the scene over the whole viewport and, where the browser
 * allows it, also enters real fullscreen; the fixed layout alone still works where
 * the Fullscreen API doesn't (e.g. iPhone Safari).
 */
export function SceneCanvas({
  label,
  className,
  overlay,
  children,
  ...canvasProps
}: {
  label: string;
  className: string;
  /** Controls rendered on top of the scene, so they stay usable in full window. */
  overlay?: ReactNode;
  children: ReactNode;
} & Omit<CanvasProps, "children" | "fallback">) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      // A modal opened on top of the scene (not one containing it) gets Escape first.
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog && containerRef.current && !dialog.contains(containerRef.current)) return;
      e.stopPropagation();
      setExpanded(false);
    }
    // In real fullscreen the browser consumes Escape itself; follow it back out.
    function handleFullscreenChange() {
      if (!document.fullscreenElement) setExpanded(false);
    }

    // Capture phase so this runs before a surrounding Modal's Escape handler.
    window.addEventListener("keydown", handleKey, true);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey, true);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, [expanded]);

  function enterFullWindow() {
    setExpanded(true);
    // Fullscreen the whole document rather than this element so modals opened from
    // the scene (rendered elsewhere in the page) stay visible.
    document.documentElement.requestFullscreen?.().catch(() => {});
  }

  return (
    <div
      ref={containerRef}
      className={
        expanded
          ? // Above the sticky navbar (z-40), below modals (z-50).
            "fixed inset-0 z-[45] bg-black"
          : `relative overflow-hidden rounded-xl border border-space-border bg-black ${className}`
      }
    >
      <div className="h-full w-full" role="img" aria-label={label}>
        <Canvas
          dpr={[1, 1.5]}
          fallback={
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-text-muted">
              Your browser or device doesn&apos;t support WebGL, so the 3D view can&apos;t be shown.
            </div>
          }
          {...canvasProps}
        >
          {children}
        </Canvas>
      </div>

      {overlay}

      <button
        type="button"
        onClick={expanded ? () => setExpanded(false) : enterFullWindow}
        aria-label={expanded ? "Exit full window" : "View in full window"}
        title={expanded ? "Exit full window (Esc)" : "View in full window"}
        className="absolute right-3 top-3 z-[31] rounded-full border border-space-border bg-black/60 p-2 text-text-primary backdrop-blur transition-colors hover:border-nebula-primary/60"
      >
        {expanded ? (
          <Minimize2 className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
