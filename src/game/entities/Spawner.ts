/**
 * Spawner — owns the pool of on-screen pieces (coins, hazards, powerups, specials),
 * decides what to spawn next, and moves/magnet-attracts/culls them each frame.
 * Collision resolution itself stays with the caller via the `onCollide` callback,
 * since only GameScene knows how a collision should affect coins/score/player.
 */
import Phaser from "phaser";
import {
  GAME_WIDTH,
  GROUND_Y,
  PLAYER,
  POWERUPS,
  POWERUP_COLOR,
  SPAWN,
  type PowerupId,
} from "../config";
import { SFX } from "../sfx";
import { floatText } from "../fx";
import { getHazardById, pickRandomHazard, type HazardDef } from "../obstacles";
import type { DifficultyManager } from "../difficulty";

export type Kind = "coin" | "hazard" | "power" | "star" | "bean" | "ketchup" | "balloon";

export interface Piece extends Phaser.GameObjects.Container {
  kind: Kind;
  power?: PowerupId;
  hazardHot?: boolean;
  hitR: number;
}

export class Spawner {
  readonly pieces: Piece[] = [];
  private nextSpawn = 400;
  private nextCoinRain = SPAWN.coinRainEveryMs;

  constructor(
    private scene: Phaser.Scene,
    private difficulty: DifficultyManager,
    private chillMode = false,
  ) {}

  /** Advance spawn timers, creating new groups/coin-rain as they come due. */
  tick(deltaMs: number) {
    this.nextSpawn -= deltaMs;
    if (this.nextSpawn <= 0) {
      this.spawnGroup();
      this.nextSpawn = this.difficulty.spawnGapMs + Math.random() * 500;
    }

    this.nextCoinRain -= deltaMs;
    if (this.nextCoinRain <= 0) {
      this.spawnCoinRain();
      this.nextCoinRain = SPAWN.coinRainEveryMs;
    }
  }

  /** Move pieces, apply magnet attraction, resolve collisions, and cull off-screen pieces. */
  update(
    dt: number,
    speed: number,
    magnetOn: boolean,
    px: number,
    py: number,
    onCollide: (p: Piece) => void,
  ) {
    for (let i = this.pieces.length - 1; i >= 0; i--) {
      const p = this.pieces[i];
      p.x -= speed * dt;

      if (magnetOn && (p.kind === "coin" || p.kind === "star" || p.kind === "bean")) {
        const dx = px - p.x,
          dy = py - p.y;
        const d = Math.hypot(dx, dy);
        if (d < 220) {
          p.x += (dx / d) * 420 * dt;
          p.y += (dy / d) * 420 * dt;
        }
      }

      const dx = p.x - px,
        dy = p.y - py;
      if (Math.hypot(dx, dy) < p.hitR + PLAYER.radius - 8) {
        onCollide(p);
      }

      if (p.x < -120 && p.active) {
        this.remove(p);
      }
    }
  }

  remove(p: Piece) {
    const idx = this.pieces.indexOf(p);
    if (idx >= 0) this.pieces.splice(idx, 1);
    p.destroy();
  }

  reset() {
    this.pieces.splice(0).forEach((p) => p.destroy());
    this.nextSpawn = 400;
    this.nextCoinRain = SPAWN.coinRainEveryMs;
  }

  // ---------- Spawning ----------
  private spawnGroup() {
    // Choose one thing per group so combos stay easy.
    const r = Math.random();
    if (r < 0.15) return this.spawnPowerup();
    // Chill Mode: hazards never spawn — that probability slice becomes more coins instead.
    if (!this.chillMode && r < 0.15 + SPAWN.hazardChance * 0.7) return this.spawnHazard();
    return this.spawnCoinTrail();
  }

  private spawnCoinTrail() {
    const [lo, hi] = this.difficulty.coinTrailLen;
    const len = Phaser.Math.Between(lo, hi);
    const baseY = Phaser.Math.Between(GROUND_Y - 200, GROUND_Y - 80);
    const arc = Math.random() < 0.5;
    for (let i = 0; i < len; i++) {
      const x = GAME_WIDTH + 100 + i * 56;
      const y = arc ? baseY - Math.sin((i / (len - 1 || 1)) * Math.PI) * 60 : baseY;
      const specialR = Math.random();
      let kind: Kind = "coin";
      if (specialR < 0.06) kind = "star";
      else if (specialR < 0.12) kind = "bean";
      else if (specialR < 0.16) kind = "ketchup";
      else if (specialR < 0.19) kind = "balloon";
      this.makePiece(x, y, kind);
    }
  }

  private spawnCoinRain() {
    for (let i = 0; i < 22; i++) {
      const x = GAME_WIDTH + 40 + i * 42 + Math.random() * 20;
      const y = 60 + Math.random() * 200;
      this.makePiece(x, y, "coin");
    }
    floatText(this.scene, "Coin Rain!", GAME_WIDTH / 2, 130, 0xffcf3a);
    SFX.cheer();
  }

