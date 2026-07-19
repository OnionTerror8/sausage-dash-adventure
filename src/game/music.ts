/**
 * MusicManager — a tiny procedural background-music player (no audio files,
 * same philosophy as sfx.ts). Picks a random cheerful phrase each bar instead
 * of looping one fixed melody, so it stays pleasant on a long play session.
 * Mute is independent of SFX (settings.music vs settings.sound).
 */
import { getAudioContext } from "./audio";

// Short phrases as semitone offsets from a root note — mix-and-match keeps
// the loop from feeling like the same 4 bars over and over.
const PHRASES: number[][] = [
  [0, 4, 7, 12, 7, 4],
  [0, 3, 7, 10, 7, 3],
  [7, 4, 0, 4, 7, 12],
  [0, 2, 4, 7, 4, 2],
  [12, 9, 7, 4, 0, 4],
];

const ROOT_HZ = 261.63; // C4
const NOTE_MS = 260;
const NOTE_GAIN = 0.045;

function noteFreq(semitone: number) {
  return ROOT_HZ * Math.pow(2, semitone / 12);
}

class MusicManager {
  private muted = true;
  private playing = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  setMuted(m: boolean) {
    this.muted = m;
    if (m) this.stop();
    else this.start();
  }

  start() {
    if (this.playing || this.muted) return;
    this.playing = true;
    this.scheduleNext();
  }

  stop() {
    this.playing = false;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  private scheduleNext() {
    if (!this.playing) return;
    const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
    this.playPhrase(phrase);
    this.timer = setTimeout(() => this.scheduleNext(), phrase.length * NOTE_MS);
  }

  private playPhrase(phrase: number[]) {
    const ctx = getAudioContext();
    if (!ctx) return;
    phrase.forEach((semitone, i) => {
      const startAt = ctx.currentTime + (i * NOTE_MS) / 1000;
      const endAt = startAt + NOTE_MS / 1000;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = noteFreq(semitone);
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(NOTE_GAIN, startAt + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, endAt - 0.02);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startAt);
      osc.stop(endAt);
    });
  }
}

export const MUSIC = new MusicManager();
