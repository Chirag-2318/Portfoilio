"use client";

import * as React from "react";

export type GameContextType = {
  open: boolean;
  openGame: () => void;
  closeGame: () => void;
};

const GameContext = React.createContext<GameContextType>({
  open: false,
  openGame: () => {},
  closeGame: () => {},
});

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  const openGame = React.useCallback(() => setOpen(true), []);
  const closeGame = React.useCallback(() => setOpen(false), []);

  return (
    <GameContext.Provider value={{ open, openGame, closeGame }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextType {
  return React.useContext(GameContext);
}
