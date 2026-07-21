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
