"use client";

import * as React from "react";
import dynamic from "next/dynamic";

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

export const preloadGame = () => import("../game/GameOverlay");

const GameOverlay = dynamic(() => import("../game/GameOverlay"), {
  ssr: false,
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
  }, []);

  const closeGame = React.useCallback(() => {
    setOpen(false);
  }, []);

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
        <GameOverlay
          open={open}
          origin={origin}
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
