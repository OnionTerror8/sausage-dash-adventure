/**
 * ShopScene — browse & buy cosmetics with earned coins.
 * Kid-friendly: big tiles, ownership badges, one-tap equip.
 */
import Phaser from "phaser";
import { loadSave, updateSave } from "../storage";
import { COSMETICS, byKind, type Cosmetic, type CosmeticKind } from "../cosmetics";
import { SFX } from "../sfx";

const TABS: { id: CosmeticKind; label: string }[] = [
  { id: "hat", label: "Hats" },
  { id: "face", label: "Faces" },
  { id: "trail", label: "Trails" },
  { id: "theme", label: "Worlds" },
];

export class ShopScene extends Phaser.Scene {
  private tab: CosmeticKind = "hat";
  constructor() { super("Shop"); }

  create() {
    this.drawAll();
  }

  private drawAll() {
    this.children.removeAll(true);
    const { width, height } = this.scale;
    const save = loadSave();

    const bg = this.add.graphics();
    bg.fillGradientStyle(0xfff2c0, 0xfff2c0, 0xffd0e5, 0xffd0e5, 1);
    bg.fillRect(0, 0, width, height);

    this.add.text(width / 2, 42, "Shop", {
      fontFamily: "'Fredoka',system-ui,sans-serif", fontSize: "52px", color: "#ffffff",
      stroke: "#6a2a5a", strokeThickness: 8,
    }).setOrigin(0.5);

    // Coin badge
    this.add.image(width - 130, 40, "coin").setScale(1);
    this.add.text(width - 100, 22, `${save.totalCoins}`, {
      fontFamily: "'Fredoka',system-ui,sans-serif", fontSize: "34px", color: "#ffffff",
      stroke: "#6a4a1a", strokeThickness: 6,
    });

    // Back button
    this.button(80, 40, 120, 54, 0x9fc6ff, "Back", () => {
      SFX.click();
      this.scene.start("Title");
    }, 24);

    // Tabs
    TABS.forEach((t, i) => {
      const x = 140 + i * 180;
      const active = t.id === this.tab;
      this.button(x, 110, 160, 54, active ? 0xff9f5f : 0xffffff, t.label, () => {
        SFX.click();
        this.tab = t.id;
        this.drawAll();
      }, 24, active ? 0xffffff : 0x333333);
    });

    // Grid of items
    const items = byKind(this.tab);
    const cols = 4;
    const startX = 130;
    const startY = 200;
    const cellW = 180;
    const cellH = 160;
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
    const h = 140;
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.95);
    bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 18);
    bg.lineStyle(4, equipped ? 0x33cc66 : owned ? 0xffcf3a : 0xcccccc, 1);
    bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 18);

    this.add.text(x, y - h / 2 + 20, c.name, {
      fontFamily: "'Fredoka',system-ui,sans-serif", fontSize: "18px", color: "#333333",
    }).setOrigin(0.5);

    // Swatch preview
    const sw = this.add.graphics();
    const cy = y + 6;
    sw.fillStyle(c.color ?? 0x999999, 1);
    sw.fillRoundedRect(x - 30, cy - 20, 60, 40, 10);
    if (c.color2) {
      sw.fillStyle(c.color2, 1);
      sw.fillRoundedRect(x - 10, cy - 12, 30, 24, 6);
    }

    // Action label
    let label = "";
    let color = 0xffcf3a;
    if (equipped) { label = "Wearing"; color = 0x66cc66; }
    else if (owned) { label = "Wear"; color = 0x66d6ff; }
    else { label = `Buy ${c.price}`; color = save.totalCoins >= c.price ? 0xffcf3a : 0xcccccc; }

    const btn = this.add.graphics();
    btn.fillStyle(color, 1);
    btn.fillRoundedRect(x - 60, y + h / 2 - 40, 120, 32, 12);
    const btnT = this.add.text(x, y + h / 2 - 24, label, {
      fontFamily: "'Fredoka',system-ui,sans-serif", fontSize: "18px", color: "#ffffff",
      stroke: "#00000055", strokeThickness: 2,
    }).setOrigin(0.5);

    const hit = this.add.rectangle(x, y, w, h, 0x000000, 0).setInteractive({ useHandCursor: true });
    hit.on("pointerdown", () => {
      SFX.click();
      if (equipped) return;
      if (owned) {
        updateSave((d) => {
          if (c.kind === "hat") d.equipped.hat = c.id;
          if (c.kind === "face") d.equipped.face = c.id;
          if (c.kind === "trail") d.equipped.trail = c.id;
          if (c.kind === "theme") d.equipped.theme = c.id;
        });
        SFX.cheer();
        this.drawAll();
      } else if (save.totalCoins >= c.price) {
        updateSave((d) => {
          d.totalCoins -= c.price;
          d.unlocked.push(c.id);
        });
        SFX.cheer();
        this.drawAll();
      }
    });
  }

  private button(
    x: number, y: number, w: number, h: number, color: number, label: string,
    onClick: () => void, fontSize = 24, textColor = 0xffffff,
  ) {
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 16);
    bg.lineStyle(3, 0xffffff, 0.9);
    bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 16);
    const t = this.add.text(x, y, label, {
      fontFamily: "'Fredoka',system-ui,sans-serif", fontSize: `${fontSize}px`,
      color: "#" + textColor.toString(16).padStart(6, "0"),
      stroke: "#00000055", strokeThickness: 2,
    }).setOrigin(0.5);
    const hit = this.add.rectangle(x, y, w, h, 0x000000, 0).setInteractive({ useHandCursor: true });
    hit.on("pointerdown", onClick);
  }
}
