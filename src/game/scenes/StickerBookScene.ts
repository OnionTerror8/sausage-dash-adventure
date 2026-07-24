/**
 * StickerBookScene — a pressure-free collection gallery, separate from the
 * paid Shop. Hazards unlock here just by being encountered in a run (met,
 * not bought), giving the "things that make you bounce" a second life as
 * something worth collecting. Cosmetics get the same gallery treatment,
 * mirrored from what's already owned in the Shop — no purchasing here,
 * pure show-and-tell.
 */
import Phaser from "phaser";
import { loadSave } from "../storage";
import { HAZARDS } from "../obstacles";
import { COSMETICS, type Cosmetic } from "../cosmetics";
import { SFX, setSfxPitch } from "../sfx";
import { MUSIC } from "../music";
import { setVoicePitch } from "../voice";
import { getWorld } from "../worlds";
import { drawIcon, type IconKind } from "../ui/icons";
import { drawFaceSwatch, drawWorldSwatch, drawBankSwatch, drawFlatSwatch } from "../ui/swatches";

type Tab = "hazards" | "cosmetics";
const TABS: { id: Tab; label: string; icon: IconKind }[] = [
  { id: "hazards", label: "Critters", icon: "critter" },
  { id: "cosmetics", label: "Outfits", icon: "hat" },
];

export class StickerBookScene extends Phaser.Scene {
  private tab: Tab = "hazards";
  private page = 0;

  constructor() {
    super("StickerBook");
  }

  create() {
    this.drawAll();
  }

  private drawAll() {
    this.children.removeAll(true);
    const { width, height } = this.scale;
    const save = loadSave();
    setSfxPitch(getWorld(save.equipped.theme).pitchMultiplier);
    setVoicePitch(getWorld(save.equipped.theme).pitchMultiplier);
    MUSIC.setPitch(getWorld(save.equipped.theme).pitchMultiplier);

    const bg = this.add.graphics();
    bg.fillGradientStyle(0xd0f0ff, 0xd0f0ff, 0xfff2c0, 0xfff2c0, 1);
    bg.fillRect(0, 0, width, height);

    this.add
      .text(width / 2, 42, "Sticker Book", {
        fontFamily: "'Fredoka',system-ui,sans-serif",
        fontSize: "44px",
        color: "#ffffff",
        stroke: "#2a5a6a",
        strokeThickness: 8,
      })
      .setOrigin(0.5);

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

    const tabGap = 220;
    TABS.forEach((t, i) => {
      const x = width / 2 - (tabGap * (TABS.length - 1)) / 2 + i * tabGap;
      const active = t.id === this.tab;
      this.button(
        x,
        110,
        200,
        54,
        active ? 0xff9f5f : 0xffffff,
        t.label,
        () => {
          SFX.click();
          this.tab = t.id;
          this.page = 0;
          this.drawAll();
        },
        20,
        active ? 0xffffff : 0x333333,
        t.icon,
      );
    });

    if (this.tab === "hazards") {
      this.drawHazardGrid(save, width, height);
    } else {
      this.drawCosmeticGrid(save, width, height);
    }
  }

  private drawHazardGrid(save: ReturnType<typeof loadSave>, width: number, height: number) {
    const cols = 5;
    const startX = 130;
    const startY = 232;
    const cellW = 145;
    const cellH = 150;
    const tileH = 130;
    const maxRows = Math.max(1, Math.floor((height - startY - tileH / 2 - 10) / cellH) + 1);
    const perPage = cols * maxRows;
    const totalPages = Math.max(1, Math.ceil(HAZARDS.length / perPage));
    if (this.page >= totalPages) this.page = totalPages - 1;
    const pageItems = HAZARDS.slice(this.page * perPage, (this.page + 1) * perPage);

    const metCount = HAZARDS.filter((h) => save.metHazards.includes(h.id)).length;
    this.add
      .text(width / 2, 160, `Met ${metCount} of ${HAZARDS.length}`, {
        fontFamily: "'Fredoka',system-ui,sans-serif",
        fontSize: "18px",
        color: "#333333",
      })
      .setOrigin(0.5);

    pageItems.forEach((def, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * cellW;
      const y = startY + row * cellH;
      const met = save.metHazards.includes(def.id);

      const w = 120;
      const h = tileH;
      const bgG = this.add.graphics();
      bgG.fillStyle(0xffffff, met ? 0.95 : 0.6);
      bgG.fillRoundedRect(x - w / 2, y - h / 2, w, h, 16);
      bgG.lineStyle(3, met ? 0x33cc66 : 0xcccccc, 1);
      bgG.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 16);

      if (met) {
        this.add.image(x, y - 6, def.textureKey).setScale(0.72);
        this.add
          .text(x, y + h / 2 - 18, def.name, {
            fontFamily: "'Fredoka',system-ui,sans-serif",
            fontSize: "13px",
            color: "#333333",
            align: "center",
            wordWrap: { width: 108 },
          })
          .setOrigin(0.5);
      } else {
        const q = this.add.graphics();
        q.fillStyle(0xdddddd, 1);
        q.fillCircle(x, y - 10, 26);
        drawIcon(q, "lock", x, y - 10, 14, 0x999999);
        this.add
          .text(x, y + h / 2 - 18, "???", {
            fontFamily: "'Fredoka',system-ui,sans-serif",
            fontSize: "15px",
            color: "#999999",
          })
          .setOrigin(0.5);
      }
    });

