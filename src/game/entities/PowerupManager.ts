/**
 * PowerupManager — tracks the single active powerup (only one at a time),
 * its timer/HUD bar, and the gameplay modifiers other systems should query
 * (speed, gravity, jump boost, magnet, floating) instead of reading state directly.
 */
import Phaser from "phaser";
import { POWERUP_COLOR, POWERUP_DURATION_MS, type PowerupId } from "../config";
import { SFX } from "../sfx";
import { floatText } from "../fx";
import type { Player } from "./Player";

export class PowerupManager {
  private active: { id: PowerupId; until: number } | null = null;
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
  get shieldOn() {
    return this.active?.id === "shield";
  }

  activate(id: PowerupId) {
    SFX.power();
    if (this.active) this.end();
    this.active = { id, until: this.scene.time.now + POWERUP_DURATION_MS[id] };
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

  /** Checks expiry and redraws the HUD timer bar. Call once per frame. */
  update() {
    if (!this.active) return;
    const now = this.scene.time.now;
    if (now > this.active.until) {
      this.end();
      return;
    }
    if (!this.hudBar) return;
    const total = POWERUP_DURATION_MS[this.active.id];
    const remain = Math.max(0, this.active.until - now) / total;
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
