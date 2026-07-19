/**
 * BootScene: procedurally builds every texture the game needs
 * (sausage body, coins, hazards, power-ups, particles). No file loading.
 */
import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  create() {
    this.makeSausage();
    this.makeCoin();
    this.makeStar();
    this.makeSparkle();
    this.makeBalloonC();
    this.makeJellyBean();
    this.makeKetchup();
    this.makeHazardHot();
    this.makeHazardCold();
    this.makePowerup();
    this.makeCloud();
    this.makeHill();
    this.makePixel();

    this.scene.start("Title");
  }

  private g() {
    return this.add.graphics().setVisible(false);
  }

  private makeSausage() {
    // Sausage body — soft rounded pill with a highlight.
    const g = this.g();
    const w = 110;
    const h = 60;
    g.fillStyle(0xd66a3a, 1);
    g.fillRoundedRect(0, 0, w, h, 28);
    g.fillStyle(0xe98d5a, 1);
    g.fillRoundedRect(6, 6, w - 12, h - 26, 22);
    g.fillStyle(0xffd0a8, 0.55);
    g.fillEllipse(30, 18, 40, 10);
    g.generateTexture("sausage", w, h);
    g.destroy();
  }

  private makeCoin() {
    const g = this.g();
    g.fillStyle(0xffcf3a, 1);
    g.fillCircle(20, 20, 18);
    g.fillStyle(0xfff2a8, 1);
    g.fillCircle(20, 20, 12);
    g.fillStyle(0xffcf3a, 1);
    g.fillRect(14, 12, 12, 16);
    g.generateTexture("coin", 40, 40);
    g.destroy();
  }

  private makeStar() {
    const g = this.g();
    g.fillStyle(0xfff29a, 1);
    const pts: number[] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 18 : 8;
      const a = (Math.PI * 2 * i) / 10 - Math.PI / 2;
      pts.push(20 + Math.cos(a) * r, 20 + Math.sin(a) * r);
    }
    g.fillPoints(
      Array.from({ length: pts.length / 2 }, (_, i) => ({ x: pts[i * 2], y: pts[i * 2 + 1] })),
      true,
    );
    g.generateTexture("star", 40, 40);
    g.destroy();
  }

  private makeSparkle() {
    const g = this.g();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(8, 8, 3);
    g.fillCircle(8, 8, 6.5);
    g.generateTexture("sparkle", 16, 16);
    g.destroy();
  }

  private makeBalloonC() {
    const g = this.g();
    g.fillStyle(0xff7fa5, 1);
    g.fillEllipse(22, 24, 34, 40);
    g.fillStyle(0xffbfd0, 0.7);
    g.fillEllipse(16, 18, 10, 14);
    g.lineStyle(2, 0x8a4a5f, 1);
    g.beginPath();
    g.moveTo(22, 44);
    g.lineTo(22, 62);
    g.strokePath();
    g.generateTexture("balloon_c", 44, 64);
    g.destroy();
  }

  private makeJellyBean() {
    const g = this.g();
    g.fillStyle(0x9fe27a, 1);
    g.fillEllipse(18, 12, 34, 22);
    g.fillStyle(0xd8f5c0, 0.8);
    g.fillEllipse(12, 8, 12, 6);
    g.generateTexture("jellybean", 36, 24);
    g.destroy();
  }

  private makeKetchup() {
    const g = this.g();
    g.fillStyle(0xe5334a, 1);
    g.fillRoundedRect(4, 10, 20, 30, 6);
    g.fillStyle(0xffffff, 1);
    g.fillRect(8, 18, 12, 12);
    g.fillStyle(0xd82030, 1);
    g.fillRoundedRect(8, 2, 12, 10, 3);
    g.generateTexture("ketchup", 28, 42);
    g.destroy();
  }

  private makeHazardHot() {
    // Frying pan silhouette
    const g = this.g();
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
    g.generateTexture("hot", 76, 60);
    g.destroy();
  }

  private makeHazardCold() {
    // Ice cube
    const g = this.g();
    g.fillStyle(0x9fe4ff, 1);
    g.fillRoundedRect(0, 0, 56, 56, 10);
    g.fillStyle(0xd8f2ff, 0.8);
    g.fillRoundedRect(8, 8, 22, 14, 6);
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(40, 40, 6);
    g.generateTexture("cold", 56, 56);
    g.destroy();
  }

  private makePowerup() {
    const g = this.g();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(24, 24, 22);
    g.lineStyle(4, 0xffd83a, 1);
    g.strokeCircle(24, 24, 22);
    g.generateTexture("powerup", 48, 48);
    g.destroy();
  }

  private makeCloud() {
    const g = this.g();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(20, 26, 18);
    g.fillCircle(40, 20, 22);
    g.fillCircle(62, 28, 18);
    g.fillRoundedRect(14, 24, 56, 18, 10);
    g.generateTexture("cloud", 84, 48);
    g.destroy();
  }

  private makeHill() {
    const g = this.g();
    g.fillStyle(0xffffff, 1); // tinted at runtime
    g.fillEllipse(120, 90, 240, 160);
    g.generateTexture("hill", 240, 100);
    g.destroy();
  }

  private makePixel() {
    const g = this.g();
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 4, 4);
    g.generateTexture("pixel", 4, 4);
    g.destroy();
  }
}
