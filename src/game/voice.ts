/**
 * Tiny procedural "voice bark" helper — short wordless exclamations layered
 * on top of the existing SFX tones ("Wheee!", "Yay!", "Brr!"). Pre-readers
 * can't read "+1"/"Ouch!" floatText, so a bit of vocal warmth carries the
 * emotional beat that text alone can't. No recorded audio, same procedural-
 * WebAudio philosophy as sfx.ts/music.ts — each bark is a short pitch
 * contour of quick syllable-like blips with a little vibrato, not real words.
 */
import { getAudioContext } from "./audio";

let muted = false;
let pitch = 1;

export function setVoiceMuted(m: boolean) {
  muted = m;
}

/** Same per-world pitch multiplier sfx.ts/music.ts use, so barks stay in
 *  character with whichever world is equipped. */
export function setVoicePitch(multiplier: number) {
  pitch = multiplier;
}

const BASE_HZ = 340;
const SYLLABLE_MS = 100;

/** One syllable-like blip: a short vibrato'd tone with a soft attack/decay,
 *  closer to a spoken "bark" than the flatter tones in sfx.ts. */
function syllable(freqRatio: number, durationMs = SYLLABLE_MS, gain = 0.1) {
  const a = getAudioContext();
  if (!a || muted) return;
  const freq = BASE_HZ * pitch * freqRatio;
  const dur = durationMs / 1000;
  const osc = a.createOscillator();
  const vibrato = a.createOscillator();
  const vibratoGain = a.createGain();
  const g = a.createGain();

  osc.type = "triangle";
  osc.frequency.value = freq;
  vibrato.frequency.value = 28;
  vibratoGain.gain.value = freq * 0.06;
  vibrato.connect(vibratoGain);
  vibratoGain.connect(osc.frequency);

  g.gain.setValueAtTime(0.0001, a.currentTime);
  g.gain.exponentialRampToValueAtTime(gain, a.currentTime + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);

  osc.connect(g);
  g.connect(a.destination);
  vibrato.start();
  osc.start();
  vibrato.stop(a.currentTime + dur + 0.02);
  osc.stop(a.currentTime + dur + 0.02);
}

export type BarkKind = "cheer" | "hurt" | "cold" | "powerup";

// Pitch contours (relative to BASE_HZ) that read as a warm, wordless exclamation.
const BARKS: Record<BarkKind, number[]> = {
  cheer: [1, 1.3, 1.7], // rising "Yay!"
  hurt: [1.4, 1.0], // short dip, "Ow!"
  cold: [1.15, 1.35, 1.15, 1.35], // shivery "Brr!"
  powerup: [1, 1.5, 2.0], // bright, excited "Wheee!"
};

export const VOICE = {
  bark(kind: BarkKind) {
    BARKS[kind].forEach((ratio, i) => {
      setTimeout(() => syllable(ratio), i * SYLLABLE_MS);
    });
  },
};
