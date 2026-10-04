import { describe, expect, it, vi } from "vitest";
import {
  holdBackgroundMotion,
  isBackgroundMotionHeld,
  subscribeBackgroundMotion,
} from "@/components/ui/backgroundMotion";

describe("backgroundMotion", () => {
  it("stays held until every holder releases, and notifies subscribers", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeBackgroundMotion(listener);

    const releaseA = holdBackgroundMotion();
    const releaseB = holdBackgroundMotion();
    expect(isBackgroundMotionHeld()).toBe(true);

    releaseA();
    releaseA(); // idempotent: must not release B's hold
    expect(isBackgroundMotionHeld()).toBe(true);

    releaseB();
    expect(isBackgroundMotionHeld()).toBe(false);
    expect(listener).toHaveBeenCalledTimes(4);

    unsubscribe();
    holdBackgroundMotion()();
    expect(listener).toHaveBeenCalledTimes(4);
  });
});
