/**
 * DifficultyManager — the single source of truth for how a run gets more
 * interesting over time. Deliberately splits "variety" (obstacle types,
 * coin pattern richness — these grow) from "raw difficulty" (speed, spawn
 * gap — these creep up slowly and stay capped), per the game's forgiving,
 * never-punishing design goal.
 *
 * Tune progression by editing DIFFICULTY_TIERS; nothing else needs to change.
 */
import { SPAWN, SPEED } from "./config";

export interface DifficultyTier {
  /** Elapsed run time (ms) after which this tier becomes active. */
  atMs: number;
  /** How many hazard types (in unlock order, hot/cold each) are in play. */
  hazardVariety: number;
  /** Coin trail length range for this tier. */
  coinTrailLen: [number, number];
  /** Chance a hazard spawn brings a second, different hazard alongside it —
   *  once all 5 hazard types are unlocked, this keeps the back half of a
   *  longer run feeling fresh via new *patterns* rather than raw new types
   *  or higher raw difficulty (variety, not punishment). */
  hazardPairChance: number;
}

export const DIFFICULTY_TIERS: DifficultyTier[] = [
  { atMs: 0, hazardVariety: 2, coinTrailLen: [3, 4], hazardPairChance: 0 },
  { atMs: 15000, hazardVariety: 3, coinTrailLen: [3, 5], hazardPairChance: 0 },
  { atMs: 40000, hazardVariety: 4, coinTrailLen: [4, 6], hazardPairChance: 0 },
  { atMs: 70000, hazardVariety: 5, coinTrailLen: SPAWN.coinTrailLen, hazardPairChance: 0 },
  { atMs: 100000, hazardVariety: 5, coinTrailLen: SPAWN.coinTrailLen, hazardPairChance: 0.35 },
];

export class DifficultyManager {
  private elapsedMs = 0;

  update(deltaMs: number) {
    this.elapsedMs += deltaMs;
  }

  get elapsed() {
    return this.elapsedMs;
  }

  private get tier(): DifficultyTier {
    let current = DIFFICULTY_TIERS[0];
    for (const t of DIFFICULTY_TIERS) {
      if (this.elapsedMs >= t.atMs) current = t;
    }
    return current;
  }

  /** More obstacle variety unlocks over time; how often they appear does not. */
  get hazardVariety() {
    return this.tier.hazardVariety;
  }

  /** Coin trails get a little longer/richer over time. */
  get coinTrailLen(): [number, number] {
    return this.tier.coinTrailLen;
  }

  /** See DifficultyTier.hazardPairChance. */
  get hazardPairChance() {
    return this.tier.hazardPairChance;
  }

  /** Base forward speed — ramps slowly and is capped, never spikes. */
  get speed() {
    return Math.min(SPEED.max, SPEED.start + SPEED.rampPerSec * (this.elapsedMs / 1000));
  }

  /** Gap between spawn groups shrinks slowly with a floor, so pacing stays gentle. */
  get spawnGapMs() {
    return Math.max(700, SPAWN.minGapMs - this.elapsedMs / 30);
  }
}
