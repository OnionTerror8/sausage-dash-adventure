/**
 * PowerupManager — tracks the single active powerup (only one at a time),
 * its timer/HUD bar, and the gameplay modifiers other systems should query
 * (speed, gravity, jump boost, magnet, floating) instead of reading state directly.
 */
import Phaser from "phaser";
import { POWERUP_COLOR, POWERUP_DURATION_MS, type PowerupId } from "../config";
import { SFX } from "../sfx";
import { HAPTICS } from "../haptics";
import { floatText } from "../fx";
import type { Player } from "./Player";

export class PowerupManager {
  // Tracks remaining duration rather than an absolute expiry timestamp, and
  // is only ticked down from GameScene.update() (which itself skips entirely
  // while paused) — so opening the Pause overlay can no longer burn through
  // a powerup's duration in real time while nothing is happening on screen.
  private active: { id: PowerupId; remainingMs: number } | null = null;
  private hudBar?: Phaser.GameObjects.Graphics;

  constructor(
    private scene: Phaser.Scene,
    private player: Player,
  ) {}

  get id(): PowerupId | undefined {
    return this.active?.id;
  }

  get speedMultiplier() {
    return this.active?.id === "skates" ? 1.15 : 1;
  }
  get gravityScale() {
    return this.active?.id === "balloon" ? 0.35 : 1;
  }
  get jumpBoost() {
    return this.active?.id === "superjump" ? 1.35 : 1;
  }
  get canFloat() {
    return this.active?.id === "balloon";
  }
  get magnetOn() {
    return this.active?.id === "magnet";
  }
  /** Tiny shrinks the sausage visually — the hit radius should shrink to match,
   *  so the powerup's implied "smaller = easier to dodge" is actually true. */
  get hitboxScale() {
    return this.active?.id === "tiny" ? 0.55 : 1;
  }
  get shieldOn() {
    return this.active?.id === "shield";
  }

  activate(id: PowerupId) {
    SFX.power();
    HAPTICS.powerup();
    if (this.active) this.end();
    this.active = { id, remainingMs: POWERUP_DURATION_MS[id] };
    floatText(
      this.scene,
      id.toUpperCase() + "!",
      this.player.x,
      this.player.y - 70,
      POWERUP_COLOR[id],
      28,
    );

    if (id === "tiny") this.player.setTiny(true);
    if (id === "shield") this.player.addShieldRing();
    this.hudBar = this.scene.add.graphics().setScrollFactor(0);
  }

  private end() {
    if (!this.active) return;
    if (this.active.id === "tiny") this.player.setTiny(false);
    if (this.active.id === "shield") this.player.removeShieldRing();
    this.hudBar?.destroy();
    this.hudBar = undefined;
    this.active = null;
  }

  /** Ticks the active powerup down and redraws the HUD timer bar. Call once
   *  per frame with the frame's deltaMs — never called while paused, so time
   *  spent on the Pause overlay no longer counts against the duration. */
  update(deltaMs: number) {
    if (!this.active) return;
    this.active.remainingMs -= deltaMs;
    if (this.active.remainingMs <= 0) {
      this.end();
      return;
    }
    if (!this.hudBar) return;
    const total = POWERUP_DURATION_MS[this.active.id];
    const remain = this.active.remainingMs / total;
    this.hudBar.clear();
    this.hudBar.fillStyle(0xffffff, 0.5);
    this.hudBar.fillRoundedRect(20, 80, 220, 18, 8);
    this.hudBar.fillStyle(POWERUP_COLOR[this.active.id], 1);
    this.hudBar.fillRoundedRect(20, 80, 220 * remain, 18, 8);
  }

  destroy() {
    this.end();
  }
}
