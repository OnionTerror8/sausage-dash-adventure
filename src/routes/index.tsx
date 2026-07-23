import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sausage Dash! — A cheerful runner for little kids" },
      {
        name: "description",
        content:
          "Sausage Dash! is a bright, friendly endless-runner game for children aged 3–5. Tap to jump, collect coins, dodge hot and cold hazards — never a game over.",
      },
      { property: "og:title", content: "Sausage Dash!" },
      { property: "og:description", content: "A cheerful tap-to-jump runner for little kids." },
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
    </main>
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
