/**
 * GameScene — the actual endless runner. Now a thin orchestrator: it wires
 * together the Player, Spawner, PowerupManager and Hud modules, and owns the
 * bits that touch several of them at once (collisions, background, pause, save).
 *
 *   - Parallax world rendering (from active theme)
 *   - Player physics + jump                      -> entities/Player
 *   - Obstacle / coin / powerup spawner           -> entities/Spawner
 *   - Powerup timers + modifiers                  -> entities/PowerupManager
 *   - Collision handling (never game-over: just bounce + coin loss)
 *   - HUD + pause overlay                         -> ui/Hud
 *   - Autosave of coins & best score
 */
import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT, GROUND_Y, PLAYER, SPEED, POWERUP_COLOR } from "../config";
import { loadSave, updateSave } from "../storage";
import { getWorld, WORLDS, type WorldTheme } from "../worlds";
import { SFX, setSfxPitch } from "../sfx";
import { HAPTICS } from "../haptics";
import { burst, floatText } from "../fx";
import { Player } from "../entities/Player";
import { Spawner, type Piece } from "../entities/Spawner";
import { PowerupManager } from "../entities/PowerupManager";
import { DifficultyManager } from "../difficulty";
import { Hud } from "../ui/Hud";
import { drawIcon, type IconKind } from "../ui/icons";
import { drawBgMotif } from "../bgshapes";

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private spawner!: Spawner;
  private powerups!: PowerupManager;
  private difficulty!: DifficultyManager;
  private hud!: Hud;

  private speed = SPEED.start;
  private lastHitAt = -9999;

  private runCoins = 0;
  private score = 0;
  private nextMilestone = 100;
  private paused = false;
  private worldComplete = false;

  private layers: Phaser.GameObjects.TileSprite[] = [];
  private worldTheme: WorldTheme = getWorld();

  constructor() {
    super("Game");
  }

  create() {
    const save = loadSave();
    this.worldTheme = getWorld(save.equipped.theme);
    setSfxPitch(this.worldTheme.pitchMultiplier);
    this.runCoins = 0;
    this.score = 0;
    this.nextMilestone = 100;
    this.speed = SPEED.start;
    this.paused = false;
    this.worldComplete = false;
    this.lastHitAt = -9999;

    this.buildBackground();
    this.difficulty = new DifficultyManager();
    this.player = new Player(this, save.equipped);
    this.spawner = new Spawner(this, this.difficulty, save.settings.chillMode);
    this.powerups = new PowerupManager(this, this.player);
    this.hud = new Hud(
      this,
      () => this.togglePause(),
      this.worldTheme.accent,
      save.settings.chillMode,
    );

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
    const w = GAME_WIDTH,
      h = GAME_HEIGHT,
      t = this.worldTheme;
    const sky = this.add.graphics();
    sky.fillGradientStyle(t.sky[0], t.sky[0], t.sky[1], t.sky[1], 1);
    sky.fillRect(0, 0, w, h);

    // Distant per-world silhouette (candy canes, tents, balloons...), behind the clouds.
    const farLayer = this.makeStripTexture("far_" + t.id, w, 160, () => {
      const g = this.add.graphics().setVisible(false);
      for (let i = 0; i < 3; i++) {
        const cx = 80 + i * 320 + Math.random() * 40;
        const cy = 70 + Math.random() * 30;
        drawBgMotif(g, t.bgMotif, cx, cy, 26, t.accent);
      }
      return g;
    });
    const far = this.add.tileSprite(0, 40, w, 160, farLayer).setOrigin(0, 0).setAlpha(0.3);
    this.layers.push(far);

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
    const ground = this.add
      .tileSprite(0, GROUND_Y, w, GAME_HEIGHT - GROUND_Y, groundTex)
      .setOrigin(0, 0);
    this.layers.push(ground);
  }

  private makeStripTexture(
    key: string,
    w: number,
    h: number,
    draw: () => Phaser.GameObjects.Graphics,
  ): string {
    if (this.textures.exists(key)) return key;
    const g = draw();
    g.generateTexture(key, w, h);
    g.destroy();
    return key;
  }

  // ---------- Loop ----------
  update(_time: number, deltaMs: number) {
    if (this.paused) return;
    const dt = deltaMs / 1000;
    this.difficulty.update(deltaMs);

    // Difficulty ramp (speed/spawn-gap math lives in DifficultyManager)
    this.speed = this.difficulty.speed * this.powerups.speedMultiplier;

    // Parallax (far background, clouds, hills, ground — slowest to fastest)
    this.layers[0].tilePositionX += this.speed * 0.05 * dt;
    this.layers[1].tilePositionX += this.speed * 0.15 * dt;
    this.layers[2].tilePositionX += this.speed * 0.5 * dt;
    this.layers[3].tilePositionX += this.speed * 1.0 * dt;

    // Player physics
    this.player.update(dt, this.difficulty.elapsed, this.powerups.gravityScale);

    // Score + journey progress toward this world's finish line.
    // Accumulate as a float — rounding each frame's tiny fractional gain
    // (often < 0.5 at 60fps) before adding it up meant the score could go
    // an entire run without ever incrementing. Round only for display/save.
    this.score += this.speed * dt * 0.1;
    this.hud.setScore(Math.round(this.score));
    this.hud.setProgress(this.score / this.worldTheme.finishScore);
    if (this.score >= this.nextMilestone) {
      this.celebrateMilestone();
      this.nextMilestone += 100;
    }
    if (this.score >= this.worldTheme.finishScore) {
      this.worldComplete = true;
      this.paused = true;
      this.showWorldComplete();
      return;
    }

    // Spawn
    this.spawner.tick(deltaMs);

    // Move pieces + collide
    this.spawner.update(dt, this.speed, this.powerups.magnetOn, this.player.x, this.player.y, (p) =>
      this.handleCollision(p),
    );

    // Power-up expiry + HUD timer
    this.powerups.update();
  }

  // ---------- Actions ----------
  private tryJump() {
    if (this.paused) return;
    this.player.jump(this.powerups.jumpBoost, this.powerups.canFloat);
  }

  private togglePause() {
    if (this.worldComplete) return;
    this.paused = !this.paused;
    if (this.paused) this.showPause();
    else this.hidePause();
  }

  private pauseOverlay?: Phaser.GameObjects.Container;
  private showPause() {
    const w = GAME_WIDTH,
      h = GAME_HEIGHT;
    const c = this.add.container(0, 0).setScrollFactor(0).setDepth(1000);
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.45);
    bg.fillRect(0, 0, w, h);
    c.add(bg);
    const panel = this.add.graphics();
    panel.fillStyle(0xffffff, 0.98);
    panel.fillRoundedRect(w / 2 - 220, h / 2 - 160, 440, 320, 24);
    c.add(panel);
    const title = this.add
      .text(w / 2, h / 2 - 110, "Paused", {
        fontFamily: "'Fredoka',system-ui,sans-serif",
        fontSize: "48px",
        color: "#333333",
      })
      .setOrigin(0.5);
    c.add(title);
    const mkBtn = (y: number, label: string, color: number, icon: IconKind, cb: () => void) => {
      const btn = this.add.graphics();
      btn.fillStyle(color, 1);
      btn.fillRoundedRect(w / 2 - 140, y - 32, 280, 64, 18);
      c.add(btn);
      const t = this.add
        .text(0, y, label, {
          fontFamily: "'Fredoka',system-ui,sans-serif",
          fontSize: "28px",
          color: "#ffffff",
          stroke: "#00000055",
          strokeThickness: 2,
        })
        .setOrigin(0, 0.5);
      const iconSize = 20;
      const gap = iconSize * 2 + 10;
      const startX = w / 2 - (t.width + gap) / 2;
      const ig = this.add.graphics();
      drawIcon(ig, icon, startX + iconSize, y, iconSize, 0xffffff);
      c.add(ig);
      t.setPosition(startX + gap, y);
      c.add(t);
      const hit = this.add
        .rectangle(w / 2, y, 280, 64, 0x000000, 0)
        .setInteractive({ useHandCursor: true });
      hit.on("pointerdown", () => {
        SFX.click();
        cb();
      });
      c.add(hit);
    };
    mkBtn(h / 2 - 40, "Resume", 0x5fd07a, "play", () => this.togglePause());
    mkBtn(h / 2 + 40, "Home", 0x66d6ff, "home", () => {
      this.commitRun();
      this.scene.start("Title");
    });
    mkBtn(h / 2 + 120, "Shop", 0xffcf3a, "shop", () => {
      this.commitRun();
      this.scene.start("Shop");
    });
    this.pauseOverlay = c;
  }
  private hidePause() {
    this.pauseOverlay?.destroy();
    this.pauseOverlay = undefined;
  }

  // ---------- Collisions ----------
  private handleCollision(p: Piece) {
    if (
      p.kind === "coin" ||
      p.kind === "star" ||
      p.kind === "bean" ||
      p.kind === "ketchup" ||
      p.kind === "balloon"
    ) {
      const value =
        p.kind === "star"
          ? 5
          : p.kind === "ketchup"
            ? 3
            : p.kind === "balloon"
              ? 3
              : p.kind === "bean"
                ? 2
                : 1;
      this.runCoins += value;
      this.hud.setCoins(this.runCoins);
      SFX.coin();
      HAPTICS.coin();
      this.player.celebrateCoin();
      burst(this, p.x, p.y, 0xffe082, 10);
      floatText(this, `+${value}`, p.x, p.y - 20, 0xfff29a, 20);
      this.spawner.remove(p);
      return;
    }
    if (p.kind === "power") {
      this.powerups.activate(p.power!);
      this.player.celebrate();
      burst(this, p.x, p.y, POWERUP_COLOR[p.power!], 20);
      this.spawner.remove(p);
      return;
    }
    if (p.kind === "hazard") {
      // Shield / invuln
      if (this.powerups.shieldOn) {
        burst(this, p.x, p.y, 0xffffff, 20);
        this.spawner.remove(p);
        return;
      }
      if (this.time.now - this.lastHitAt < PLAYER.invulnMs) return;
      this.lastHitAt = this.time.now;

      const loss = Math.min(PLAYER.hitCoinLoss, this.runCoins);
      this.runCoins = Math.max(0, this.runCoins - loss);
      this.hud.setCoins(this.runCoins);

      SFX.ouch();
      HAPTICS.hit();
      floatText(this, "Ouch!", this.player.x, this.player.y - 60, 0xff6060, 28);
      burst(this, p.x, p.y, p.hazardHot ? 0xffa040 : 0xa0e0ff, 16);

      this.player.reactToHit();

      this.spawner.remove(p);
    }
  }

  // ---------- Celebrations ----------
  private celebrateMilestone() {
    this.player.celebrate();
    SFX.cheer();
    floatText(this, "Yay!", this.player.x, this.player.y - 70, 0xffd83a, 26);
    burst(this, this.player.x, this.player.y, 0xff9fd0, 14);
  }

  /** Journey Mode: reaching a world's finish line ends the run with a celebration
   *  instead of scaling forever — banks coins, grants a finish bonus, auto-unlocks
   *  the next world, and offers Play Again / Next World / Home. */
  private showWorldComplete() {
    this.player.celebrate();
    SFX.cheer();
    burst(this, this.player.x, this.player.y, this.worldTheme.accent, 30);
    floatText(this, "Yay!", this.player.x, this.player.y - 70, 0xffd83a, 26);

    const worldIdx = WORLDS.findIndex((w) => w.id === this.worldTheme.id);
    const nextWorld = WORLDS[worldIdx + 1];
    const FINISH_BONUS = 25;
    const bankedCoins = this.runCoins;
    const finalScore = Math.round(this.score);

    const saved = updateSave((d) => {
      d.totalCoins += bankedCoins + FINISH_BONUS;
      if (finalScore > d.bestScore) d.bestScore = finalScore;
      if (!d.completedWorlds.includes(this.worldTheme.id)) {
        d.completedWorlds.push(this.worldTheme.id);
      }
      if (nextWorld && !d.unlocked.includes(nextWorld.id)) {
        d.unlocked.push(nextWorld.id);
      }
    });
    this.runCoins = 0;
    this.hud.setCoins(0);

    const allWorldsDone = saved.completedWorlds.length === WORLDS.length;
    this.drawWorldCompleteOverlay(nextWorld, FINISH_BONUS, allWorldsDone);
  }

  private drawWorldCompleteOverlay(
    nextWorld: WorldTheme | undefined,
    bonus: number,
    allWorldsDone: boolean,
  ) {
    const w = GAME_WIDTH,
      h = GAME_HEIGHT;
    const c = this.add.container(0, 0).setScrollFactor(0).setDepth(1000);
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.45);
    bg.fillRect(0, 0, w, h);
    c.add(bg);
    const panel = this.add.graphics();
    panel.fillStyle(0xffffff, 0.98);
    panel.fillRoundedRect(w / 2 - 260, h / 2 - 210, 520, 420, 24);
    c.add(panel);

    const headline = allWorldsDone ? "World Tour Champion!" : "You did it!";
    const title = this.add
      .text(w / 2, h / 2 - 160, headline, {
        fontFamily: "'Fredoka',system-ui,sans-serif",
        fontSize: "38px",
        color: "#ff6a4a",
        align: "center",
        wordWrap: { width: 460 },
      })
      .setOrigin(0.5);
    c.add(title);

    const sub = this.add
      .text(w / 2, h / 2 - 100, `You reached ${this.worldTheme.landmark}!`, {
        fontFamily: "'Fredoka',system-ui,sans-serif",
        fontSize: "24px",
        color: "#333333",
        align: "center",
        wordWrap: { width: 460 },
      })
      .setOrigin(0.5);
    c.add(sub);

    const coinBadge = this.add.image(w / 2 - 30, h / 2 - 50, "coin").setScale(0.9);
    c.add(coinBadge);
    const coinLabel = this.add
      .text(w / 2 + 4, h / 2 - 62, `+${bonus}`, {
        fontFamily: "'Fredoka',system-ui,sans-serif",
        fontSize: "26px",
        color: "#e5a020",
      })
      .setOrigin(0, 0.5);
    c.add(coinLabel);

    const mkBtn = (y: number, label: string, color: number, icon: IconKind, cb: () => void) => {
      const btn = this.add.graphics();
      btn.fillStyle(color, 1);
      btn.fillRoundedRect(w / 2 - 140, y - 32, 280, 64, 18);
      c.add(btn);
      const t = this.add
        .text(0, y, label, {
          fontFamily: "'Fredoka',system-ui,sans-serif",
          fontSize: "26px",
          color: "#ffffff",
          stroke: "#00000055",
          strokeThickness: 2,
        })
        .setOrigin(0, 0.5);
      const iconSize = 18;
      const gap = iconSize * 2 + 10;
      const startX = w / 2 - (t.width + gap) / 2;
      const ig = this.add.graphics();
      drawIcon(ig, icon, startX + iconSize, y, iconSize, 0xffffff);
      c.add(ig);
      t.setPosition(startX + gap, y);
      c.add(t);
      const hit = this.add
        .rectangle(w / 2, y, 280, 64, 0x000000, 0)
        .setInteractive({ useHandCursor: true });
      hit.on("pointerdown", () => {
        SFX.click();
        cb();
      });
      c.add(hit);
    };

    let y = h / 2 - 5;
    mkBtn(y, "Play Again", 0x5fd07a, "replay", () => this.scene.restart());
    y += 70;
    if (nextWorld) {
      mkBtn(y, "Next World", 0xff9fd0, "forward", () => {
        updateSave((d) => {
          d.equipped.theme = nextWorld.id;
        });
        this.scene.restart();
      });
      y += 70;
    }
    mkBtn(y, "Home", 0x66d6ff, "home", () => this.scene.start("Title"));
  }

  // ---------- Autosave ----------
  private commitRun() {
    const finalScore = Math.round(this.score);
    updateSave((d) => {
      d.totalCoins += this.runCoins;
      if (finalScore > d.bestScore) d.bestScore = finalScore;
    });
    this.runCoins = 0;
  }

  shutdown() {
    this.commitRun();
  }
}
