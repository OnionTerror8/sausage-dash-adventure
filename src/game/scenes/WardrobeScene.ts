/**
 * WardrobeScene — equip owned cosmetics with a live sausage preview.
 * No purchasing here; locked items are visible (so kids know there's more to
 * find) but just show a friendly hint pointing to the Shop instead of buying.
 */
import Phaser from "phaser";
import { loadSave, updateSave } from "../storage";
import { byKind, type Cosmetic, type CosmeticKind } from "../cosmetics";
import { drawSausage } from "../render";
import { getWorld } from "../worlds";
import { SFX, setSfxPitch } from "../sfx";
import { MUSIC } from "../music";
import { floatText } from "../fx";
import { drawIcon, type IconKind } from "../ui/icons";
import { drawFaceSwatch, drawWorldSwatch } from "../ui/swatches";

const TABS: { id: CosmeticKind; label: string; icon: IconKind }[] = [
  { id: "hat", label: "Hats", icon: "hat" },
  { id: "face", label: "Faces", icon: "face" },
  { id: "trail", label: "Trails", icon: "sparkle" },
  { id: "theme", label: "Worlds", icon: "globe" },
];

export class WardrobeScene extends Phaser.Scene {
  private tab: CosmeticKind = "hat";
  private preview!: Phaser.GameObjects.Container;

  constructor() {
    super("Wardrobe");
  }

  create() {
    this.drawAll();
  }

