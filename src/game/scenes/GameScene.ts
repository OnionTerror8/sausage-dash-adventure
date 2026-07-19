/**
 * GameScene — the actual endless runner.
 *
 * Responsibilities:
 *   - Parallax world rendering (from active theme)
 *   - Player physics + jump
 *   - Obstacle / coin / powerup spawner with a difficulty ramp
 *   - Collision handling (never game-over: just bounce + coin loss)
 *   - HUD + pause overlay
 *   - Autosave of coins & best score
 */
import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT, GROUND_Y, PLAYER, SPEED, SPAWN,
  POWERUPS, POWERUP_COLOR, POWERUP_DURATION_MS, type PowerupId } from "../config";
import { loadSave, updateSave } from "../storage";
import { getWorld } from "../worlds";
import { drawSausage } from "../render";
import { SFX } from "../sfx";

type Kind = "coin" | "hazard" | "power" | "star" | "bean" | "ketchup" | "balloon";

interface Piece extends Phaser.GameObjects.Container {
  kind: Kind;
  power?: PowerupId;
  hazardHot?: boolean;
  hitR: number;
}

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private playerVy = 0;
  private onGround = true;
  private speed = SPEED.start;

  private pieces: Piece[] = [];
  private nextSpawn = 0;
  private nextCoinRain = 0;
  private elapsed = 0;
  private lastHitAt = -9999;

  private hudCoins!: Phaser.GameObjects.Text;
  private hudScore!: Phaser.GameObjects.Text;
  private hudPowerBar?: Phaser.GameObjects.Graphics;

  private runCoins = 0;
  private score = 0;
  private paused = false;

  private layers: Phaser.GameObjects.TileSprite[] = [];
  private activePower: { id: PowerupId; until: number } | null = null;
  private shieldRing?: Phaser.GameObjects.Graphics;

  private worldTheme = getWorld();

  constructor() { super("Game"); }

  create() {
    const save = loadSave();
    this.worldTheme = getWorld(save.equipped.theme);
    this.runCoins = 0;
    this.score = 0;
    this.elapsed = 0;
    this.speed = SPEED.start;
    this.pieces = [];
    this.nextSpawn = 400;
    this.nextCoinRain = SPAWN.coinRainEveryMs;
    this.activePower = null;
    this.paused = false;
    this.lastHitAt = -9999;

    this.buildBackground();
    this.buildPlayer(save.equipped);
    this.buildHud();

    // Input
    this.input.on("pointerdown", () => this.tryJump());
    this.input.keyboard?.on("keydown-SPACE", () => this.tryJump());
    this.input.keyboard?.on("keydown-UP", () => this.tryJump());
    this.input.keyboard?.on("keydown-ESC", () => this.togglePause());

    // Cheerful entry
    this.cameras.main.flash(300, 255, 255, 255);
  }

  // ---------- Setup ----------
  private buildBackground() {
    const w = GAME_WIDTH, h = GAME_HEIGHT, t = this.worldTheme;
    const sky = this.add.graphics();
    sky.fillGradientStyle(t.sky[0], t.sky[0], t.sky[1], t.sky[1], 1);
    sky.fillRect(0, 0, w, h);

    // parallax cloud strip
    const cloudLayer = this.makeStripTexture("clouds_" + t.id, w, 140, () => {
      const g = this.add.graphics().setVisible(false);
      for (let i = 0; i < 4; i++) {
        const cx = 60 + i * 240 + Math.random() * 60;
        const cy = 40 + Math.random() * 60;
        g.fillStyle(t.cloud, 1);
        g.fillCircle(cx, cy, 22);
        g.fillCircle(cx + 22, cy - 8, 28);
        g.fillCircle(cx + 46, cy, 22);
      }
      return g;
    });
    const clouds = this.add.tileSprite(0, 60, w, 140, cloudLayer).setOrigin(0, 0);
    this.layers.push(clouds);

    // Hills mid
    const hills = this.makeStripTexture("hills_" + t.id, w, 180, () => {
      const g = this.add.graphics().setVisible(false);
      g.fillStyle(t.hill, 1);
      for (let x = -40; x < w + 40; x += 180) {
        g.fillEllipse(x + 90, 160, 260, 200);
      }
      return g;
    });
    const hillStrip = this.add.tileSprite(0, GROUND_Y - 120, w, 180, hills).setOrigin(0, 0);
    this.layers.push(hillStrip);

    // Ground
    const groundTex = this.makeStripTexture("ground_" + t.id, w, GAME_HEIGHT - GROUND_Y, () => {
      const g = this.add.graphics().setVisible(false);
      g.fillStyle(t.ground, 1);
      g.fillRect(0, 0, w, GAME_HEIGHT - GROUND_Y);
      g.fillStyle(t.groundAccent, 1);
      g.fillRect(0, 0, w, 10);
      for (let x = 0; x < w; x += 40) {
        g.fillStyle(t.groundAccent, 0.6);
        g.fillCircle(x + 20, 30 + (x % 60), 3);
      }
      return g;
    });
    const ground = this.add.tileSprite(0, GROUND_Y, w, GAME_HEIGHT - GROUND_Y, groundTex).setOrigin(0, 0);
    this.layers.push(ground);
  }

  private makeStripTexture(key: string, w: number, h: number, draw: () => Phaser.GameObjects.Graphics): string {
    if (this.textures.exists(key)) return key;
    const g = draw();
    g.generateTexture(key, w, h);
    g.destroy();
    return key;
  }

  private buildPlayer(equipped: ReturnType<typeof loadSave>["equipped"]) {
    this.player = this.add.container(PLAYER.startX, GROUND_Y - PLAYER.radius - 4);
    drawSausage(this, this.player, equipped);
    this.playerVy = 0;
    this.onGround = true;
  }

  private buildHud() {
    // Coin badge
    this.add.image(30, 30, "coin").setScale(1).setScrollFactor(0);
    this.hudCoins = this.add.text(56, 12, "0", {
      fontFamily: "'Fredoka',system-ui,sans-serif", fontSize: "34px", color: "#ffffff",
      stroke: "#6a4a1a", strokeThickness: 6,
    }).setScrollFactor(0);
    // Score
    this.hudScore = this.add.text(GAME_WIDTH / 2, 20, "0", {
      fontFamily: "'Fredoka',system-ui,sans-serif", fontSize: "32px", color: "#ffffff",
      stroke: "#333333", strokeThickness: 5,
    }).setOrigin(0.5, 0).setScrollFactor(0);

    // Pause button (big, top-right)
    const pw = 68;
    const px = GAME_WIDTH - pw / 2 - 16;
    const py = 40;
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.9);
    bg.fillRoundedRect(px - pw / 2, py - 26, pw, 52, 14);
    bg.fillStyle(0x5a5a5a, 1);
    bg.fillRect(px - 12, py - 14, 6, 28);
    bg.fillRect(px + 6, py - 14, 6, 28);
    const hit = this.add.rectangle(px, py, pw, 52, 0x000000, 0).setInteractive({ useHandCursor: true });
    hit.on("pointerdown", () => this.togglePause());
  }

  // ---------- Loop ----------
  update(_time: number, deltaMs: number) {
    if (this.paused) return;
    const dt = deltaMs / 1000;
    this.elapsed += deltaMs;

    // Difficulty ramp
    this.speed = Math.min(SPEED.max, SPEED.start + SPEED.rampPerSec * (this.elapsed / 1000));
    if (this.activePower?.id === "skates") this.speed *= 1.15;

    // Parallax
    this.layers[0].tilePositionX += this.speed * 0.15 * dt;
    this.layers[1].tilePositionX += this.speed * 0.5 * dt;
    this.layers[2].tilePositionX += this.speed * 1.0 * dt;

    // Player physics
    const grav = this.activePower?.id === "balloon" ? PLAYER.gravity * 0.35 : PLAYER.gravity;
    this.playerVy += grav * dt;
    this.player.y += this.playerVy * dt;
    const groundY = GROUND_Y - PLAYER.radius - 4;
    if (this.player.y >= groundY) {
      this.player.y = groundY;
      this.playerVy = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }
    // slight run bob
    this.player.rotation = Math.sin(this.elapsed / 100) * 0.05;

    // Score
    this.score += Math.round(this.speed * dt * 0.1);
    this.hudScore.setText(String(this.score));

    // Spawn
    this.nextSpawn -= deltaMs;
    if (this.nextSpawn <= 0) {
      this.spawnGroup();
      const base = Math.max(700, SPAWN.minGapMs - this.elapsed / 30);
      this.nextSpawn = base + Math.random() * 500;
    }

    this.nextCoinRain -= deltaMs;
    if (this.nextCoinRain <= 0) {
      this.spawnCoinRain();
      this.nextCoinRain = SPAWN.coinRainEveryMs;
    }

    // Move pieces + collide
    const magnetOn = this.activePower?.id === "magnet";
    const px = this.player.x, py = this.player.y;
    for (let i = this.pieces.length - 1; i >= 0; i--) {
      const p = this.pieces[i];
      p.x -= this.speed * dt;

      if (magnetOn && (p.kind === "coin" || p.kind === "star" || p.kind === "bean")) {
        const dx = px - p.x, dy = py - p.y;
        const d = Math.hypot(dx, dy);
        if (d < 220) {
          p.x += (dx / d) * 420 * dt;
          p.y += (dy / d) * 420 * dt;
        }
      }

      // Collision
      const dx = p.x - px, dy = p.y - py;
      if (Math.hypot(dx, dy) < p.hitR + PLAYER.radius - 8) {
        this.handleCollision(p);
      }

      if (p.x < -120) {
        p.destroy();
        this.pieces.splice(i, 1);
      }
    }

    // Power-up expiry
    if (this.activePower && this.time.now > this.activePower.until) {
      this.endPower();
    }

    if (this.hudPowerBar && this.activePower) {
      const t = this.time.now;
      const total = POWERUP_DURATION_MS[this.activePower.id];
      const remain = Math.max(0, this.activePower.until - t) / total;
      this.hudPowerBar.clear();
      this.hudPowerBar.fillStyle(0xffffff, 0.5);
      this.hudPowerBar.fillRoundedRect(20, 80, 220, 18, 8);
      this.hudPowerBar.fillStyle(POWERUP_COLOR[this.activePower.id], 1);
      this.hudPowerBar.fillRoundedRect(20, 80, 220 * remain, 18, 8);
    }
  }

  // ---------- Actions ----------
  private tryJump() {
    if (this.paused) return;
    const canJump = this.onGround || this.activePower?.id === "balloon";
    if (!canJump) return;
    const boost = this.activePower?.id === "superjump" ? 1.35 : 1.0;
    this.playerVy = PLAYER.jumpVelocity * boost;
    this.onGround = false;
    SFX.jump();
    this.tweens.add({ targets: this.player, scaleX: 0.85, scaleY: 1.15, duration: 100, yoyo: true });
  }

  private togglePause() {
    this.paused = !this.paused;
    if (this.paused) this.showPause(); else this.hidePause();
  }

  private pauseOverlay?: Phaser.GameObjects.Container;
  private showPause() {
    const w = GAME_WIDTH, h = GAME_HEIGHT;
    const c = this.add.container(0, 0).setScrollFactor(0).setDepth(1000);
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.45);
    bg.fillRect(0, 0, w, h);
    c.add(bg);
    const panel = this.add.graphics();
    panel.fillStyle(0xffffff, 0.98);
    panel.fillRoundedRect(w / 2 - 220, h / 2 - 160, 440, 320, 24);
    c.add(panel);
    const title = this.add.text(w / 2, h / 2 - 110, "Paused", {
      fontFamily: "'Fredoka',system-ui,sans-serif", fontSize: "48px", color: "#333333",
    }).setOrigin(0.5);
    c.add(title);
    const mkBtn = (y: number, label: string, color: number, cb: () => void) => {
      const btn = this.add.graphics();
      btn.fillStyle(color, 1);
      btn.fillRoundedRect(w / 2 - 140, y - 32, 280, 64, 18);
      c.add(btn);
      const t = this.add.text(w / 2, y, label, {
        fontFamily: "'Fredoka',system-ui,sans-serif", fontSize: "28px", color: "#ffffff",
        stroke: "#00000055", strokeThickness: 2,
      }).setOrigin(0.5);
      c.add(t);
      const hit = this.add.rectangle(w / 2, y, 280, 64, 0x000000, 0).setInteractive({ useHandCursor: true });
      hit.on("pointerdown", () => { SFX.click(); cb(); });
      c.add(hit);
    };
    mkBtn(h / 2 - 40, "Resume", 0x5fd07a, () => this.togglePause());
    mkBtn(h / 2 + 40, "Home", 0x66d6ff, () => {
      this.commitRun();
      this.scene.start("Title");
    });
    mkBtn(h / 2 + 120, "Shop", 0xffcf3a, () => {
      this.commitRun();
      this.scene.start("Shop");
    });
    this.pauseOverlay = c;
  }
  private hidePause() {
    this.pauseOverlay?.destroy();
    this.pauseOverlay = undefined;
  }

  // ---------- Spawner ----------
  private spawnGroup() {
    // Choose one thing per group so combos stay easy.
    const r = Math.random();
    if (r < 0.15) return this.spawnPowerup();
    if (r < 0.15 + SPAWN.hazardChance * 0.7) return this.spawnHazard();
    return this.spawnCoinTrail();
  }

  private spawnCoinTrail() {
    const [lo, hi] = SPAWN.coinTrailLen;
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
    this.floatText("Coin Rain!", GAME_WIDTH / 2, 130, 0xffcf3a);
    SFX.cheer();
  }

  private spawnHazard() {
    const hot = Math.random() < 0.5;
    const x = GAME_WIDTH + 100;
    const y = GROUND_Y - 30;
    this.makePiece(x, y, "hazard", { hot });
  }

  private spawnPowerup() {
    const id = POWERUPS[Phaser.Math.Between(0, POWERUPS.length - 1)];
    const x = GAME_WIDTH + 100;
    const y = Phaser.Math.Between(GROUND_Y - 220, GROUND_Y - 80);
    this.makePiece(x, y, "power", { power: id });
  }

  private makePiece(
    x: number, y: number, kind: Kind,
    opts: { power?: PowerupId; hot?: boolean } = {},
  ): Piece {
    const c = this.add.container(x, y) as Piece;
    c.kind = kind;
    c.hitR = 22;
    if (kind === "coin") {
      const img = this.add.image(0, 0, "coin");
      c.add(img);
      this.tweens.add({ targets: img, scaleX: { from: 1, to: 0.4 }, yoyo: true, repeat: -1, duration: 500 });
    } else if (kind === "star") {
      const img = this.add.image(0, 0, "star");
      c.add(img);
      this.tweens.add({ targets: img, angle: 360, repeat: -1, duration: 2000 });
      c.hitR = 24;
    } else if (kind === "bean") {
      c.add(this.add.image(0, 0, "jellybean").setTint(Phaser.Display.Color.RandomRGB().color));
    } else if (kind === "ketchup") {
      c.add(this.add.image(0, 0, "ketchup"));
      c.hitR = 26;
    } else if (kind === "balloon") {
      const img = this.add.image(0, 0, "balloon_c").setTint(Phaser.Display.Color.RandomRGB(120, 255).color);
      c.add(img);
      this.tweens.add({ targets: c, y: c.y - 18, yoyo: true, repeat: -1, duration: 1200, ease: "sine.inOut" });
      c.hitR = 24;
    } else if (kind === "hazard") {
      c.hazardHot = !!opts.hot;
      const img = this.add.image(0, 0, opts.hot ? "hot" : "cold");
      c.add(img);
      c.hitR = 26;
      if (opts.hot) {
        // wiggle
        this.tweens.add({ targets: img, angle: { from: -8, to: 8 }, yoyo: true, repeat: -1, duration: 400 });
      } else {
        this.tweens.add({ targets: c, y: c.y - 6, yoyo: true, repeat: -1, duration: 900 });
      }
    } else if (kind === "power") {
      c.power = opts.power;
      const ring = this.add.image(0, 0, "powerup").setTint(POWERUP_COLOR[opts.power!]);
      c.add(ring);
      const inner = this.add.circle(0, 0, 14, POWERUP_COLOR[opts.power!]);
      c.add(inner);
      this.tweens.add({ targets: ring, angle: 360, repeat: -1, duration: 2600 });
      this.tweens.add({ targets: c, scale: { from: 1, to: 1.15 }, yoyo: true, repeat: -1, duration: 500 });
      c.hitR = 28;
    }
    this.pieces.push(c);
    return c;
  }

  // ---------- Collisions ----------
  private handleCollision(p: Piece) {
    if (p.kind === "coin" || p.kind === "star" || p.kind === "bean" || p.kind === "ketchup" || p.kind === "balloon") {
      const value = p.kind === "star" ? 5 : p.kind === "ketchup" ? 3 : p.kind === "balloon" ? 3 : p.kind === "bean" ? 2 : 1;
      this.runCoins += value;
      this.hudCoins.setText(String(this.runCoins));
      SFX.coin();
      this.burst(p.x, p.y, 0xffe082, 10);
      this.floatText(`+${value}`, p.x, p.y - 20, 0xfff29a, 20);
      p.destroy();
      this.pieces.splice(this.pieces.indexOf(p), 1);
      return;
    }
    if (p.kind === "power") {
      this.activatePower(p.power!);
      this.burst(p.x, p.y, POWERUP_COLOR[p.power!], 20);
      p.destroy();
      this.pieces.splice(this.pieces.indexOf(p), 1);
      return;
    }
    if (p.kind === "hazard") {
      // Shield / invuln
      if (this.activePower?.id === "shield") {
        this.burst(p.x, p.y, 0xffffff, 20);
        p.destroy();
        this.pieces.splice(this.pieces.indexOf(p), 1);
        return;
      }
      if (this.time.now - this.lastHitAt < PLAYER.invulnMs) return;
      this.lastHitAt = this.time.now;

      const loss = Math.min(PLAYER.hitCoinLoss, this.runCoins);
      this.runCoins = Math.max(0, this.runCoins - loss);
      this.hudCoins.setText(String(this.runCoins));

      SFX.ouch();
      this.floatText("Ouch!", this.player.x, this.player.y - 60, 0xff6060, 28);
      this.burst(p.x, p.y, p.hazardHot ? 0xffa040 : 0xa0e0ff, 16);

      // Bounce back
      this.playerVy = -400;
      this.tweens.add({
        targets: this.player, x: this.player.x - PLAYER.bounceBack,
        duration: 220, ease: "back.out", yoyo: false,
      });
      // flash invuln
      this.tweens.add({
        targets: this.player, alpha: 0.4, yoyo: true, repeat: 4, duration: 120,
        onComplete: () => this.player.setAlpha(1),
      });

      p.destroy();
      this.pieces.splice(this.pieces.indexOf(p), 1);
    }
  }

  // ---------- Powerups ----------
  private activatePower(id: PowerupId) {
    SFX.power();
    if (this.activePower) this.endPower();
    this.activePower = { id, until: this.time.now + POWERUP_DURATION_MS[id] };
    this.floatText(id.toUpperCase() + "!", this.player.x, this.player.y - 70, POWERUP_COLOR[id], 28);

    if (id === "tiny") this.player.setScale(0.55);
    if (id === "shield") {
      this.shieldRing = this.add.graphics();
      this.shieldRing.lineStyle(6, 0xffd83a, 0.85);
      this.shieldRing.strokeCircle(0, 0, 54);
      this.player.add(this.shieldRing);
    }
    this.hudPowerBar = this.add.graphics().setScrollFactor(0);
  }
  private endPower() {
    if (!this.activePower) return;
    if (this.activePower.id === "tiny") this.player.setScale(1);
    if (this.activePower.id === "shield") this.shieldRing?.destroy();
    this.hudPowerBar?.destroy();
    this.hudPowerBar = undefined;
    this.activePower = null;
  }

  // ---------- FX ----------
  private burst(x: number, y: number, color: number, count = 12) {
    for (let i = 0; i < count; i++) {
      const p = this.add.image(x, y, "sparkle").setTint(color).setScale(1 + Math.random());
      const a = Math.random() * Math.PI * 2;
      const d = 30 + Math.random() * 70;
      this.tweens.add({
        targets: p,
        x: x + Math.cos(a) * d,
        y: y + Math.sin(a) * d,
        alpha: 0, scale: 0.2,
        duration: 500 + Math.random() * 300,
        onComplete: () => p.destroy(),
      });
    }
  }
  private floatText(msg: string, x: number, y: number, color = 0xffffff, size = 22) {
    const t = this.add.text(x, y, msg, {
      fontFamily: "'Fredoka',system-ui,sans-serif", fontSize: `${size}px`,
      color: "#" + color.toString(16).padStart(6, "0"),
      stroke: "#00000055", strokeThickness: 3,
    }).setOrigin(0.5);
    this.tweens.add({ targets: t, y: y - 60, alpha: 0, duration: 900, onComplete: () => t.destroy() });
  }

  // ---------- Autosave ----------
  private commitRun() {
    updateSave((d) => {
      d.totalCoins += this.runCoins;
      if (this.score > d.bestScore) d.bestScore = this.score;
    });
    this.runCoins = 0;
  }

  shutdown() {
    this.commitRun();
  }
}
