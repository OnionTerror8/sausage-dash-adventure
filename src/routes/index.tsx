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
        background:
          "radial-gradient(ellipse at top, #fff2c0, #ffd0e5 60%, #ffbadd 100%)",
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
    </main>
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
