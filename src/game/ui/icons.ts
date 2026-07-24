/**
 * Simple flat vector icons drawn directly with Graphics — no image assets,
 * consistent with the rest of the game's procedural-art approach. Used
 * alongside (or instead of) text labels so pre-reading players can navigate
 * by icon shape alone.
 */
import Phaser from "phaser";

export type IconKind =
  | "play"
  | "back"
  | "forward"
  | "replay"
  | "home"
  | "shop"
  | "wardrobe"
  | "sound-on"
  | "sound-off"
  | "music-on"
  | "music-off"
  | "check"
  | "lock"
  | "hat"
  | "face"
  | "sparkle"
  | "globe"
  | "shield"
  | "bank"
  | "book";

/** Draws an icon centered at (cx, cy). `s` is roughly the icon's half-size. */
export function drawIcon(
  g: Phaser.GameObjects.Graphics,
  kind: IconKind,
  cx: number,
  cy: number,
  s: number,
  color = 0xffffff,
) {
  g.fillStyle(color, 1);
  g.lineStyle(Math.max(2, s * 0.22), color, 1);

  switch (kind) {
    case "play":
      g.fillTriangle(cx - s * 0.6, cy - s, cx - s * 0.6, cy + s, cx + s, cy);
      break;

    case "back":
      g.beginPath();
      g.moveTo(cx + s * 0.6, cy - s);
      g.lineTo(cx - s * 0.6, cy);
      g.lineTo(cx + s * 0.6, cy + s);
      g.strokePath();
      break;

    case "forward":
      g.beginPath();
      g.moveTo(cx - s * 0.6, cy - s);
      g.lineTo(cx + s * 0.6, cy);
      g.lineTo(cx - s * 0.6, cy + s);
      g.strokePath();
      break;

    case "replay":
      g.beginPath();
      g.arc(cx, cy, s * 0.8, Phaser.Math.DegToRad(-30), Phaser.Math.DegToRad(250), false);
      g.strokePath();
      g.fillTriangle(
        cx + s * 0.55,
        cy - s * 0.85,
        cx + s * 1.05,
        cy - s * 0.55,
        cx + s * 0.45,
        cy - s * 0.35,
      );
      break;

    case "home":
      g.fillTriangle(cx - s, cy, cx + s, cy, cx, cy - s);
      g.fillRect(cx - s * 0.65, cy, s * 1.3, s * 0.9);
      break;

    case "shop":
      // A little cart — trapezoid basket + wheels + handle, unmistakable
      // from "lock" (which is a rounded body + single centered shackle).
      g.beginPath();
      g.moveTo(cx - s * 0.9, cy - s * 0.5);
      g.lineTo(cx + s * 0.9, cy - s * 0.5);
      g.lineTo(cx + s * 0.6, cy + s * 0.35);
      g.lineTo(cx - s * 0.6, cy + s * 0.35);
      g.closePath();
      g.fillPath();
      g.fillCircle(cx - s * 0.35, cy + s * 0.85, s * 0.18);
      g.fillCircle(cx + s * 0.35, cy + s * 0.85, s * 0.18);
      g.beginPath();
      g.moveTo(cx - s * 0.9, cy - s * 0.5);
      g.lineTo(cx - s * 1.3, cy - s * 0.95);
      g.strokePath();
      break;

    case "wardrobe":
      g.beginPath();
      g.arc(cx, cy - s * 0.65, s * 0.25, Math.PI * 0.2, Math.PI * 1.6, false);
      g.strokePath();
      g.beginPath();
      g.moveTo(cx, cy - s * 0.4);
      g.lineTo(cx - s, cy + s * 0.4);
      g.lineTo(cx + s, cy + s * 0.4);
      g.strokePath();
      break;

    case "sound-on":
    case "sound-off":
      g.fillRect(cx - s, cy - s * 0.4, s * 0.7, s * 0.8);
      g.fillTriangle(cx - s * 0.3, cy - s * 0.4, cx - s * 0.3, cy + s * 0.4, cx + s * 0.3, cy + s);
      g.fillTriangle(cx - s * 0.3, cy - s * 0.4, cx + s * 0.3, cy - s, cx + s * 0.3, cy + s * 0.4);
      if (kind === "sound-on") {
        g.beginPath();
        g.arc(cx + s * 0.1, cy, s * 0.7, -Math.PI / 3, Math.PI / 3, false);
        g.strokePath();
        g.beginPath();
        g.arc(cx + s * 0.1, cy, s * 1.05, -Math.PI / 3.5, Math.PI / 3.5, false);
        g.strokePath();
      } else {
        g.beginPath();
        g.moveTo(cx + s * 0.35, cy - s * 0.5);
        g.lineTo(cx + s * 1.15, cy + s * 0.5);
        g.strokePath();
        g.beginPath();
        g.moveTo(cx + s * 1.15, cy - s * 0.5);
        g.lineTo(cx + s * 0.35, cy + s * 0.5);
        g.strokePath();
      }
      break;

    case "music-on":
    case "music-off":
      g.fillCircle(cx - s * 0.5, cy + s * 0.6, s * 0.4);
      g.fillRect(cx - s * 0.15, cy - s, s * 0.2, s * 1.6);
      g.fillTriangle(
        cx - s * 0.15,
        cy - s,
        cx + s * 0.6,
        cy - s * 0.7,
        cx - s * 0.15,
        cy - s * 0.4,
      );
      if (kind === "music-off") {
        g.beginPath();
        g.moveTo(cx - s, cy - s);
        g.lineTo(cx + s, cy + s);
        g.strokePath();
      }
      break;

    case "check":
      g.lineStyle(Math.max(3, s * 0.3), color, 1);
      g.beginPath();
      g.moveTo(cx - s, cy);
      g.lineTo(cx - s * 0.2, cy + s * 0.8);
      g.lineTo(cx + s, cy - s * 0.7);
      g.strokePath();
      break;

    case "lock":
      g.fillRoundedRect(cx - s * 0.7, cy - s * 0.1, s * 1.4, s, s * 0.25);
      g.beginPath();
      g.arc(cx, cy - s * 0.35, s * 0.5, Math.PI, 0, false);
      g.strokePath();
      break;

    case "hat":
      g.fillTriangle(cx, cy - s, cx - s * 0.7, cy + s * 0.3, cx + s * 0.7, cy + s * 0.3);
      g.fillRoundedRect(cx - s, cy + s * 0.2, s * 2, s * 0.35, s * 0.15);
      break;

    case "face":
      // Pure line-art (like back/forward/check) so it always contrasts with
      // whatever button color it's drawn on — a filled face + hardcoded dark
      // eye color would vanish against an already-dark foreground color.
      g.strokeCircle(cx, cy, s);
      g.fillCircle(cx - s * 0.35, cy - s * 0.15, s * 0.14);
      g.fillCircle(cx + s * 0.35, cy - s * 0.15, s * 0.14);
      g.beginPath();
      g.arc(cx, cy + s * 0.1, s * 0.5, 0.2, Math.PI - 0.2, false);
      g.strokePath();
      break;

    case "sparkle": {
      const pts: Phaser.Math.Vector2[] = [];
      for (let i = 0; i < 8; i++) {
        const r = i % 2 === 0 ? s : s * 0.4;
        const a = (Math.PI * 2 * i) / 8 - Math.PI / 2;
        pts.push(new Phaser.Math.Vector2(cx + Math.cos(a) * r, cy + Math.sin(a) * r));
      }
      g.fillPoints(pts, true);
      break;
    }

    case "globe":
      g.strokeCircle(cx, cy, s);
      g.strokeEllipse(cx, cy, s * 2, s * 0.85);
      g.lineBetween(cx, cy - s, cx, cy + s);
      break;

    case "shield":
      g.beginPath();
      g.moveTo(cx, cy - s);
      g.lineTo(cx + s * 0.8, cy - s * 0.55);
      g.lineTo(cx + s * 0.8, cy + s * 0.15);
      g.lineTo(cx, cy + s);
      g.lineTo(cx - s * 0.8, cy + s * 0.15);
      g.lineTo(cx - s * 0.8, cy - s * 0.55);
      g.closePath();
      g.strokePath();
      break;

    case "bank":
      g.fillRoundedRect(cx - s * 0.8, cy - s * 0.5, s * 1.6, s * 1.3, s * 0.25);
      g.fillRect(cx - s * 0.9, cy - s * 0.8, s * 1.8, s * 0.3);
      break;

    case "book":
      // Two wide, short "pages" (not tall bars, which read as a pause icon)
      // with short text-line strokes on each — unambiguous as an open book.
      g.strokeRoundedRect(cx - s * 1.05, cy - s * 0.55, s * 0.95, s * 1.1, s * 0.12);
      g.strokeRoundedRect(cx + s * 0.1, cy - s * 0.55, s * 0.95, s * 1.1, s * 0.12);
      g.beginPath();
      g.moveTo(cx - s * 0.8, cy - s * 0.15);
      g.lineTo(cx - s * 0.3, cy - s * 0.15);
      g.moveTo(cx - s * 0.8, cy + s * 0.2);
      g.lineTo(cx - s * 0.3, cy + s * 0.2);
      g.moveTo(cx + s * 0.3, cy - s * 0.15);
      g.lineTo(cx + s * 0.8, cy - s * 0.15);
      g.moveTo(cx + s * 0.3, cy + s * 0.2);
      g.lineTo(cx + s * 0.8, cy + s * 0.2);
      g.strokePath();
      break;
  }
}
