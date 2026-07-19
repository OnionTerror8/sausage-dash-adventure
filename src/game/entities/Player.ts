/**
 * Player — owns the sausage container, its physics (gravity/jump/ground clamp)
 * and its reaction animations (jump squash, hit bounce, tiny/shield cosmetics).
 * Extracted from GameScene so gameplay tuning and rendering don't fight for space.
 */
import Phaser from "phaser";
import { GROUND_Y, PLAYER } from "../config";
import { drawSausage } from "../render";
import { SFX } from "../sfx";
import type { SaveData } from "../storage";

export class Player {
  readonly container: Phaser.GameObjects.Container;
  vy = 0;
  onGround = true;
  private shieldRing?: Phaser.GameObjects.Graphics;

  constructor(
    private scene: Phaser.Scene,
    equipped: SaveData["equipped"],
  ) {
    this.container = scene.add.container(PLAYER.startX, GROUND_Y - PLAYER.radius - 4);
    drawSausage(scene, this.container, equipped);
  }

  get x() {
    return this.container.x;
  }
  get y() {
    return this.container.y;
  }

  /** Advance physics one tick. `gravityScale` lets powerups (balloon) soften gravity. */
  update(dt: number, elapsedMs: number, gravityScale = 1) {
    this.vy += PLAYER.gravity * gravityScale * dt;
    this.container.y += this.vy * dt;
    const groundY = GROUND_Y - PLAYER.radius - 4;
    if (this.container.y >= groundY) {
      this.container.y = groundY;
      this.vy = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }
    // slight run bob
    this.container.rotation = Math.sin(elapsedMs / 100) * 0.05;
  }

  /** `canFloat` lets balloon mode re-jump mid-air. Returns whether the jump happened. */
  jump(boost: number, canFloat: boolean): boolean {
    if (!this.onGround && !canFloat) return false;
    this.vy = PLAYER.jumpVelocity * boost;
    this.onGround = false;
    SFX.jump();
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 0.85,
      scaleY: 1.15,
      duration: 100,
      yoyo: true,
    });
    return true;
  }

  /** Funny bounce-back reaction on hazard collision (never a game over). */
  reactToHit() {
    this.vy = -400;
    this.scene.tweens.add({
      targets: this.container,
      x: this.container.x - PLAYER.bounceBack,
      duration: 220,
      ease: "back.out",
      yoyo: false,
    });
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0.4,
      yoyo: true,
      repeat: 4,
      duration: 120,
      onComplete: () => this.container.setAlpha(1),
    });
  }

  setTiny(on: boolean) {
    this.container.setScale(on ? 0.55 : 1);
  }

  addShieldRing() {
    this.shieldRing = this.scene.add.graphics();
    this.shieldRing.lineStyle(6, 0xffd83a, 0.85);
    this.shieldRing.strokeCircle(0, 0, 54);
    this.container.add(this.shieldRing);
  }

  removeShieldRing() {
    this.shieldRing?.destroy();
    this.shieldRing = undefined;
  }
}