    this.drawPager(totalPages, width, startY + (maxRows - 1) * cellH + tileH / 2 + 35);
  }

  private drawCosmeticGrid(save: ReturnType<typeof loadSave>, width: number, height: number) {
    const items = COSMETICS;
    const cols = 5;
    const startX = 130;
    const startY = 232;
    const cellW = 145;
    const cellH = 150;
    const tileH = 130;
    const maxRows = Math.max(1, Math.floor((height - startY - tileH / 2 - 10) / cellH) + 1);
    const perPage = cols * maxRows;
    const totalPages = Math.max(1, Math.ceil(items.length / perPage));
    if (this.page >= totalPages) this.page = totalPages - 1;
    const pageItems = items.slice(this.page * perPage, (this.page + 1) * perPage);

    const ownedCount = items.filter((c) => save.unlocked.includes(c.id)).length;
    this.add
      .text(width / 2, 160, `Collected ${ownedCount} of ${items.length}`, {
        fontFamily: "'Fredoka',system-ui,sans-serif",
        fontSize: "18px",
        color: "#333333",
      })
      .setOrigin(0.5);

    pageItems.forEach((c, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      this.drawCosmeticTile(startX + col * cellW, startY + row * cellH, c, save);
    });

    this.drawPager(totalPages, width, startY + (maxRows - 1) * cellH + tileH / 2 + 35);
  }

  private drawCosmeticTile(x: number, y: number, c: Cosmetic, save: ReturnType<typeof loadSave>) {
    const owned = save.unlocked.includes(c.id);
    const w = 120;
    const h = 130;
    const bgG = this.add.graphics();
    bgG.fillStyle(0xffffff, owned ? 0.95 : 0.6);
    bgG.fillRoundedRect(x - w / 2, y - h / 2, w, h, 16);
    bgG.lineStyle(3, owned ? 0x33cc66 : 0xcccccc, 1);
    bgG.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 16);

    if (owned) {
      const sw = this.add.graphics();
      if (c.kind === "face") drawFaceSwatch(sw, x, y - 14, c.id);
      else if (c.kind === "theme") drawWorldSwatch(sw, x, y - 14, 46, 28, c.id);
      else if (c.kind === "bank") drawBankSwatch(sw, x, y - 14, c.id);
      else drawFlatSwatch(sw, x, y - 14, 46, 28, c.color, c.color2);
      this.add
        .text(x, y + h / 2 - 18, c.name, {
          fontFamily: "'Fredoka',system-ui,sans-serif",
          fontSize: "13px",
          color: "#333333",
          align: "center",
          wordWrap: { width: 108 },
        })
        .setOrigin(0.5);
    } else {
      const q = this.add.graphics();
      q.fillStyle(0xdddddd, 1);
      q.fillCircle(x, y - 14, 26);
      drawIcon(q, "lock", x, y - 14, 14, 0x999999);
      this.add
        .text(x, y + h / 2 - 18, "???", {
          fontFamily: "'Fredoka',system-ui,sans-serif",
          fontSize: "15px",
          color: "#999999",
        })
        .setOrigin(0.5);
    }
  }

  private drawPager(totalPages: number, width: number, pagerY: number) {
    if (totalPages <= 1) return;
    this.button(
      width / 2 - 70,
      pagerY,
      56,
      44,
      0xffffff,
      "",
      () => {
        if (this.page > 0) {
          SFX.click();
          this.page -= 1;
          this.drawAll();
        }
      },
      20,
      this.page > 0 ? 0x333333 : 0xcccccc,
      "back",
    );
    this.add
      .text(width / 2, pagerY, `${this.page + 1} / ${totalPages}`, {
        fontFamily: "'Fredoka',system-ui,sans-serif",
        fontSize: "20px",
        color: "#333333",
      })
      .setOrigin(0.5);
    this.button(
      width / 2 + 70,
      pagerY,
      56,
      44,
      0xffffff,
      "",
      () => {
        if (this.page < totalPages - 1) {
          SFX.click();
          this.page += 1;
          this.drawAll();
        }
      },
      20,
      this.page < totalPages - 1 ? 0x333333 : 0xcccccc,
      "forward",
    );
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