  private drawAll() {
    this.children.removeAll(true);
    const { width, height } = this.scale;
    const save = loadSave();
    setSfxPitch(getWorld(save.equipped.theme).pitchMultiplier);
    MUSIC.setPitch(getWorld(save.equipped.theme).pitchMultiplier);

    const bg = this.add.graphics();
    bg.fillGradientStyle(0xd0f0ff, 0xd0f0ff, 0xffe0f0, 0xffe0f0, 1);
    bg.fillRect(0, 0, width, height);

    this.add
      .text(width / 2, 34, "Dress Up!", {
        fontFamily: "'Fredoka',system-ui,sans-serif",
        fontSize: "44px",
        color: "#ffffff",
        stroke: "#5a2a6a",
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    // Back button — icon only, universally readable without text.
    this.button(
      80,
      40,
      120,
      54,
      0x9fc6ff,
      "",
      () => {
        SFX.click();
        this.scene.start("Title");
      },
      24,
      0xffffff,
      "back",
    );

    // Shop button — for when a locked item catches their eye.
    this.button(
      width - 80,
      40,
      120,
      54,
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

    // Live preview
    this.preview = this.add.container(width / 2, 150);
    drawSausage(this, this.preview, save.equipped);
    this.tweens.add({
      targets: this.preview,
      y: this.preview.y - 14,
      yoyo: true,
      repeat: -1,
      duration: 800,
      ease: "sine.inOut",
    });

    // Tabs
    TABS.forEach((t, i) => {
      const x = 140 + i * 180;
      const active = t.id === this.tab;
      this.button(
        x,
        260,
        160,
        54,
        active ? 0xff9f5f : 0xffffff,
        t.label,
        () => {
          SFX.click();
          this.tab = t.id;
          this.drawAll();
        },
        22,
        active ? 0xffffff : 0x333333,
        t.icon,
      );
    });

    // Grid of items
    const items = byKind(this.tab);
    const cols = 4;
    const startX = 130;
    const startY = 350;
    const cellW = 180;
    const cellH = 150;
    items.forEach((c, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      this.drawTile(startX + col * cellW, startY + row * cellH, c, save);
    });
  }

  private drawTile(x: number, y: number, c: Cosmetic, save: ReturnType<typeof loadSave>) {
    const owned = save.unlocked.includes(c.id);
    const equipped =
      (c.kind === "hat" && save.equipped.hat === c.id) ||
      (c.kind === "face" && save.equipped.face === c.id) ||
      (c.kind === "trail" && save.equipped.trail === c.id) ||
      (c.kind === "theme" && save.equipped.theme === c.id);

    const w = 160;
    const h = 130;
    const bg = this.add.graphics();
    bg.fillStyle(owned ? 0xffffff : 0xe8e8e8, owned ? 0.95 : 0.7);
    bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 18);
    bg.lineStyle(4, equipped ? 0x33cc66 : owned ? 0xffcf3a : 0xcccccc, 1);
    bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 18);

    this.add
      .text(x, y - h / 2 + 18, c.name, {
        fontFamily: "'Fredoka',system-ui,sans-serif",
        fontSize: "17px",
        color: owned ? "#333333" : "#888888",
      })
      .setOrigin(0.5);

    const sw = this.add.graphics();
    const cy = y + 2;
    if (c.kind === "face") {
      drawFaceSwatch(sw, x, cy, c.id);
    } else if (c.kind === "theme") {
      drawWorldSwatch(sw, x, cy, 60, 36, c.id);
    } else {
      sw.fillStyle(c.color ?? 0x999999, 1);
      sw.fillRoundedRect(x - 30, cy - 18, 60, 36, 10);
      if (c.color2) {
        sw.fillStyle(c.color2, 1);
        sw.fillRoundedRect(x - 10, cy - 10, 30, 22, 6);
      }
    }
    sw.setAlpha(owned ? 1 : 0.4);
    if (!owned) {
      // Simple padlock hint — a locked cosmetic, not a threatening icon.
      const lock = this.add.graphics();
      drawIcon(lock, "lock", x, cy - 2, 12, 0x999999);
    }

    const label = equipped ? "Wearing" : owned ? "Wear" : "Locked";
    const labelIcon: IconKind = equipped ? "check" : owned ? "wardrobe" : "lock";
    const color = equipped ? 0x66cc66 : owned ? 0x66d6ff : 0xcccccc;
    const btnY = y + h / 2 - 20;
    const btn = this.add.graphics();
    btn.fillStyle(color, 1);
    btn.fillRoundedRect(x - 55, btnY - 14, 110, 28, 12);
    const t = this.add
      .text(0, btnY, label, {
        fontFamily: "'Fredoka',system-ui,sans-serif",
        fontSize: "15px",
        color: "#ffffff",
        stroke: "#00000055",
        strokeThickness: 2,
      })
      .setOrigin(0, 0.5);
    const iconSize = 9;
    const gap = iconSize * 2 + 6;
    const startX = x - (t.width + gap) / 2;
    const iconG = this.add.graphics();
    drawIcon(iconG, labelIcon, startX + iconSize, btnY, iconSize, 0xffffff);
    t.setPosition(startX + gap, btnY);

    const hit = this.add.rectangle(x, y, w, h, 0x000000, 0).setInteractive({ useHandCursor: true });
    hit.on("pointerdown", () => {
      SFX.click();
      if (equipped) return;
      if (!owned) {
        const hint = c.kind === "theme" ? "Finish a world to unlock it!" : "Find it in the Shop!";
        floatText(this, hint, x, y - 10, 0x888888, 16);
        return;
      }
      updateSave((d) => {
        if (c.kind === "hat") d.equipped.hat = c.id;
        if (c.kind === "face") d.equipped.face = c.id;
        if (c.kind === "trail") d.equipped.trail = c.id;
        if (c.kind === "theme") d.equipped.theme = c.id;
      });
      SFX.cheer();
      drawSausage(this, this.preview, loadSave().equipped);
      this.tweens.add({
        targets: this.preview,
        scale: { from: 1.2, to: 1 },
        duration: 260,
        ease: "back.out",
      });
      this.drawAll();
    });
  }

  private button(
    x: number,
    y: number,
    w: number,
    h: number,
    color: number,
    label: string,
    onClick: () => void,
    fontSize = 24,
    textColor = 0xffffff,
    icon?: IconKind,
  ) {
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 16);
    bg.lineStyle(3, 0xffffff, 0.9);
    bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 16);

    if (icon && !label) {
      const ig = this.add.graphics();
      drawIcon(ig, icon, x, y, Math.min(w, h) * 0.28, textColor);
    } else if (label) {
      const t = this.add
        .text(0, y, label, {
          fontFamily: "'Fredoka',system-ui,sans-serif",
          fontSize: `${fontSize}px`,
          color: "#" + textColor.toString(16).padStart(6, "0"),
          stroke: "#00000055",
          strokeThickness: 2,
        })
        .setOrigin(0, 0.5);
      const iconSize = Math.min(h * 0.32, 18);
      const gap = icon ? iconSize * 2 + 8 : 0;
      const totalW = t.width + gap;
      const startX = x - totalW / 2;
      if (icon) {
        const ig = this.add.graphics();
        drawIcon(ig, icon, startX + iconSize, y, iconSize, textColor);
      }
      t.setPosition(startX + gap, y);
    }

    const hit = this.add.rectangle(x, y, w, h, 0x000000, 0).setInteractive({ useHandCursor: true });
    hit.on("pointerdown", onClick);
  }
}
