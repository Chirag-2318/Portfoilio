"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { animate } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { EASE_IN_OUT_QUART } from "@/components/motion/ease";
import { useReducedMotionFlag } from "./useReducedMotionFlag";
import {
  RegistrationCanvas,
  type RegistrationCanvasHandle,
} from "./RegistrationCanvas";
import type { GameState } from "./engine";

export interface GameOverlayProps {
  open: boolean;
  origin?: { x: number; y: number } | null;
  onExited: () => void;
  onClose: () => void;
}

export default function GameOverlay({
  open,
  origin,
  onExited,
  onClose,
}: GameOverlayProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const timerLineRef = React.useRef<HTMLDivElement>(null);
  const canvasHandleRef = React.useRef<RegistrationCanvasHandle>(null);
  const reducedMotion = useReducedMotionFlag();

  // React state for HUD & Cards
  const [gameState, setGameState] = React.useState<GameState>("intro");
  const [sheets, setSheets] = React.useState<number>(3);
  const [prints, setPrints] = React.useState<number>(0);
  const [best, setBest] = React.useState<number>(0);
  const [isNewBest, setIsNewBest] = React.useState<boolean>(false);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  // Status message timer
  const statusTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStatus = React.useCallback((text: string, durationMs: number) => {
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    setStatusMessage(text);
    statusTimerRef.current = setTimeout(() => {
      setStatusMessage(null);
    }, durationMs);
  }, []);

  // Lock body scroll & set inert on #app-root
  React.useEffect(() => {
    const appRoot = document.getElementById("app-root");
    if (appRoot) {
      appRoot.setAttribute("inert", "");
    }
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    return () => {
      if (appRoot) {
        appRoot.removeAttribute("inert");
      }
      document.documentElement.style.overflow = prevOverflow;
    };
  }, []);

  // Open & Close entrance/exit animations
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ox = origin?.x ?? window.innerWidth - 60;
    const oy = origin?.y ?? 32;

    if (open) {
      if (reducedMotion) {
        el.style.opacity = "0";
        el.style.clipPath = "none";
        animate(0, 1, {
          duration: 0.2,
          onUpdate: (v) => {
            el.style.opacity = String(v);
          },
        });
      } else {
        el.style.opacity = "1";
        animate(0, 1, {
          duration: 0.45,
          ease: EASE_IN_OUT_QUART,
          onUpdate: (progress) => {
            const r = progress * 150;
            el.style.clipPath = `circle(${r}vmax at ${ox}px ${oy}px)`;
          },
        });
      }
    } else {
      if (reducedMotion) {
        animate(1, 0, {
          duration: 0.2,
          onUpdate: (v) => {
            el.style.opacity = String(v);
          },
          onComplete: () => {
            onExited();
          },
        });
      } else {
        animate(1, 0, {
          duration: 0.35,
          ease: EASE_IN_OUT_QUART,
          onUpdate: (progress) => {
            const r = progress * 150;
            el.style.clipPath = `circle(${r}vmax at ${ox}px ${oy}px)`;
          },
          onComplete: () => {
            onExited();
          },
        });
      }
    }
  }, [open, origin, onExited, reducedMotion]);

  // Focus management & Tab trapping
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const getFocusables = (): HTMLElement[] => {
      const selector =
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';
      return Array.from(el.querySelectorAll<HTMLElement>(selector)).filter(
        (node) => node.offsetWidth > 0 || node.offsetHeight > 0
      );
    };

    // Initial focus: prioritize card buttons, fallback to dialog
    const focusTimer = setTimeout(() => {
      const focusables = getFocusables();
      const primaryBtn = el.querySelector<HTMLElement>(".card-container button");
      if (primaryBtn) {
        primaryBtn.focus();
      } else if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        el.focus();
      }
    }, 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab") {
        const focusables = getFocusables();
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, [gameState, onClose]);

  // Game action handlers
  const handleStart = React.useCallback(() => {
    setIsNewBest(false);
    canvasHandleRef.current?.start();
  }, []);

  const handleRestart = React.useCallback(() => {
    setIsNewBest(false);
    canvasHandleRef.current?.restart();
  }, []);

  const handlePauseToggle = React.useCallback(() => {
    if (gameState === "playing") {
      canvasHandleRef.current?.pause();
    } else if (gameState === "paused") {
      canvasHandleRef.current?.resume();
    }
  }, [gameState]);

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reg-title"
      tabIndex={-1}
      style={{ clipPath: "circle(0px at 0px 0px)" }}
      className="fixed inset-0 z-70 flex flex-col bg-paper text-ink overscroll-none select-none outline-none overflow-hidden h-dvh pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]"
    >
      {/* Crop mark corners (hidden below 480px) */}
      <div
        aria-hidden="true"
        className="hidden sm:block absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-ink-3 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="hidden sm:block absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-ink-3 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="hidden sm:block absolute bottom-3 left-3 w-2.5 h-2.5 border-b border-l border-ink-3 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="hidden sm:block absolute bottom-3 right-3 w-2.5 h-2.5 border-b border-r border-ink-3 pointer-events-none"
      />

      {/* Top Bar */}
      <header className="relative z-10 h-[52px] border-b border-line flex items-center justify-between px-4 sm:px-8 shrink-0 bg-paper">
        {/* Title */}
        <div className="flex items-center gap-3">
          <h2 id="reg-title" className="label text-ink">
            REGISTRATION
          </h2>
        </div>

        {/* Center HUD: Sheets, Prints, Best */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs font-mono">
          {/* Sheets */}
          <div className="flex items-center gap-1.5" aria-label={`${sheets} sheets remaining`}>
            <span className="hidden min-[420px]:inline text-ink-2 uppercase tracking-wider text-[11px]">
              Sheets
            </span>
            <div className="flex items-center gap-1" aria-hidden="true">
              {[0, 1, 2].map((idx) => {
                const isAvailable = idx < sheets;
                return (
                  <div
                    key={idx}
                    className={`w-[14px] h-[18px] rounded-[2px] transition-colors duration-160 ${
                      isAvailable
                        ? "bg-ink border border-ink"
                        : "bg-transparent border border-ink-3"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Prints */}
          <div className="flex items-center gap-1.5 tabular">
            <span className="text-ink-2 uppercase tracking-wider text-[11px]">
              Prints
            </span>
            <span className="font-semibold text-ink text-sm sm:text-base">
              {String(prints).padStart(2, "0")}
            </span>
          </div>

          {/* Best */}
          <div className="flex items-center gap-1.5 tabular">
            <span className="text-ink-3 uppercase tracking-wider text-[11px]">
              Best
            </span>
            <span className="text-ink-2 text-sm sm:text-base">
              {String(best).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Right controls: Pause & Close */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePauseToggle}
            disabled={gameState === "intro" || gameState === "over"}
            aria-label={gameState === "paused" ? "Resume" : "Pause"}
            className="w-11 h-11 flex items-center justify-center rounded-md hover:bg-paper-2 active:scale-[0.96] text-ink transition-all disabled:opacity-30 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Icon
              name={gameState === "paused" ? "play" : "pause"}
              size={18}
            />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close game"
            className="w-11 h-11 flex items-center justify-center rounded-md hover:bg-paper-2 active:scale-[0.96] text-ink transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* 2px timer line under the top bar */}
        <div
          ref={timerLineRef}
          aria-hidden="true"
          style={{ transformOrigin: "left", transform: "scaleX(1)" }}
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent will-change-transform"
        />
      </header>

      {/* Status Announcement Line */}
      <div
        role="status"
        aria-live="polite"
        className="relative z-10 h-5 flex items-center justify-center text-xs font-mono text-ink select-none"
      >
        {statusMessage && (
          <span className="px-2 py-0.5 rounded bg-paper-2 text-accent tracking-wider uppercase text-[11px] font-semibold">
            {statusMessage}
          </span>
        )}
      </div>

      {/* Canvas Area */}
      <div className="relative flex-1 min-h-0 w-full overflow-hidden flex flex-col items-center justify-center">
        <RegistrationCanvas
          ref={canvasHandleRef}
          timerLineRef={timerLineRef}
          onSheetsChange={setSheets}
          onPrintsChange={setPrints}
          onBestChange={setBest}
          onStatus={handleStatus}
          onGameOver={(finalPrints, finalBest, newBestFlag) => {
            setPrints(finalPrints);
            setBest(finalBest);
            setIsNewBest(newBestFlag);
          }}
          onStateChange={setGameState}
          reducedMotion={reducedMotion}
        />

        {/* Centered Cards */}
        {gameState !== "playing" && (
          <div className="card-container absolute inset-0 z-20 flex items-center justify-center p-4 bg-paper/40 pointer-events-auto">
            {/* INTRO CARD */}
            {gameState === "intro" && (
              <div className="w-[min(360px,calc(100%-32px))] bg-surface border border-line-strong rounded-2xl p-6 sm:p-7 shadow-lg flex flex-col gap-4 text-center">
                <h3 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-ink">
                  Registration
                </h3>
                <p className="text-sm text-ink-2 leading-relaxed">
                  Steer the red plate onto the outline and hold it there for a
                  second. You have three sheets, and each one runs out of time.
                </p>
                <div className="pt-2 flex justify-center">
                  <Button
                    variant="primary"
                    onClick={handleStart}
                    className="w-full justify-center"
                  >
                    Start
                  </Button>
                </div>
              </div>
            )}

            {/* PAUSED CARD */}
            {gameState === "paused" && (
              <div className="w-[min(360px,calc(100%-32px))] bg-surface border border-line-strong rounded-2xl p-6 sm:p-7 shadow-lg flex flex-col gap-4 text-center">
                <h3 className="font-serif text-2xl font-medium tracking-tight text-ink">
                  Paused
                </h3>
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    variant="primary"
                    onClick={handlePauseToggle}
                    className="w-full justify-center"
                  >
                    Resume
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRestart}
                    className="w-full justify-center"
                  >
                    Restart
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="w-full justify-center"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}

            {/* GAME OVER CARD */}
            {gameState === "over" && (
              <div
                role="region"
                aria-live="polite"
                className="w-[min(360px,calc(100%-32px))] bg-surface border border-line-strong rounded-2xl p-6 sm:p-7 shadow-lg flex flex-col gap-4 text-center"
              >
                <h3 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-ink">
                  Out of sheets.
                </h3>
                <div className="text-sm font-mono text-ink-2 flex items-center justify-center gap-2">
                  <span>Prints {String(prints).padStart(2, "0")}</span>
                  <span>·</span>
                  <span>Best {String(best).padStart(2, "0")}</span>
                  {isNewBest && (
                    <span className="font-semibold text-accent ml-1">
                      New best.
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    variant="primary"
                    onClick={handleRestart}
                    className="w-full justify-center"
                  >
                    Play again
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="w-full justify-center"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Hint Line */}
      {gameState === "playing" && (
        <footer className="relative z-10 h-9 flex items-center justify-center px-4 text-center text-xs font-mono text-ink-2 select-none bg-paper">
          <span className="hidden sm:inline">
            Arrows or WASD, or drag · P pause · Esc exit
          </span>
          <span className="inline sm:hidden">
            Drag to move the plate
          </span>
        </footer>
      )}
    </div>,
    document.body
  );
}
