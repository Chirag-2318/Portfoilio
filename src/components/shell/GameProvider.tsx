"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { playSound } from "@/components/sound/sound-effects";

export interface GameOrigin {
  x: number;
  y: number;
}

export type GameContextType = {
  open: boolean;
  openGame: (origin?: GameOrigin) => void;
  closeGame: () => void;
};

const GameContext = React.createContext<GameContextType>({
  open: false,
  openGame: () => {},
  closeGame: () => {},
});

export const preloadGame = () => import("../game/topping-out/ToppingOutOverlay");

const ToppingOutOverlay = dynamic(() => import("../game/topping-out/ToppingOutOverlay"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--background)]/80">
      <div className="font-mono text-xs text-muted-foreground animate-pulse">Loading Topping Out...</div>
    </div>
  ),
});

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [origin, setOrigin] = React.useState<GameOrigin | null>(null);
  const lastActiveElementRef = React.useRef<HTMLElement | null>(null);

  const openGame = React.useCallback((customOrigin?: GameOrigin) => {
    // Remember active element to restore focus on exit
    if (typeof document !== "undefined") {
      lastActiveElementRef.current = document.activeElement as HTMLElement | null;
    }

    let calculatedOrigin = customOrigin;
    if (!calculatedOrigin && typeof document !== "undefined") {
      const slotEl = document.querySelector("[data-game-slot]");
      if (slotEl) {
        const rect = slotEl.getBoundingClientRect();
        calculatedOrigin = {
          x: Math.round(rect.left + rect.width / 2),
          y: Math.round(rect.top + rect.height / 2),
        };
      } else {
        calculatedOrigin = {
          x: Math.max(0, window.innerWidth - 60),
          y: 32,
        };
      }
    }

    setOrigin(calculatedOrigin || null);
    setMounted(true);
    setOpen(true);
    playSound("open");
  }, []);

  const closeGame = React.useCallback(() => {
    setOpen(false);
    playSound("close");
  }, []);

  // Global 'G' key shortcut to open game when not focusing inputs
  React.useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if (e.key === "g" || e.key === "G") {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable)
        ) {
          return;
        }
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (!open) {
          e.preventDefault();
          openGame();
        }
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [open, openGame]);

  const handleExited = React.useCallback(() => {
    setMounted(false);
    // Restore focus
    if (lastActiveElementRef.current && typeof lastActiveElementRef.current.focus === "function") {
      lastActiveElementRef.current.focus();
    } else if (typeof document !== "undefined") {
      const slotBtn = document.querySelector<HTMLElement>("[data-game-slot]");
      slotBtn?.focus();
    }
  }, []);

  return (
    <GameContext.Provider value={{ open, openGame, closeGame }}>
      {children}
      {mounted && (
        <ToppingOutOverlay
          open={open}
          onExited={handleExited}
          onClose={closeGame}
        />
      )}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextType {
  return React.useContext(GameContext);
}
