import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sausage Dash!" },
      {
        name: "description",
        content:
          "Sausage Dash! is a bright, friendly endless-runner game for children aged 3–5. Tap to jump, collect coins, dodge hot and cold hazards — never a game over.",
      },
      { property: "og:title", content: "Sausage Dash!" },
      { property: "og:description", content: "Sausage Dash! is a bright, friendly endless-runner game for children aged 3–5. Tap to jump, collect coins, dodge hot and cold hazards — never a game over." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const PhaserGame = lazy(() =>
  import("../game/PhaserGame").then((m) => ({ default: m.PhaserGame })),
);

function Page() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <main
      className="w-screen h-dvh overflow-hidden flex items-center justify-center"
      style={{
        background: "radial-gradient(ellipse at top, #fff2c0, #ffd0e5 60%, #ffbadd 100%)",
      }}
    >
      <h1 className="sr-only">Sausage Dash!</h1>
      <div className="w-full h-full max-w-[1200px] max-h-[100dvh] p-2">
        {mounted ? (
          <Suspense fallback={<Loader />}>
            <PhaserGame />
          </Suspense>
        ) : (
          <Loader />
        )}
      </div>
      <RotatePrompt />
      <FullscreenButton />
    </main>
  );
}

/**
 * Lets a parent get rid of the browser address bar without needing to know
 * "Add to Home Screen" exists. Android/desktop use the real Fullscreen API;
 * iOS Safari doesn't support that API for anything but <video>, so there the
 * button instead explains the Home Screen route (already wired up via the
 * PWA manifest) since that's the only way to get a chrome-less iOS view.
 */
function FullscreenButton() {
  const [isIOS, setIsIOS] = useState(false);
  const [standalone, setStandalone] = useState(true); // default hidden until checked
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const iOSDevice =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(iOSDevice);

    const standaloneMode =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setStandalone(standaloneMode);

    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  if (standalone) return null; // already chrome-less — nothing to offer

  const handleClick = () => {
    if (isIOS) {
      setShowIOSHint(true);
      return;
    }
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      document.documentElement.requestFullscreen?.().catch(() => {
        /* user gesture requirement or unsupported browser — ignore */
      });
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        aria-label="Full screen"
        className="fixed right-3 top-3 z-[9998] flex h-10 w-10 items-center justify-center rounded-full bg-white/70 shadow-md backdrop-blur-sm transition hover:bg-white/90"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          {isFullscreen ? (
            <path
              d="M7 3H3v4M13 3h4v4M7 17H3v-4M13 17h4v-4"
              stroke="#6a2a5a"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M3 7V3h4M13 3h4v4M3 13v4h4M13 17h4v-4"
              stroke="#6a2a5a"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </button>

      {showIOSHint && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-6"
          onClick={() => setShowIOSHint(false)}
        >
          <div
            className="max-w-xs rounded-2xl bg-white p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg font-bold text-[#6a2a5a]">Play full screen!</p>
            <p className="mt-2 text-sm text-[#6a2a5a]">
              Tap the Share icon in Safari, then "Add to Home Screen". Opening Sausage Dash! from
              its own icon plays with no browser bar at all.
            </p>
            <button
              onClick={() => setShowIOSHint(false)}
              className="mt-4 rounded-full bg-[#ff7a59] px-5 py-2 text-sm font-semibold text-white"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * The game is a fixed 960x540 landscape stage — on a touch phone held in its
 * natural portrait orientation it letterboxes down to a thin strip. This
 * overlay covers the game and asks for a rotate instead, shown only on
 * touch + portrait so desktop/tablet users resizing a window never see it.
 */
function RotatePrompt() {
  return (
    <div className="sd-rotate-prompt fixed inset-0 z-[9999] hidden items-center justify-center p-8 text-center">
      <div>
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          fill="none"
          className="mx-auto mb-4"
          aria-hidden="true"
        >
          <rect
            x="24"
            y="8"
            width="24"
            height="40"
            rx="4"
            stroke="#6a2a5a"
            strokeWidth="3"
            fill="#ffffff"
          />
          <circle cx="36" cy="42" r="1.5" fill="#6a2a5a" />
          <path
            d="M50 22 A20 20 0 0 1 54 40"
            stroke="#6a2a5a"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path d="M50 16 L50 22 L56 21 Z" fill="#6a2a5a" />
        </svg>
        <p className="text-2xl font-bold text-[#6a2a5a]">Turn me sideways!</p>
        <p className="mt-2 text-lg text-[#6a2a5a]">Sausage Dash! plays best in landscape.</p>
      </div>
      <style>{`
        @media (orientation: portrait) and (pointer: coarse) {
          .sd-rotate-prompt {
            display: flex !important;
            background: radial-gradient(ellipse at top, #fff2c0, #ffd0e5 60%, #ffbadd 100%);
          }
        }
      `}</style>
    </div>
  );
}

function Loader() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-4xl font-bold text-white drop-shadow-lg animate-pulse">
        Loading Sausage Dash!…
      </div>
    </div>
  );
}
