/**
 * Hud — coin/score readouts and the pause button. Pure display; GameScene
 * still owns pause behaviour and just calls into this for the button hookup.
 */
import Phaser from "phaser";
import { GAME_WIDTH } from "../config";
import { drawIcon } from "./icons";

export class Hud {
  private coinsText: Phaser.GameObjects.Text;
  private scoreText: Phaser.GameObjects.Text;
  private progressBar: Phaser.GameObjects.Graphics;
  private progressAccent: number;

  constructor(
    scene: Phaser.Scene,
    onPause: () => void,
    progressAccent = 0xffcf3a,
    chillMode = false,
  ) {
    this.progressAccent = progressAccent;
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

    // Journey progress toward this world's finish-line landmark.
    this.progressBar = scene.add.graphics().setScrollFactor(0);
    this.setProgress(0);

    // Small badge reminding the player Chill Mode (no hazards) is active.
    if (chillMode) {
      const badge = scene.add.graphics().setScrollFactor(0);
      badge.fillStyle(0x7ad9c4, 0.9);
      badge.fillCircle(30, 66, 16);
      drawIcon(badge, "shield", 30, 66, 10, 0xffffff);
    }

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

  /** `fraction` is 0..1 progress toward the world's finish-line landmark. */
  setProgress(fraction: number) {
    const clamped = Math.max(0, Math.min(1, fraction));
    const w = 220,
      h = 14,
      x = GAME_WIDTH / 2 - w / 2,
      y = 56;
    this.progressBar.clear();
    this.progressBar.fillStyle(0xffffff, 0.5);
    this.progressBar.fillRoundedRect(x, y, w, h, 7);
    if (clamped > 0) {
      this.progressBar.fillStyle(this.progressAccent, 1);
      this.progressBar.fillRoundedRect(x, y, Math.max(h, w * clamped), h, 7);
    }
  }
}
