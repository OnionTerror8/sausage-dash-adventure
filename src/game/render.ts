/**
 * Renders the sausage character with equipped cosmetics into a container.
 * Shared by title, shop, and game scenes so the look stays consistent.
 */
import Phaser from "phaser";
import { byId } from "./cosmetics";
import type { SaveData } from "./storage";

export function drawSausage(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  equipped: SaveData["equipped"],
) {
  container.removeAll(true);

  // Body
  const body = scene.add.image(0, 0, "sausage");
  container.add(body);

  // Face
  const face = equipped.face ?? "face_smile";
  const eyes = scene.add.graphics();
  eyes.fillStyle(0xffffff, 1);
  eyes.fillCircle(-14, -6, 8);
  eyes.fillCircle(14, -6, 8);
  eyes.fillStyle(0x1a1a1a, 1);
  eyes.fillCircle(-12, -6, 4);
  eyes.fillCircle(16, -6, 4);
  container.add(eyes);

  const mouth = scene.add.graphics();
  mouth.lineStyle(3, 0x5a2a1a, 1);
  if (face === "face_grin") {
    // Wide open-mouth grin: a filled dark oval (not just a stroked outline)
    // with a white "teeth" band reads as clearly happy at gameplay scale,
    // instead of the old flat stroked bar that looked neutral/frowning.
    mouth.fillStyle(0x5a2a1a, 1);
    mouth.fillEllipse(0, 11, 26, 16);
    mouth.fillStyle(0xffffff, 1);
    mouth.fillEllipse(0, 6, 20, 8);
  } else if (face === "face_wink") {
    mouth.beginPath();
    mouth.arc(0, 8, 10, 0, Math.PI, false);
    mouth.strokePath();
    eyes.clear();
    eyes.fillStyle(0xffffff, 1);
    eyes.fillCircle(-14, -6, 8);
    eyes.fillStyle(0x1a1a1a, 1);
    eyes.fillCircle(-12, -6, 4);
    eyes.lineStyle(3, 0x1a1a1a, 1);
    eyes.beginPath();
    eyes.moveTo(8, -6);
    eyes.lineTo(22, -6);
    eyes.strokePath();
  } else if (face === "face_tongue") {
    mouth.beginPath();
    mouth.arc(0, 8, 10, 0, Math.PI, false);
    mouth.strokePath();
    mouth.fillStyle(0xff6f8f, 1);
    mouth.fillEllipse(4, 16, 10, 8);
  } else if (face === "face_shades") {
    eyes.clear();
    eyes.fillStyle(0x1a1a1a, 1);
    eyes.fillRoundedRect(-24, -12, 44, 12, 4);
    eyes.fillStyle(0x66d6ff, 0.6);
    eyes.fillRoundedRect(-22, -11, 18, 8, 3);
    eyes.fillRoundedRect(0, -11, 18, 8, 3);
    mouth.beginPath();
    mouth.arc(0, 8, 8, 0, Math.PI, false);
    mouth.strokePath();
  } else {
    // smile
    mouth.beginPath();
    mouth.arc(0, 6, 10, 0, Math.PI, false);
    mouth.strokePath();
  }
  container.add(mouth);

  // Hat
  const hat = equipped.hat ?? "hat_none";
  const h = scene.add.graphics();
  const hy = -30;
  if (hat === "hat_chef") {
    h.fillStyle(0xffffff, 1);
    h.fillEllipse(0, hy - 14, 46, 22);
    h.fillRoundedRect(-18, hy - 6, 36, 14, 6);
  } else if (hat === "hat_pirate") {
    h.fillStyle(0x2a2a2a, 1);
    h.fillTriangle(-30, hy, 30, hy, 0, hy - 22);
    h.fillStyle(0xffffff, 1);
    h.fillCircle(0, hy - 10, 4);
    h.fillRect(-3, hy - 14, 2, 8);
    h.fillRect(1, hy - 14, 2, 8);
  } else if (hat === "hat_cowboy") {
    h.fillStyle(0xb0763a, 1);
    h.fillEllipse(0, hy + 2, 60, 10);
    h.fillRoundedRect(-16, hy - 14, 32, 18, 8);
  } else if (hat === "hat_crown") {
    h.fillStyle(0xffd83a, 1);
    h.fillRect(-22, hy - 4, 44, 10);
    h.fillTriangle(-22, hy - 4, -12, hy - 4, -17, hy - 20);
    h.fillTriangle(-2, hy - 4, 12, hy - 4, 5, hy - 22);
    h.fillTriangle(12, hy - 4, 22, hy - 4, 17, hy - 20);
    h.fillStyle(0xff5faf, 1);
    h.fillCircle(-17, hy - 18, 3);
    h.fillCircle(5, hy - 20, 3);
    h.fillCircle(17, hy - 18, 3);
  } else if (hat === "hat_birthday") {
    h.fillStyle(0xff5faf, 1);
    h.fillTriangle(-16, hy, 16, hy, 0, hy - 32);
    h.fillStyle(0x5fd0ff, 1);
    h.fillCircle(0, hy - 32, 5);
  } else if (hat === "hat_viking") {
    h.fillStyle(0xa0a0a8, 1);
    h.fillEllipse(0, hy - 4, 44, 26);
    h.fillStyle(0xf0e0a0, 1);
    h.fillTriangle(-26, hy - 4, -18, hy - 4, -30, hy - 20);
    h.fillTriangle(26, hy - 4, 18, hy - 4, 30, hy - 20);
  } else if (hat === "hat_dino") {
    h.fillStyle(0x5fd07a, 1);
    h.fillRoundedRect(-22, hy - 8, 44, 16, 8);
    for (let i = -18; i <= 18; i += 8) {
      h.fillTriangle(i - 3, hy - 8, i + 3, hy - 8, i, hy - 18);
    }
  } else if (hat === "hat_beanie") {
    h.fillStyle(0x5faaff, 1);
    h.fillRoundedRect(-22, hy - 12, 44, 20, 8);
    h.fillStyle(0xffffff, 1);
    h.fillRect(-22, hy - 2, 44, 8);
    h.fillCircle(0, hy - 16, 6);
  }
  container.add(h);
}
