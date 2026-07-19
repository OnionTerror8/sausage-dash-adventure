/**
 * Obstacle catalogue — hot & cold hazards. Purely data-driven: add an entry
 * here (texture builder + hit radius + animation) to add a new obstacle,
 * no other file needs to change. Every hazard gets a friendly cartoon face —
 * these should read as silly, never threatening.
 */
import Phaser from "phaser";

export type HazardGroup = "hot" | "cold";
export type HazardAnim = "wiggle" | "bob" | "pulse" | "shimmer";

export interface HazardDef {
  id: string;
  group: HazardGroup;
  name: string;
  textureKey: string;
  hitR: number;
  anim: HazardAnim;
  /** If set, periodically emits a small rising tinted puff (steam / smoke / snow). */
  puffColor?: number;
  /** Vertical nudge so flat/tall shapes still sit believably on the ground. */
  yOffset?: number;
  buildTexture: (scene: Phaser.Scene) => void;
}

function face(g: Phaser.GameObjects.Graphics, cx: number, cy: number, r = 4) {
  g.fillStyle(0xffffff, 1);
  g.fillCircle(cx - r * 1.8, cy, r);
  g.fillCircle(cx + r * 1.8, cy, r);
  g.fillStyle(0x2a2a2a, 1);
  g.fillCircle(cx - r * 1.8, cy, r * 0.5);
  g.fillCircle(cx + r * 1.8, cy, r * 0.5);
  g.lineStyle(2, 0x2a2a2a, 1);
  g.beginPath();
  g.arc(cx, cy + r * 1.6, r * 1.3, 0, Math.PI, false);
  g.strokePath();
}

function tex(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  draw: (g: Phaser.GameObjects.Graphics) => void,
) {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics().setVisible(false);
  draw(g);
  g.generateTexture(key, w, h);
  g.destroy();
}

