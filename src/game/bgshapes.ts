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
    case "cupcake":
      g.fillTriangle(cx - s, cy + s, cx + s, cy + s, cx, cy - s * 0.2);
      g.fillCircle(cx, cy - s * 0.6, s * 0.6);
      break;
    case "tree":
      g.fillRect(cx - s * 0.15, cy, s * 0.3, s * 0.8);
      g.fillCircle(cx, cy - s * 0.3, s * 0.9);
      break;
    case "tent":
      g.fillTriangle(cx - s, cy + s, cx + s, cy + s, cx, cy - s);
      break;
    case "balloon":
      g.fillEllipse(cx, cy, s * 1.1, s * 1.4);
      g.lineBetween(cx, cy + s * 1.4, cx, cy + s * 2.2);
      break;
    case "rainbow":
      g.beginPath();
      g.arc(cx, cy + s, s * 1.4, Math.PI, 0, false);
      g.strokePath();
      break;
    case "candycane":
      g.beginPath();
      g.arc(cx, cy - s * 0.5, s * 0.5, Math.PI, Math.PI * 1.8, false);
      g.strokePath();
      g.lineBetween(cx + s * 0.5, cy - s * 0.5, cx + s * 0.5, cy + s);
      break;
  }
}