  private spawnHazard() {
    const def = pickRandomHazard(
      Math.random() < 0.5 ? "hot" : "cold",
      this.difficulty.hazardVariety,
    );
    const x = GAME_WIDTH + 100;
    const y = GROUND_Y - 30 + (def.yOffset ?? 0);
    this.makePiece(x, y, "hazard", { hazardId: def.id });
  }

  private spawnPowerup() {
    const id = POWERUPS[Phaser.Math.Between(0, POWERUPS.length - 1)];
    const x = GAME_WIDTH + 100;
    const y = Phaser.Math.Between(GROUND_Y - 220, GROUND_Y - 80);
    this.makePiece(x, y, "power", { power: id });
  }

  private makePiece(
    x: number,
    y: number,
    kind: Kind,
    opts: { power?: PowerupId; hazardId?: string } = {},
  ): Piece {
    const scene = this.scene;
    const c = scene.add.container(x, y) as Piece;
    c.kind = kind;
    c.hitR = 22;
    if (kind === "coin") {
      const img = scene.add.image(0, 0, "coin");
      c.add(img);
      scene.tweens.add({
        targets: img,
        scaleX: { from: 1, to: 0.4 },
        yoyo: true,
        repeat: -1,
        duration: 500,
      });
    } else if (kind === "star") {
      const img = scene.add.image(0, 0, "star");
      c.add(img);
      scene.tweens.add({ targets: img, angle: 360, repeat: -1, duration: 2000 });
      c.hitR = 24;
    } else if (kind === "bean") {
      c.add(scene.add.image(0, 0, "jellybean").setTint(Phaser.Display.Color.RandomRGB().color));
    } else if (kind === "ketchup") {
      c.add(scene.add.image(0, 0, "ketchup"));
      c.hitR = 26;
    } else if (kind === "balloon") {
      const img = scene.add
        .image(0, 0, "balloon_c")
        .setTint(Phaser.Display.Color.RandomRGB(120, 255).color);
      c.add(img);
      scene.tweens.add({
        targets: c,
        y: c.y - 18,
        yoyo: true,
        repeat: -1,
        duration: 1200,
        ease: "sine.inOut",
      });
      c.hitR = 24;
    } else if (kind === "hazard") {
      const def = getHazardById(opts.hazardId!);
      c.hazardHot = def.group === "hot";
      const img = scene.add.image(0, 0, def.textureKey);
      c.add(img);
      c.hitR = def.hitR;
      this.animateHazard(c, img, def);
    } else if (kind === "power") {
      c.power = opts.power;
      const ring = scene.add.image(0, 0, "powerup").setTint(POWERUP_COLOR[opts.power!]);
      c.add(ring);
      const inner = scene.add.circle(0, 0, 14, POWERUP_COLOR[opts.power!]);
      c.add(inner);
      scene.tweens.add({ targets: ring, angle: 360, repeat: -1, duration: 2600 });
      scene.tweens.add({
        targets: c,
        scale: { from: 1, to: 1.15 },
        yoyo: true,
        repeat: -1,
        duration: 500,
      });
      c.hitR = 28;
    }
    this.pieces.push(c);
    return c;
  }

  /** Gives a hazard piece its per-type animation, plus an optional periodic steam/snow puff. */
  private animateHazard(c: Piece, img: Phaser.GameObjects.Image, def: HazardDef) {
    const scene = this.scene;
    switch (def.anim) {
      case "wiggle":
        scene.tweens.add({
          targets: img,
          angle: { from: -8, to: 8 },
          yoyo: true,
          repeat: -1,
          duration: 400,
        });
        break;
      case "bob":
        scene.tweens.add({ targets: c, y: c.y - 6, yoyo: true, repeat: -1, duration: 900 });
        break;
      case "pulse":
        scene.tweens.add({
          targets: img,
          scale: { from: 1, to: 1.08 },
          yoyo: true,
          repeat: -1,
          duration: 500,
        });
        break;
      case "shimmer":
        scene.tweens.add({
          targets: img,
          alpha: { from: 1, to: 0.75 },
          yoyo: true,
          repeat: -1,
          duration: 700,
        });
        break;
    }

    if (def.puffColor) {
      const puffColor = def.puffColor;
      const timer = scene.time.addEvent({
        delay: 450,
        loop: true,
        callback: () => {
          const puff = scene.add
            .image(c.x, c.y - 16, "sparkle")
            .setTint(puffColor)
            .setAlpha(0.8)
            .setScale(0.6);
          scene.tweens.add({
            targets: puff,
            y: puff.y - 22,
            alpha: 0,
            duration: 550,
            onComplete: () => puff.destroy(),
          });
        },
      });
      c.once(Phaser.GameObjects.Events.DESTROY, () => timer.remove());
    }
  }
}
