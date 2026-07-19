/**
 * Player — owns the sausage container, its physics (gravity/jump/ground clamp)
 * and its reaction animations (jump squash, hit bounce, coin excitement,
 * celebration spins, tiny/shield cosmetics).
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
  /** True while a celebration tween owns rotation, so the per-frame run-wobble backs off. */
  private celebrating = false;

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

    // Hazard bounce-back can never push the sausage past the left edge.
    if (this.container.x < PLAYER.minX) this.container.x = PLAYER.minX;

    // Happy running wobble — paused while a celebration tween is driving rotation.
    if (!this.celebrating) {
      this.container.rotation = Math.sin(elapsedMs / 100) * 0.05;
    }
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

  /** Funny bounce-back reaction on hazard collision (never a game over, never off-screen). */
  reactToHit() {
    this.vy = -400;
    const targetX = Math.max(PLAYER.minX, this.container.x - PLAYER.bounceBack);
    // Quick flinch squash before the spring-back bounce reads as "ouch, silly" not "hurt".
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1.2,
      scaleY: 0.8,
      duration: 90,
      yoyo: true,
    });
    this.scene.tweens.add({
      targets: this.container,
      x: targetX,
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

  /** Excited little pop when a coin/star/treat is collected. */
  celebrateCoin() {
    const s = this.container.scale;
    this.scene.tweens.add({
      targets: this.container,
      scaleX: { from: s * 1.18, to: s },
      scaleY: { from: s * 0.85, to: s },
      duration: 220,
      ease: "back.out",
    });
  }

  /** Bigger celebration for milestones/powerups: a full happy spin. */
  celebrate() {
    if (this.celebrating) return;
    this.celebrating = true;
    this.container.rotation = 0;
    this.scene.tweens.add({
      targets: this.container,
      angle: 360,
      duration: 500,
      ease: "cubic.out",
      onComplete: () => {
        this.container.angle = 0;
        this.celebrating = false;
      },
    });
    const s = this.container.scale;
    this.scene.tweens.add({
      targets: this.container,
      scaleX: { from: s * 1.25, to: s },
      scaleY: { from: s * 1.25, to: s },
      duration: 400,
      ease: "back.out",
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
