/**
 * Client-only Phaser mount. Instantiates the game once and destroys on unmount.
 */
import { useEffect, useRef } from "react";
import type Phaser from "phaser";

export function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;
    (async () => {
      const Phaser = (await import("phaser")).default;
      const { BootScene } = await import("./scenes/BootScene");
      const { TitleScene } = await import("./scenes/TitleScene");
      const { GameScene } = await import("./scenes/GameScene");
      const { ShopScene } = await import("./scenes/ShopScene");
      const { WardrobeScene } = await import("./scenes/WardrobeScene");
      const { StickerBookScene } = await import("./scenes/StickerBookScene");
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
          // The container div already centers via CSS flexbox (below). Phaser's
          // own CENTER_BOTH also centers by setting a margin-top on the canvas —
          // combined with the flex container's align-items:center, the two
          // centering mechanisms compound and push the canvas off-center. Let
          // CSS own it exclusively.
          autoCenter: Phaser.Scale.NO_CENTER,
        },
        scene: [BootScene, TitleScene, GameScene, ShopScene, WardrobeScene, StickerBookScene],
        render: { antialias: true, pixelArt: false },
        input: { activePointers: 2 },
        // All sound is hand-rolled WebAudio (sfx.ts/music.ts) — skip Phaser's
        // own sound manager so it doesn't spin up a second, unused AudioContext.
        audio: { noAudio: true },
      });

      // Mobile browsers resolve `dvh` after their address bar collapses/expands,
      // which reflows our container without firing a `window.resize` — the one
      // event Phaser's Scale Manager listens for. Without this, FIT's centering
      // can end up computed against a stale parent size (canvas pinned off-center).
      // ResizeObserver catches that reflow directly and tells Phaser to recompute.
      if (containerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          gameRef.current?.scale.refresh();
        });
        resizeObserver.observe(containerRef.current);
      }
    })();
    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
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