export const HAZARDS: HazardDef[] = [
  // ---------- Hot ----------
  {
    id: "hot_pan",
    group: "hot",
    name: "Frying Pan",
    textureKey: "hazard_pan",
    hitR: 26,
    anim: "wiggle",
    buildTexture: (scene) =>
      tex(scene, "hazard_pan", 76, 60, (g) => {
        g.fillStyle(0x333333, 1);
        g.fillCircle(30, 30, 26);
        g.fillStyle(0x555555, 1);
        g.fillCircle(30, 30, 20);
        g.fillStyle(0xff7a2e, 1);
        g.fillCircle(30, 28, 14);
        g.fillStyle(0xffd66a, 0.9);
        g.fillCircle(24, 24, 6);
        g.fillStyle(0x333333, 1);
        g.fillRoundedRect(52, 26, 22, 8, 3);
        face(g, 30, 30);
      }),
  },
  {
    id: "hot_grill",
    group: "hot",
    name: "BBQ Grill",
    textureKey: "hazard_grill",
    hitR: 28,
    anim: "wiggle",
    puffColor: 0xaaaaaa,
    buildTexture: (scene) =>
      tex(scene, "hazard_grill", 60, 60, (g) => {
        g.fillStyle(0x3a3a3a, 1);
        g.fillRoundedRect(4, 16, 52, 28, 8);
        g.fillStyle(0x222222, 1);
        for (let x = 10; x < 50; x += 8) g.fillRect(x, 20, 3, 20);
        g.fillStyle(0xff8a3d, 1);
        g.fillCircle(16, 40, 5);
        g.fillCircle(30, 42, 6);
        g.fillCircle(44, 40, 5);
        g.fillStyle(0x2a2a2a, 1);
        g.fillRect(10, 44, 4, 12);
        g.fillRect(46, 44, 4, 12);
        face(g, 30, 12);
      }),
  },
  {
    id: "hot_campfire",
    group: "hot",
    name: "Campfire",
    textureKey: "hazard_campfire",
    hitR: 26,
    anim: "wiggle",
    puffColor: 0xffd66a,
    buildTexture: (scene) =>
      tex(scene, "hazard_campfire", 60, 50, (g) => {
        g.fillStyle(0x7a4a2a, 1);
        g.fillRoundedRect(6, 40, 40, 8, 4);
        g.fillRoundedRect(14, 34, 34, 8, 4);
        g.fillStyle(0xff7a2e, 1);
        g.fillTriangle(30, 4, 12, 40, 48, 40);
        g.fillStyle(0xffd66a, 1);
        g.fillTriangle(30, 16, 20, 40, 40, 40);
        face(g, 30, 28);
      }),
  },
  {
    id: "hot_kettle",
    group: "hot",
    name: "Kettle",
    textureKey: "hazard_kettle",
    hitR: 24,
    anim: "pulse",
    puffColor: 0xffffff,
    buildTexture: (scene) =>
      tex(scene, "hazard_kettle", 60, 50, (g) => {
        g.fillStyle(0xd0333f, 1);
        g.fillRoundedRect(8, 16, 36, 30, 14);
        g.fillStyle(0x8a1a24, 1);
        g.fillRoundedRect(20, 4, 12, 10, 4);
        g.fillRoundedRect(4, 26, 6, 14, 3);
        g.fillStyle(0xd0333f, 1);
        g.fillTriangle(44, 20, 56, 14, 50, 26);
        face(g, 24, 32);
      }),
  },
  {
    id: "hot_oven",
    group: "hot",
    name: "Oven",
    textureKey: "hazard_oven",
    hitR: 28,
    anim: "pulse",
    buildTexture: (scene) =>
      tex(scene, "hazard_oven", 60, 56, (g) => {
        g.fillStyle(0x555555, 1);
        g.fillRoundedRect(2, 2, 56, 52, 8);
        g.fillStyle(0x333333, 1);
        g.fillRoundedRect(8, 14, 44, 34, 6);
        g.fillStyle(0xff8a3d, 0.9);
        g.fillRoundedRect(14, 20, 32, 22, 4);
        g.fillStyle(0xdddddd, 1);
        g.fillCircle(50, 8, 3);
        face(g, 30, 31);
      }),
  },

  // ---------- Cold ----------
  {
    id: "cold_icecube",
    group: "cold",
    name: "Ice Cube",
    textureKey: "hazard_icecube",
    hitR: 26,
    anim: "bob",
    buildTexture: (scene) =>
      tex(scene, "hazard_icecube", 56, 56, (g) => {
        g.fillStyle(0x9fe4ff, 1);
        g.fillRoundedRect(0, 0, 56, 56, 10);
        g.fillStyle(0xd8f2ff, 0.8);
        g.fillRoundedRect(8, 8, 22, 14, 6);
        g.fillStyle(0xffffff, 0.6);
        g.fillCircle(40, 40, 6);
        face(g, 28, 36);
      }),
  },
  {
    id: "cold_snowcloud",
    group: "cold",
    name: "Snow Cloud",
    textureKey: "hazard_snowcloud",
    hitR: 30,
    anim: "bob",
    puffColor: 0xffffff,
    buildTexture: (scene) =>
      tex(scene, "hazard_snowcloud", 72, 52, (g) => {
        g.fillStyle(0xdff3ff, 1);
        g.fillCircle(18, 24, 16);
        g.fillCircle(36, 18, 20);
        g.fillCircle(54, 24, 16);
        g.fillRoundedRect(12, 22, 50, 16, 10);
        g.fillStyle(0xffffff, 0.9);
        g.fillCircle(20, 44, 3);
        g.fillCircle(34, 48, 3);
        g.fillCircle(48, 44, 3);
        face(g, 36, 26);
      }),
  },
  {
    id: "cold_frozenveg",
    group: "cold",
    name: "Frozen Veggie",
    textureKey: "hazard_frozenveg",
    hitR: 24,
    anim: "bob",
    buildTexture: (scene) =>
      tex(scene, "hazard_frozenveg", 56, 48, (g) => {
        g.fillStyle(0x5fae5a, 1);
        g.fillCircle(16, 16, 14);
        g.fillCircle(30, 10, 12);
        g.fillCircle(40, 18, 13);
        g.fillStyle(0x3f7a3a, 1);
        g.fillRect(24, 24, 8, 16);
        g.fillStyle(0xbfe9ff, 0.5);
        g.fillCircle(16, 16, 14);
        g.fillCircle(30, 10, 12);
        g.fillCircle(40, 18, 13);
        face(g, 28, 16);
      }),
  },
  {
    id: "cold_icepatch",
    group: "cold",
    name: "Ice Patch",
    textureKey: "hazard_icepatch",
    hitR: 22,
    anim: "shimmer",
    yOffset: 16,
    buildTexture: (scene) =>
      tex(scene, "hazard_icepatch", 60, 28, (g) => {
        g.fillStyle(0xcdf2ff, 0.9);
        g.fillEllipse(30, 14, 56, 20);
        g.fillStyle(0xffffff, 0.7);
        g.fillEllipse(20, 10, 18, 8);
        face(g, 34, 14, 3);
      }),
  },
  {
    id: "cold_icelolly",
    group: "cold",
    name: "Ice Lolly",
    textureKey: "hazard_icelolly",
    hitR: 26,
    anim: "wiggle",
    buildTexture: (scene) =>
      tex(scene, "hazard_icelolly", 56, 56, (g) => {
        g.fillStyle(0x8a5a2a, 1);
        g.fillRect(24, 40, 8, 16);
        g.fillStyle(0x7fd6ff, 1);
        g.fillRoundedRect(10, 4, 36, 40, 14);
        g.fillStyle(0xffffff, 0.5);
        g.fillRoundedRect(16, 10, 12, 20, 6);
        face(g, 28, 26);
      }),
  },
];

export function buildHazardTextures(scene: Phaser.Scene) {
  HAZARDS.forEach((h) => h.buildTexture(scene));
}

export function getHazardById(id: string): HazardDef {
  return HAZARDS.find((h) => h.id === id) ?? HAZARDS[0];
}

/**
 * Picks a random hazard from a group, optionally restricted to the first
 * `variety` types (in catalogue order = unlock order) — this is how the
 * DifficultyManager gates obstacle variety without raising raw difficulty.
 */
export function pickRandomHazard(group: HazardGroup, variety?: number): HazardDef {
  const list = HAZARDS.filter((h) => h.group === group);
  const pool = variety ? list.slice(0, Math.max(1, variety)) : list;
  return pool[Phaser.Math.Between(0, pool.length - 1)];
}
