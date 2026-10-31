"use client";

import * as React from "react";
import Link from "next/link";
import { RegistrationCanvas, type RegistrationCanvasHandle } from "./RegistrationCanvas";
import { useReducedMotionFlag } from "./useReducedMotionFlag";
import type { GameState } from "./engine";

export function InlineGame() {
  const canvasHandleRef = React.useRef<RegistrationCanvasHandle>(null);
  const timerLineRef = React.useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionFlag();

  const [gameState, setGameState] = React.useState<GameState>("intro");
  const [sheets, setSheets] = React.useState<number>(3);
  const [prints, setPrints] = React.useState<number>(0);
  const [best, setBest] = React.useState<number>(0);

  const handleStart = React.useCallback(() => {
    canvasHandleRef.current?.start();
  }, []);

  const handleRestart = React.useCallback(() => {
    canvasHandleRef.current?.restart();
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-[var(--background)] border border-[var(--line-strong)] rounded-xl">
      {/* Hatched border frame at the top */}
      <div
        className="h-4 border-b border-[var(--line)]"
        style={{
          background: `repeating-linear-gradient(
            315deg,
            var(--line) 0,
            var(--line) 1px,
            transparent 0,
            transparent 50%
          ) 0 0 / 6px 6px`,
        }}
        aria-hidden="true"
      />

      {/* Top Bar HUD */}
      <div className="h-10 px-4 border-b border-[var(--line)] flex items-center justify-between text-xs font-mono text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="text-foreground font-semibold uppercase tracking-wider text-[11px]">
            Registration
          </span>
          <span>·</span>
          <span>Sheets: {sheets}/3</span>
        </div>

        <div className="flex items-center gap-4 tabular-nums">
          <span>Prints: <strong className="text-foreground">{String(prints).padStart(2, "0")}</strong></span>
          <span>Best: {String(best).padStart(2, "0")}</span>
        </div>
      </div>

      {/* 2px timer line */}
      <div
        ref={timerLineRef}
        aria-hidden="true"
        style={{ transformOrigin: "left", transform: "scaleX(1)" }}
        className="h-[2px] bg-foreground w-full will-change-transform"
      />

      {/* Canvas Area */}
      <div className="relative h-64 sm:h-80 w-full flex items-center justify-center overflow-hidden">
        <RegistrationCanvas
          ref={canvasHandleRef}
          timerLineRef={timerLineRef}
          onSheetsChange={setSheets}
          onPrintsChange={setPrints}
          onBestChange={setBest}
          onStatus={() => {}}
          onGameOver={() => {}}
          onStateChange={setGameState}
          reducedMotion={reducedMotion}
        />

        {gameState === "intro" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-black/40 backdrop-blur-xs gap-3">
            <p className="text-sm text-foreground text-center max-w-xs font-sans">
              Steer the plate onto the outline and hold it for a second.
            </p>
            <button
              type="button"
              onClick={handleStart}
              className="h-9 px-5 rounded-lg bg-foreground text-background font-medium text-sm flex items-center justify-center hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Start Game
            </button>
          </div>
        )}

        {gameState === "over" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-black/50 backdrop-blur-xs gap-2">
            <h4 className="text-xl font-medium text-foreground">
              Out of sheets.
            </h4>
            <p className="font-mono text-xs text-muted-foreground">
              Final prints: {prints} · Best: {best}
            </p>
            <button
              type="button"
              onClick={handleRestart}
              className="mt-2 h-9 px-5 rounded-lg bg-foreground text-background font-medium text-sm flex items-center justify-center hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Play again
            </button>
          </div>
        )}
      </div>

      {/* Caption & link home */}
      <div className="p-3 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-muted-foreground bg-[var(--background)]">
        <span>404. Page not found. Play instead.</span>
        <Link href="/" className="link text-foreground font-medium">
          ← Return to home
        </Link>
      </div>
    </div>
  );
}

