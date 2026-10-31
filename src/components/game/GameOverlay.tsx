"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { animate } from "motion/react";
import { Icon } from "@/components/ui/Icon";
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
      className="fixed inset-0 z-70 flex flex-col bg-[var(--background)] text-foreground overscroll-none select-none outline-none overflow-hidden h-dvh pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]"
    >
      {/* Corner hairlines */}
      <div
        aria-hidden="true"
        className="hidden sm:block absolute top-3 left-3 w-3 h-3 border-t border-l border-[var(--line-strong)] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="hidden sm:block absolute top-3 right-3 w-3 h-3 border-t border-r border-[var(--line-strong)] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="hidden sm:block absolute bottom-3 left-3 w-3 h-3 border-b border-l border-[var(--line-strong)] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="hidden sm:block absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[var(--line-strong)] pointer-events-none"
      />

      {/* Top Bar */}
      <header className="relative z-10 h-13 border-b border-[var(--line)] flex items-center justify-between px-4 sm:px-8 shrink-0 bg-[var(--background)]">
        {/* Title */}
        <div className="flex items-center gap-3">
          <h2 id="reg-title" className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            REGISTRATION
          </h2>
        </div>

        {/* Center HUD: Sheets, Prints, Best */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs font-mono">
          {/* Sheets */}
          <div className="flex items-center gap-1.5" aria-label={`${sheets} sheets remaining`}>
            <span className="hidden min-[420px]:inline text-muted-foreground uppercase tracking-wider text-[11px]">
              Sheets
            </span>
            <div className="flex items-center gap-1" aria-hidden="true">
              {[0, 1, 2].map((idx) => {
                const isAvailable = idx < sheets;
                return (
                  <div
                    key={idx}
                    className={`w-3.5 h-4.5 rounded-[2px] transition-colors duration-160 ${
                      isAvailable
                        ? "bg-foreground border border-foreground"
                        : "bg-transparent border border-[var(--line-strong)]"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Prints */}
          <div className="flex items-center gap-1.5 tabular-nums">
            <span className="text-muted-foreground uppercase tracking-wider text-[11px]">
              Prints
            </span>
            <span className="font-semibold text-[var(--accent)] text-sm sm:text-base">
              {String(prints).padStart(2, "0")}
            </span>
          </div>

          {/* Best */}
          <div className="flex items-center gap-1.5 tabular-nums">
            <span className="text-muted-foreground uppercase tracking-wider text-[11px]">
              Best
            </span>
            <span className="text-muted-foreground text-sm sm:text-base">
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
            className="size-8 rounded-lg flex items-center justify-center hover:bg-[var(--muted)] active:scale-[0.96] text-muted-foreground hover:text-foreground transition-all disabled:opacity-30 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon
              name={gameState === "paused" ? "play" : "pause"}
              size={16}
            />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close game"
            className="size-8 rounded-lg flex items-center justify-center hover:bg-[var(--muted)] active:scale-[0.96] text-muted-foreground hover:text-foreground transition-all focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* 2px timer line under the top bar in accent */}
        <div
          ref={timerLineRef}
          aria-hidden="true"
          style={{ transformOrigin: "left", transform: "scaleX(1)" }}
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent)] will-change-transform"
        />
      </header>

      {/* Status Announcement Line */}
      <div
        role="status"
        aria-live="polite"
        className="relative z-10 h-5 flex items-center justify-center text-xs font-mono text-foreground select-none"
      >
        {statusMessage && (
          <span className="px-2 py-0.5 rounded bg-[var(--muted)] text-foreground tracking-wider uppercase text-[11px] font-semibold border border-[var(--border)]">
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
          <div className="card-container absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs pointer-events-auto">
            {/* INTRO CARD */}
            {gameState === "intro" && (
              <div className="w-[min(360px,calc(100%-32px))] bg-[var(--background)] border border-[var(--line-strong)] rounded-xl p-6 sm:p-7 shadow-2xl flex flex-col gap-4 text-center">
                <h3
                  className="font-serif text-3xl font-normal tracking-tight text-foreground"
                  style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
                >
                  Registration
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Steer the plate onto the outline and hold it there for a
                  second. You have three sheets, and each one runs out of time.
                </p>
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={handleStart}
                    className="w-full h-10 px-4 rounded-lg bg-foreground text-background font-medium text-sm flex items-center justify-center hover:opacity-90 active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Start
                  </button>
                </div>
              </div>
            )}

            {/* PAUSED CARD */}
            {gameState === "paused" && (
              <div className="w-[min(360px,calc(100%-32px))] bg-[var(--background)] border border-[var(--line-strong)] rounded-xl p-6 sm:p-7 shadow-2xl flex flex-col gap-4 text-center">
                <h3
                  className="font-serif text-3xl font-normal tracking-tight text-foreground"
                  style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
                >
                  Paused
                </h3>
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handlePauseToggle}
                    className="w-full h-10 px-4 rounded-lg bg-foreground text-background font-medium text-sm flex items-center justify-center hover:opacity-90 active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Resume
                  </button>
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="w-full h-10 px-4 rounded-lg border border-[var(--border)] text-foreground font-medium text-sm flex items-center justify-center hover:bg-[var(--muted)] active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Restart
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full h-9 rounded-lg text-muted-foreground hover:text-foreground font-medium text-sm flex items-center justify-center hover:bg-[var(--muted)] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* GAME OVER CARD */}
            {gameState === "over" && (
              <div
                role="region"
                aria-live="polite"
                className="w-[min(360px,calc(100%-32px))] bg-[var(--background)] border border-[var(--line-strong)] rounded-xl p-6 sm:p-7 shadow-2xl flex flex-col gap-4 text-center"
              >
                <h3
                  className="font-serif text-3xl font-normal tracking-tight text-foreground"
                  style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
                >
                  Out of sheets.
                </h3>
                <div className="text-sm font-mono text-muted-foreground flex items-center justify-center gap-2">
                  <span>Prints <strong className="text-[var(--accent)] font-semibold">{String(prints).padStart(2, "0")}</strong></span>
                  <span>·</span>
                  <span>Best {String(best).padStart(2, "0")}</span>
                  {isNewBest && (
                    <span className="font-semibold text-[var(--accent)] ml-1">
                      New best.
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="w-full h-10 px-4 rounded-lg bg-foreground text-background font-medium text-sm flex items-center justify-center hover:opacity-90 active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Play again
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full h-9 rounded-lg text-muted-foreground hover:text-foreground font-medium text-sm flex items-center justify-center hover:bg-[var(--muted)] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Hint Line */}
      {gameState === "playing" && (
        <footer className="relative z-10 h-9 flex items-center justify-center px-4 text-center text-xs font-mono text-muted-foreground select-none bg-[var(--background)] border-t border-[var(--line)]">
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
