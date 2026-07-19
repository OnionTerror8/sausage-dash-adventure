/**
 * Client-only Phaser mount. Instantiates the game once and destroys on unmount.
 */
import { useEffect, useRef } from "react";

export function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const Phaser = (await import("phaser")).default;
      const { BootScene } = await import("./scenes/BootScene");
      const { TitleScene } = await import("./scenes/TitleScene");
      const { GameScene } = await import("./scenes/GameScene");
      const { ShopScene } = await import("./scenes/ShopScene");
      const { GAME_WIDTH, GAME_HEIGHT } = await import("./config");
      if (cancelled || !containerRef.current) return;

      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        backgroundColor: "#ffe9c0",
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        scene: [BootScene, TitleScene, GameScene, ShopScene],
        render: { antialias: true, pixelArt: false },
        input: { activePointers: 2 },
      });
    })();
    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center"
      style={{ touchAction: "manipulation" }}
    />
  );
}
