/**
 * Tiny procedural sound-effect helper using WebAudio.
 * No audio files needed — keeps the build small and load instant.
 */

let ctx: AudioContext | null = null;
let muted = false;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      ctx = null;
    }
  }
  return ctx;
}

export function setSoundMuted(m: boolean) {
  muted = m;
}

function tone(freq: number, duration = 0.12, type: OscillatorType = "sine", gain = 0.15) {
  if (muted) return;
  const a = ac();
  if (!a) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + duration);
  osc.connect(g);
  g.connect(a.destination);
  osc.start();
  osc.stop(a.currentTime + duration);
}

export const SFX = {
  coin: () => {
    tone(880, 0.08, "square", 0.12);
    setTimeout(() => tone(1320, 0.08, "square", 0.1), 40);
  },
  jump: () => tone(520, 0.12, "sine", 0.14),
  ouch: () => {
    tone(220, 0.14, "sawtooth", 0.14);
    setTimeout(() => tone(150, 0.14, "sawtooth", 0.1), 60);
  },
  power: () => {
    tone(660, 0.09, "triangle", 0.15);
    setTimeout(() => tone(990, 0.09, "triangle", 0.15), 60);
    setTimeout(() => tone(1320, 0.14, "triangle", 0.15), 120);
  },
  click: () => tone(700, 0.06, "square", 0.1),
  cheer: () => {
    tone(700, 0.1, "sine", 0.14);
    setTimeout(() => tone(900, 0.1, "sine", 0.14), 80);
    setTimeout(() => tone(1200, 0.16, "sine", 0.14), 160);
  },
};
