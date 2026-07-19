/**
 * Small shared visual-effect helpers (sparkle bursts, floating text).
 * Used by GameScene and its entity/manager modules.
 */
import Phaser from "phaser";

export function burst(scene: Phaser.Scene, x: number, y: number, color: number, count = 12) {
  for (let i = 0; i < count; i++) {
    const p = scene.add
      .image(x, y, "sparkle")
      .setTint(color)
      .setScale(1 + Math.random());
    const a = Math.random() * Math.PI * 2;
    const d = 30 + Math.random() * 70;
    scene.tweens.add({
      targets: p,
      x: x + Math.cos(a) * d,
      y: y + Math.sin(a) * d,
      alpha: 0,
      scale: 0.2,
      duration: 500 + Math.random() * 300,
      onComplete: () => p.destroy(),
    });
  }
}

export function floatText(
  scene: Phaser.Scene,
  msg: string,
  x: number,
  y: number,
  color = 0xffffff,
  size = 22,
) {
  const t = scene.add
    .text(x, y, msg, {
      fontFamily: "'Fredoka',system-ui,sans-serif",
      fontSize: `${size}px`,
      color: "#" + color.toString(16).padStart(6, "0"),
      stroke: "#00000055",
      strokeThickness: 3,
    })
    .setOrigin(0.5);
  scene.tweens.add({
    targets: t,
    y: y - 60,
    alpha: 0,
    duration: 900,
    onComplete: () => t.destroy(),
  });
}
