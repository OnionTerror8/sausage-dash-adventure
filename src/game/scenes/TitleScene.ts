/**
 * TitleScene — animated title with big Play + Shop + world/character selection.
 * All UI uses generated textures; text uses Phaser bitmap-style fills.
 */
import Phaser from "phaser";
import { loadSave, updateSave } from "../storage";
import { WORLDS, getWorld } from "../worlds";
import { byId, byKind } from "../cosmetics";
import { drawSausage } from "../render";
import { SFX, setSoundMuted, setSfxPitch } from "../sfx";
import { MUSIC } from "../music";
import { setVoiceMuted, setVoicePitch } from "../voice";
import { drawIcon, type IconKind } from "../ui/icons";
import { drawWorldSwatch } from "../ui/swatches";
import { floatText } from "../fx";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("Title");
  }

  create() {
    const save = loadSave();
    setSoundMuted(!save.settings.sound);
    setVoiceMuted(!save.settings.sound);
    MUSIC.setMuted(!save.settings.music);
    const world = getWorld(save.equipped.theme);
    setSfxPitch(world.pitchMultiplier);
    setVoicePitch(world.pitchMultiplier);
    MUSIC.setPitch(world.pitchMultiplier);
    const { width, height } = this.scale;

    // Sky
    const bg = this.add.graphics();
    bg.fillGradientStyle(world.sky[0], world.sky[0], world.sky[1], world.sky[1], 1);
    bg.fillRect(0, 0, width, height);

    // Bouncing clouds
    for (let i = 0; i < 4; i++) {
      const c = this.add.image(120 + i * 220, 90 + (i % 2) * 30, "cloud").setTint(world.cloud);
      c.setScale(0.9 + Math.random() * 0.4);
      this.tweens.add({
        targets: c,
        y: c.y + 12,
        yoyo: true,
        repeat: -1,
        duration: 2200 + i * 300,
        ease: "sine.inOut",
      });
    }

    // Ground
    const ground = this.add.graphics();
    ground.fillStyle(world.ground, 1);
    ground.fillRect(0, height - 90, width, 90);
    ground.fillStyle(world.groundAccent, 1);
    ground.fillRect(0, height - 90, width, 12);

    // Title
    const title = this.add
      .text(width / 2, 100, "Sausage Dash!", {
        fontFamily: "'Fredoka','Comic Sans MS',system-ui,sans-serif",
        fontSize: "72px",
        color: "#ffffff",
        stroke: "#6a2a1a",
        strokeThickness: 10,
      })
      .setOrigin(0.5);
    title.setShadow(0, 8, "#00000055", 8, true, true);
    this.tweens.add({
      targets: title,
      scale: { from: 1, to: 1.06 },
      yoyo: true,
      repeat: -1,
      duration: 900,
      ease: "sine.inOut",
    });

    // Sausage character preview
    const char = this.add.container(width / 2, height / 2 + 20);
    drawSausage(this, char, save.equipped);
    this.tweens.add({
      targets: char,
      y: char.y - 18,
      yoyo: true,
      repeat: -1,
      duration: 700,
      ease: "sine.inOut",
    });

    // Coin counter
    this.add.image(28, 28, "coin").setScale(0.9);
    this.add.text(52, 12, `${save.totalCoins}`, {
      fontFamily: "'Fredoka',system-ui,sans-serif",
      fontSize: "32px",
      color: "#ffffff",
      stroke: "#6a4a1a",
      strokeThickness: 6,
    });

    // Sticker Book — a pressure-free collection gallery, tucked in the
    // opposite corner from the coin counter so it doesn't compete with Play.
    this.makeButton(
      width - 36,
      36,
      64,
      54,
      0x7ad9c4,
      "",
      () => {
        SFX.click();
        this.scene.start("StickerBook");
      },
      24,
      0xffffff,
      "book",
    );

    // Play button
    this.makeButton(
      width / 2,
      height - 130,
      260,
      90,
      0xff6a4a,
      "PLAY",
      () => {
        SFX.click();
        this.scene.start("Game");
      },
      34,
      0xffffff,
      "play",
    );

    // Bottom row: Shop, Dress Up, Chill Mode, Music, Sound — five evenly spaced buttons.
    this.makeButton(
      width / 2 - 300,
      height - 50,
      130,
      60,
      0x5fd0ff,
      "Shop",
      () => {
        SFX.click();
        this.scene.start("Shop");
      },
      20,
      0xffffff,
      "shop",
    );

    this.makeButton(
      width / 2 - 150,
      height - 50,
      130,
      60,
      0xff9fd0,
      "Dress Up",
      () => {
        SFX.click();
        this.scene.start("Wardrobe");
      },
      16,
      0xffffff,
      "wardrobe",
    );

    // Chill Mode — hazard-free play for the youngest/first-time players.
    this.makeButton(
      width / 2,
      height - 50,
      130,
      60,
      0x7ad9c4,
      save.settings.chillMode ? "Chill On" : "Chill Off",
      () => {
        SFX.click();
        updateSave((d) => {
          d.settings.chillMode = !d.settings.chillMode;
        });
        this.scene.restart();
      },
      16,
      0xffffff,
      "shield",
    );

    // Settings — music toggle
    this.makeButton(
      width / 2 + 150,
      height - 50,
      130,
      60,
      0xffb0f0,
      save.settings.music ? "Music On" : "Music Off",
      () => {
        SFX.click();
        const d = updateSave((d) => {
          d.settings.music = !d.settings.music;
        });
        MUSIC.setMuted(!d.settings.music);
        this.scene.restart();
      },
      16,
      0xffffff,
      save.settings.music ? "music-on" : "music-off",
    );

    // Settings — sound toggle
    this.makeButton(
      width / 2 + 300,
      height - 50,
      130,
      60,
      0xffcf3a,
      save.settings.sound ? "Sound On" : "Sound Off",
      () => {
        SFX.click();
        const d = updateSave((d) => {
          d.settings.sound = !d.settings.sound;
        });
        setSoundMuted(!d.settings.sound);
        setVoiceMuted(!d.settings.sound);
        this.scene.restart();
      },
      18,
      0xffffff,
      save.settings.sound ? "sound-on" : "sound-off",
    );

    // World swap arrows
    const themeIdx = WORLDS.findIndex((w) => w.id === save.equipped.theme);
    this.makeButton(
      60,
      height / 2,
      60,
      60,
      0xffffff,
      "",
      () => {
        const owned = WORLDS.filter((w) => save.unlocked.includes(w.id));
        const i = owned.findIndex((w) => w.id === save.equipped.theme);
        const next = owned[(i - 1 + owned.length) % owned.length];
        updateSave((d) => {
          d.equipped.theme = next.id;
        });
        this.scene.restart();
      },
      36,
      0x333333,
      "back",
    );
    this.makeButton(
      width - 60,
      height / 2,
      60,
      60,
      0xffffff,
      "",
      () => {
        const owned = WORLDS.filter((w) => save.unlocked.includes(w.id));
        const i = owned.findIndex((w) => w.id === save.equipped.theme);
        const next = owned[(i + 1) % owned.length];
        updateSave((d) => {
          d.equipped.theme = next.id;
        });
        this.scene.restart();
      },
      36,
      0x333333,
      "forward",
    );

    this.add
      .text(width / 2, 178, WORLDS[themeIdx]?.name ?? "", {
        fontFamily: "'Fredoka',system-ui,sans-serif",
        fontSize: "28px",
        color: "#ffffff",
        stroke: "#333",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Adventure map: a small row of world nodes on a connecting path, giving
    // an at-a-glance view of Journey Mode progress and a direct way to jump
    // to any unlocked world, alongside the quick prev/next arrows above.
    const mapY = 344;
    const nodeGap = 120;
    const mapStartX = width / 2 - (nodeGap * (WORLDS.length - 1)) / 2;
    const pathLine = this.add.graphics();
    pathLine.lineStyle(5, 0xffffff, 0.5);
    pathLine.beginPath();
    pathLine.moveTo(mapStartX, mapY);
    pathLine.lineTo(mapStartX + nodeGap * (WORLDS.length - 1), mapY);
    pathLine.strokePath();

    WORLDS.forEach((w, i) => {
      const nx = mapStartX + i * nodeGap;
      const unlocked = save.unlocked.includes(w.id);
      const isCurrent = w.id === save.equipped.theme;

      const node = this.add.graphics();
      node.fillStyle(0xffffff, unlocked ? 1 : 0.6);
      node.fillCircle(nx, mapY, 19);
      if (unlocked) {
        drawWorldSwatch(node, nx, mapY, 28, 17, w.id);
      } else {
        drawIcon(node, "lock", nx, mapY, 9, 0x999999);
      }
      if (isCurrent) {
        node.lineStyle(3, 0xffd83a, 1);
        node.strokeCircle(nx, mapY, 23);
      }

      const hit = this.add
        .circle(nx, mapY, 23, 0x000000, 0)
        .setInteractive({ useHandCursor: true });
      hit.on("pointerdown", () => {
        SFX.click();
        if (!unlocked) {
          floatText(this, "Finish a world to unlock this one!", nx, mapY - 40, 0x888888, 14);
          return;
        }
        updateSave((d) => {
          d.equipped.theme = w.id;
        });
        this.scene.restart();
      });
    });

    // Best score badge
    if (save.bestScore > 0) {
      this.add
        .text(width / 2, 224, `Best: ${save.bestScore}`, {
          fontFamily: "'Fredoka',system-ui,sans-serif",
          fontSize: "26px",
          color: "#ffffff",
          stroke: "#333",
          strokeThickness: 4,
        })
        .setOrigin(0.5);
    }
  }

  /** `icon` renders alongside (or instead of, if label is "") the text label, so
   *  pre-reading players can navigate by shape as well as by word. */
  private makeButton(
    x: number,
    y: number,
    w: number,
    h: number,
    color: number,
    label: string,
    onClick: () => void,
    fontSize = 34,
    textColor = 0xffffff,
    icon?: IconKind,
  ) {
    const c = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.18);
    bg.fillRoundedRect(-w / 2 + 4, -h / 2 + 6, w, h, 22);
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 22);
    bg.lineStyle(4, 0xffffff, 0.9);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 22);
    c.add(bg);

    if (icon && !label) {
      const ig = this.add.graphics();
      drawIcon(ig, icon, 0, 0, Math.min(w, h) * 0.28, textColor);
      c.add(ig);
    } else if (label) {
      const t = this.add
        .text(0, 0, label, {
          fontFamily: "'Fredoka',system-ui,sans-serif",
          fontSize: `${fontSize}px`,
          color: "#" + textColor.toString(16).padStart(6, "0"),
          stroke: "#00000055",
          strokeThickness: 3,
        })
        .setOrigin(0, 0.5);
      const iconSize = Math.min(h * 0.32, 20);
      const gap = icon ? iconSize * 2 + 10 : 0;
      const totalW = t.width + gap;
      const startX = -totalW / 2;
      if (icon) {
        const ig = this.add.graphics();
        drawIcon(ig, icon, startX + iconSize, 0, iconSize, textColor);
        c.add(ig);
      }
      t.setPosition(startX + gap, 0);
      c.add(t);
    }

    c.setSize(w, h);
    c.setInteractive({ useHandCursor: true });
    c.on("pointerdown", () => {
      this.tweens.add({ targets: c, scale: 0.94, duration: 80, yoyo: true });
      onClick();
    });
    return c;
  }
}
