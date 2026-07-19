/**
 * Shared WebAudio context for both SFX and music — browsers cap how many
 * AudioContexts a page may create, and sharing one means an SFX click (which
 * always happens inside a user gesture) also resumes music playback.
 */
let ctx: AudioContext | null = null;

interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const AudioCtor = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      ctx = AudioCtor ? new AudioCtor() : null;
    } catch {
      ctx = null;
    }
  }
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}
