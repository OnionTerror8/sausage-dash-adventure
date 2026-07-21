/**
 * Thin wrapper around the Vibration API for tactile feedback on supported
 * mobile browsers (mainly Android Chrome/Firefox — iOS Safari has no
 * Vibration API at all, and desktop browsers ignore it). Silently no-ops
 * everywhere it isn't supported, so call sites never need to feature-detect.
 */
function vibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* ignore unsupported/blocked calls */
  }
}

export const HAPTICS = {
  jump: () => vibrate(12),
  coin: () => vibrate(8),
  hit: () => vibrate([15, 40, 15]),
  powerup: () => vibrate([10, 30, 10, 30, 10]),
  purchase: () => vibrate([10, 20, 10, 20, 20]),
};
