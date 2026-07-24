/**
 * Small shop/wardrobe tile previews for cosmetic kinds that don't have a
 * simple flat `color` (faces, worlds) — without these, every face and every
 * world tile rendered as an identical gray placeholder box, giving the
 * player no way to tell them apart before buying/equipping.
 */
import Phaser from "phaser";
import { getWorld } from "../worlds";

/** Mini face preview matching a face cosmetic's actual expression. */
export function drawFaceSwatch(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  faceId: string,
) {
  g.fillStyle(0xe98d5a, 1);
  g.fillCircle(x, y, 20);

  g.fillStyle(0xffffff, 1);
  g.fillCircle(x - 7, y - 4, 5);
  g.fillCircle(x + 7, y - 4, 5);
  g.fillStyle(0x1a1a1a, 1);
  g.fillCircle(x - 6, y - 4, 2.5);
  g.fillCircle(x + 8, y - 4, 2.5);

  g.lineStyle(2, 0x5a2a1a, 1);
  if (faceId === "face_grin") {
    g.fillStyle(0x5a2a1a, 1);
    g.fillEllipse(x, y + 6, 16, 10);
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(x, y + 3, 12, 5);
  } else if (faceId === "face_wink") {
    g.fillStyle(0xffffff, 1);
    g.fillCircle(x - 7, y - 4, 5);
    g.fillStyle(0x1a1a1a, 1);
    g.fillCircle(x - 6, y - 4, 2.5);
    g.lineStyle(2, 0x1a1a1a, 1);
    g.beginPath();
    g.moveTo(x + 4, y - 4);
    g.lineTo(x + 11, y - 4);
    g.strokePath();
    g.lineStyle(2, 0x5a2a1a, 1);
    g.beginPath();
    g.arc(x, y + 5, 6, 0, Math.PI, false);
    g.strokePath();
  } else if (faceId === "face_tongue") {
    g.beginPath();
    g.arc(x, y + 5, 6, 0, Math.PI, false);
    g.strokePath();
    g.fillStyle(0xff6f8f, 1);
    g.fillEllipse(x + 2, y + 9, 6, 5);
  } else if (faceId === "face_shades") {
    g.fillStyle(0x1a1a1a, 1);
    g.fillRoundedRect(x - 13, y - 8, 26, 7, 3);
    g.fillStyle(0x66d6ff, 0.7);
    g.fillRoundedRect(x - 12, y - 7, 11, 5, 2);
    g.fillRoundedRect(x, y - 7, 11, 5, 2);
    g.lineStyle(2, 0x5a2a1a, 1);
    g.beginPath();
    g.arc(x, y + 5, 5, 0, Math.PI, false);
    g.strokePath();
  } else {
    g.beginPath();
    g.arc(x, y + 3, 6, 0, Math.PI, false);
    g.strokePath();
  }
}

/** Mini sky/ground/accent preview matching a world's actual palette. */
export function drawWorldSwatch(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  worldId: string,
) {
  const world = getWorld(worldId);
  g.fillStyle(world.sky[1], 1);
  g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
  g.fillStyle(world.ground, 1);
  g.fillRect(x - w / 2, y - h / 2 + h * 0.6, w, h * 0.4);
  g.fillStyle(world.accent, 1);
  g.fillCircle(x - w / 2 + w * 0.25, y - h / 2 + h * 0.3, h * 0.16);
}

/** Mini preview of a coin-counter cosmetic (jar/piggy bank/treasure chest). */
export function drawBankSwatch(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  bankId: string,
) {
  if (bankId === "bank_piggy") {
    // Bold body + one big snout circle + a simple ear, all outlined — reads
    // clearly even at the small size the HUD actually shows it at, unlike
    // the old version's thin strap/tiny dot details.
    g.lineStyle(2, 0xcc4d78, 1);
    g.fillStyle(0xff9fc0, 1);
    g.fillEllipse(x, y + 2, 34, 24);
    g.strokeEllipse(x, y + 2, 34, 24);
    g.fillTriangle(x + 9, y - 9, x + 19, y - 15, x + 17, y - 3);
    g.strokeTriangle(x + 9, y - 9, x + 19, y - 15, x + 17, y - 3);
    g.fillStyle(0xff6f9f, 1);
    g.fillCircle(x + 13, y + 3, 6);
    g.lineStyle(2, 0xcc4d78, 1);
    g.strokeCircle(x + 13, y + 3, 6);
  } else if (bankId === "bank_chest") {
    // Bold filled dome for the lid (the old stroked arc had no lineStyle set
    // on this graphics object, so it silently rendered invisible) + a big
    // gold lock square, both outlined for definition against light tiles.
    g.lineStyle(2, 0x6a4420, 1);
    g.fillStyle(0xb0763a, 1);
    g.fillRoundedRect(x - 18, y - 4, 36, 18, 4);
    g.strokeRoundedRect(x - 18, y - 4, 36, 18, 4);
    g.fillStyle(0x8a5a2a, 1);
    g.beginPath();
    g.arc(x, y - 4, 18, Math.PI, 0, false);
    g.closePath();
    g.fillPath();
    g.strokePath();
    g.fillStyle(0xffd83a, 1);
    g.fillRoundedRect(x - 5, y - 7, 10, 10, 2);
    g.lineStyle(2, 0xb08a1a, 1);
    g.strokeRoundedRect(x - 5, y - 7, 10, 10, 2);
  } else {
    g.fillStyle(0xcdeffd, 0.9);
    g.fillRoundedRect(x - 14, y - 12, 28, 26, 6);
    g.fillStyle(0xaee3f7, 1);
    g.fillRoundedRect(x - 16, y - 16, 32, 6, 3);
    g.fillStyle(0xffd83a, 1);
    g.fillCircle(x, y, 5);
  }
}

/** Flat-color swatch for hats/trails — used by Shop, Wardrobe, and the
 *  Sticker Book. Always outlined: a pure-white item (e.g. Chef Hat) would
 *  otherwise vanish into the near-white tile background with no way to
 *  tell it apart from an empty slot. */
export function drawFlatSwatch(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number | undefined,
  color2?: number,
) {
  g.fillStyle(color ?? 0x999999, 1);
  g.fillRoundedRect(x - w / 2, y - h / 2, w, h, w * 0.17);
  g.lineStyle(2, 0xcccccc, 1);
  g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, w * 0.17);
  if (color2) {
    const w2 = w * 0.5,
      h2 = h * 0.6;
    g.fillStyle(color2, 1);
    g.fillRoundedRect(x - w / 6, y - h2 / 2, w2, h2, w2 * 0.2);
  }
}
