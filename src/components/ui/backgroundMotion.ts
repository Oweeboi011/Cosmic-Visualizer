/**
 * Lets foreground views pause the site-wide Starfield animation, e.g. while a 3D scene
 * covers the whole window and the background is hidden anyway. Holds are counted, so
 * overlapping holders don't release each other's pause.
 */
let holds = 0;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

/** Pauses background motion until the returned release function is called (idempotent). */
export function holdBackgroundMotion(): () => void {
  holds++;
  notify();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    holds--;
    notify();
  };
}

export function isBackgroundMotionHeld(): boolean {
  return holds > 0;
}

export function subscribeBackgroundMotion(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
