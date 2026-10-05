import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

/** A module worker that fails after construction, as a CSP or bundling error would. */
class FailingWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  terminate = vi.fn();
  postMessage() {
    queueMicrotask(() => this.onerror?.(new Event("error")));
  }
}

beforeEach(() => vi.resetModules());
afterEach(() => {
  vi.unstubAllGlobals();
  vi.doUnmock("@/lib/space3d/planetTextures");
});

describe("useProceduralTexture", () => {
  it("falls back to inline generation when the worker errors", async () => {
    vi.stubGlobal("Worker", FailingWorker);
    const { useProceduralTexture } = await import("@/components/space3d/textures");
    const { result } = renderHook(() => useProceduralTexture({ type: "clouds", width: 16 }));
    await waitFor(() => expect(result.current).not.toBeNull());
  });

  it("settles and allows a retry when inline generation also fails", async () => {
    vi.stubGlobal("Worker", FailingWorker);
    const actual = await vi.importActual<typeof import("@/lib/space3d/planetTextures")>(
      "@/lib/space3d/planetTextures",
    );
    const generateTexture = vi
      .fn()
      .mockImplementationOnce(() => {
        throw new Error("boom");
      })
      .mockImplementation(actual.generateTexture);
    vi.doMock("@/lib/space3d/planetTextures", () => ({ ...actual, generateTexture }));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { useProceduralTexture } = await import("@/components/space3d/textures");

    const first = renderHook(() => useProceduralTexture({ type: "clouds", width: 16 }));
    await waitFor(() => expect(warn).toHaveBeenCalled());
    expect(first.result.current).toBeNull();
    first.unmount();

    const second = renderHook(() => useProceduralTexture({ type: "clouds", width: 16 }));
    await waitFor(() => expect(second.result.current).not.toBeNull());
  });
});
