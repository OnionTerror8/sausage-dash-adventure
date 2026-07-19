/**
 * Hud — coin/score readouts and the pause button. Pure display; GameScene
 * still owns pause behaviour and just calls into this for the button hookup.
 */
import Phaser from "phaser";
import { GAME_WIDTH } from "../config";

export class Hud {
  private coinsText: Phaser.GameObjects.Text;
  private scoreText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, onPause: () => void) {
    scene.add.image(30, 30, "coin").setScale(1).setScrollFactor(0);
    this.coinsText = scene.add
      .text(56, 12, "0", {
        fontFamily: "'Fredoka',system-ui,sans-serif",
        fontSize: "34px",
        color: "#ffffff",
        stroke: "#6a4a1a",
        strokeThickness: 6,
      })
      .setScrollFactor(0);

    this.scoreText = scene.add
      .text(GAME_WIDTH / 2, 20, "0", {
        fontFamily: "'Fredoka',system-ui,sans-serif",
        fontSize: "32px",
        color: "#ffffff",
        stroke: "#333333",
        strokeThickness: 5,
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0);

    const pw = 68;
    const px = GAME_WIDTH - pw / 2 - 16;
    const py = 40;
    const bg = scene.add.graphics();
    bg.fillStyle(0xffffff, 0.9);
    bg.fillRoundedRect(px - pw / 2, py - 26, pw, 52, 14);
    bg.fillStyle(0x5a5a5a, 1);
    bg.fillRect(px - 12, py - 14, 6, 28);
    bg.fillRect(px + 6, py - 14, 6, 28);
    const hit = scene.add
      .rectangle(px, py, pw, 52, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    hit.on("pointerdown", onPause);
  }

  setCoins(n: number) {
    this.coinsText.setText(String(n));
  }

  setScore(n: number) {
    this.scoreText.setText(String(n));
  }
}
