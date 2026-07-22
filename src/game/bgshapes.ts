/**
 * Distant background silhouettes — one motif per world, drawn behind the
 * cloud layer for a bit more visual identity per world without any
 * gameplay complexity. Same procedural-Graphics approach as everything else.
 */
import Phaser from "phaser";

export type BgMotifKind = "cupcake" | "tree" | "tent" | "balloon" | "rainbow" | "candycane";

export function drawBgMotif(
  g: Phaser.GameObjects.Graphics,
  kind: BgMotifKind,
  cx: number,
  cy: number,
  s: number,
  color: number,
) {
  g.fillStyle(color, 1);
  g.lineStyle(Math.max(2, s * 0.25), color, 1);

  switch (kind) {
    case "cupcake": {
      // Flat-topped wrapper (not a pointed triangle, so it doesn't read as a
      // head-on-a-stick) with the frosting swirl overlapping its rim, plus a
      // cherry on top — recognizable as a cupcake rather than a person/pin.
      g.beginPath();
      g.moveTo(cx - s * 0.7, cy + s);
      g.lineTo(cx + s * 0.7, cy + s);
      g.lineTo(cx + s * 0.4, cy + s * 0.15);
      g.lineTo(cx - s * 0.4, cy + s * 0.15);
      g.closePath();
      g.fillPath();
      g.fillCircle(cx, cy - s * 0.15, s * 0.55);
      g.fillCircle(cx - s * 0.25, cy - s * 0.45, s * 0.3);
      g.fillCircle(cx + s * 0.25, cy - s * 0.45, s * 0.3);
      g.fillCircle(cx, cy - s * 0.75, s * 0.12);
      break;
    }
    case "tree":
      g.fillRect(cx - s * 0.15, cy, s * 0.3, s * 0.8);
      g.fillCircle(cx, cy - s * 0.3, s * 0.9);
      break;
    case "tent":
      g.fillTriangle(cx - s, cy + s, cx + s, cy + s, cx, cy - s);
      // Entrance-flap lines so it reads as a tent, not a plain triangle/mountain.
      g.beginPath();
      g.moveTo(cx, cy - s * 0.2);
      g.lineTo(cx - s * 0.25, cy + s);
      g.moveTo(cx, cy - s * 0.2);
      g.lineTo(cx + s * 0.25, cy + s);
      g.strokePath();
      break;
    case "balloon":
      g.fillEllipse(cx, cy, s * 1.1, s * 1.4);
      g.fillTriangle(cx - s * 0.1, cy + s * 1.3, cx + s * 0.1, cy + s * 1.3, cx, cy + s * 1.5);
      g.lineBetween(cx, cy + s * 1.5, cx, cy + s * 2.2);
      break;
    case "rainbow":
      // Three concentric bands read as a rainbow arch even in monochrome silhouette.
      for (let i = 0; i < 3; i++) {
        g.beginPath();
        g.arc(cx, cy + s, s * (1.4 - i * 0.3), Math.PI, 0, false);
        g.strokePath();
      }
      break;
    case "candycane":
      g.beginPath();
      g.arc(cx, cy - s * 0.5, s * 0.5, Math.PI, Math.PI * 1.8, false);
      g.strokePath();
      g.lineBetween(cx + s * 0.5, cy - s * 0.5, cx + s * 0.5, cy + s);
      // Diagonal stripe ticks reinforce the candy-cane read.
      for (let i = 0; i < 3; i++) {
        g.lineBetween(
          cx + s * 0.3,
          cy + s * (0.1 + i * 0.3),
          cx + s * 0.7,
          cy + s * (0.3 + i * 0.3),
        );
      }
      break;
  }
}
