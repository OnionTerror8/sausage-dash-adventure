/**
 * ShopScene — browse & buy cosmetics with earned coins. Purchasing only;
 * equipping owned items lives in WardrobeScene so each screen has one job.
 */
import Phaser from "phaser";
import { loadSave, updateSave } from "../storage";
import { byKind, type Cosmetic, type CosmeticKind } from "../cosmetics";
import { getWorld, WORLDS } from "../worlds";
import { SFX, setSfxPitch } from "../sfx";
import { MUSIC } from "../music";
import { HAPTICS } from "../haptics";
import { burst, floatText } from "../fx";
import { drawIcon, type IconKind } from "../ui/icons";
import { drawFaceSwatch, drawWorldSwatch, drawBankSwatch } from "../ui/swatches";

const TABS: { id: CosmeticKind; label: string; icon: IconKind }[] = [
  { id: "hat", label: "Hats", icon: "hat" },
  { id: "face", label: "Faces", icon: "face" },
  { id: "trail", label: "Trails", icon: "sparkle" },
  { id: "theme", label: "Worlds", icon: "globe" },
  { id: "bank", label: "Bank", icon: "bank" },
];

export class ShopScene extends Phaser.Scene {
  private tab: CosmeticKind = "hat";
  constructor() {
    super("Shop");
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
    bg.fillGradientStyle(0xfff2c0, 0xfff2c0, 0xffd0e5, 0xffd0e5, 1);
    bg.fillRect(0, 0, width, height);

    this.add
      .text(width / 2, 42, "Shop", {
        fontFamily: "'Fredoka',system-ui,sans-serif",
        fontSize: "52px",
        color: "#ffffff",
        stroke: "#6a2a5a",
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    // Coin badge
    this.add.image(width - 130, 40, "coin").setScale(1);
    this.add.text(width - 100, 22, `${save.totalCoins}`, {
      fontFamily: "'Fredoka',system-ui,sans-serif",
      fontSize: "34px",
      color: "#ffffff",
      stroke: "#6a4a1a",
      strokeThickness: 6,
    });

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

    // Dress Up button — Wardrobe is a tap away without going back through Title.
    this.button(
      width - 80,
      100,
      150,
      54,
      0xff9fd0,
      "Dress Up",
      () => {
        SFX.click();
        this.scene.start("Wardrobe");
      },
      18,
      0xffffff,
      "wardrobe",
    );

    // Tabs — centered gap-based layout so an extra tab (Bank) doesn't run
    // into the Dress Up button at the top right.
    const tabGap = 128;
    TABS.forEach((t, i) => {
      const x = width / 2 - (tabGap * (TABS.length - 1)) / 2 + i * tabGap;
      const active = t.id === this.tab;
      this.button(
        x,
        110,
        122,
        54,
        active ? 0xff9f5f : 0xffffff,
        t.label,
        () => {
          SFX.click();
          this.tab = t.id;
          this.drawAll();
        },
        18,
        active ? 0xffffff : 0x333333,
        t.icon,
      );
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
    // World themes beyond the first are meant to be reached by finishing the
    // previous world's Journey, not bought ahead of it — otherwise a child
    // can coin-buy straight into World 3 without ever completing World 1.
    let journeyLocked = false;
    if (c.kind === "theme" && !owned) {
      const idx = WORLDS.findIndex((w) => w.id === c.id);
      const prevWorld = WORLDS[idx - 1];
      journeyLocked = !!prevWorld && !save.completedWorlds.includes(prevWorld.id);
    }

    const w = 160;
    const h = 140;
    const tile = this.add.container(x, y);
    const bgG = this.add.graphics();
    bgG.fillStyle(0xffffff, 0.95);
    bgG.fillRoundedRect(-w / 2, -h / 2, w, h, 18);
    bgG.lineStyle(4, owned ? 0x33cc66 : 0xcccccc, 1);
    bgG.strokeRoundedRect(-w / 2, -h / 2, w, h, 18);
    tile.add(bgG);

    tile.add(
      this.add
        .text(0, -h / 2 + 20, c.name, {
          fontFamily: "'Fredoka',system-ui,sans-serif",
          fontSize: "18px",
          color: "#333333",
        })
        .setOrigin(0.5),
    );

    // Swatch preview — faces/worlds get a real mini-preview since they have
    // no single flat color; hats/trails keep the simple color-swatch look.
    const sw = this.add.graphics();
    if (c.kind === "face") {
      drawFaceSwatch(sw, 0, 6, c.id);
    } else if (c.kind === "theme") {
      drawWorldSwatch(sw, 0, 6, 60, 40, c.id);
    } else if (c.kind === "bank") {
      drawBankSwatch(sw, 0, 6, c.id);
    } else {
      sw.fillStyle(c.color ?? 0x999999, 1);
      sw.fillRoundedRect(-30, -14, 60, 40, 10);
      if (c.color2) {
        sw.fillStyle(c.color2, 1);
        sw.fillRoundedRect(-10, -6, 30, 24, 6);
      }
    }
    tile.add(sw);

    // Action label — owned items are just labeled, not interactive here.
    const label = owned ? "Owned" : journeyLocked ? "Locked" : `Buy ${c.price}`;
    const color = owned
      ? 0x66cc66
      : journeyLocked
        ? 0xcccccc
        : save.totalCoins >= c.price
          ? 0xffcf3a
          : 0xcccccc;

    const btn = this.add.graphics();
    btn.fillStyle(color, 1);
    btn.fillRoundedRect(-60, h / 2 - 40, 120, 32, 12);
    tile.add(btn);
    if (owned) {
      const check = this.add.graphics();
      drawIcon(check, "check", -34, h / 2 - 24, 10, 0xffffff);
      tile.add(check);
    } else if (journeyLocked) {
      const lock = this.add.graphics();
      drawIcon(lock, "lock", -34, h / 2 - 24, 10, 0xffffff);
      tile.add(lock);
    }
    tile.add(
      this.add
        .text(owned || journeyLocked ? 10 : 0, h / 2 - 24, label, {
          fontFamily: "'Fredoka',system-ui,sans-serif",
          fontSize: "18px",
          color: "#ffffff",
          stroke: "#00000055",
          strokeThickness: 2,
        })
        .setOrigin(0.5),
    );

    if (owned) return; // nothing to tap — equipping happens in Wardrobe

    const hit = this.add.rectangle(x, y, w, h, 0x000000, 0).setInteractive({ useHandCursor: true });
    hit.on("pointerdown", () => {
      SFX.click();
      if (journeyLocked) {
        floatText(this, "Finish the world before this one!", x, y - h / 2 - 10, 0x888888, 15);
        return;
      }
      if (save.totalCoins < c.price) return;
      updateSave((d) => {
        d.totalCoins -= c.price;
        d.unlocked.push(c.id);
      });
      SFX.cheer();
      HAPTICS.purchase();
      // Purchase animation: a happy pop + sparkle burst right on the tile.
      this.tweens.add({
        targets: tile,
        scale: { from: 1.15, to: 1 },
        duration: 260,
        ease: "back.out",
      });
      burst(this, x, y, 0xffe082, 16);
      floatText(this, "Yours!", x, y - h / 2 - 10, 0x66cc66, 22);
      this.time.delayedCall(280, () => this.drawAll());
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
