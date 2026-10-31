"use client";

import * as React from "react";
import { Icon } from "@/components/ui/Icon";
import { useGame, preloadGame } from "@/components/shell/GameProvider";

export function GameSlot() {
  const { open, openGame, closeGame } = useGame();

  return (
    <button
      data-game-slot
      type="button"
      onClick={() => (open ? closeGame() : openGame())}
      onPointerEnter={preloadGame}
      onFocus={preloadGame}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-label="Play Registration, a small optional game"
      className="group relative w-9 h-9 flex items-center justify-center rounded-md hover:bg-paper-2 active:scale-[0.96] transition-all duration-160 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-3 cursor-pointer select-none [@media(pointer:coarse)]:after:content-[''] [@media(pointer:coarse)]:after:absolute [@media(pointer:coarse)]:after:-inset-1"
    >
      <Icon name="registration" size={18} />
    </button>
  );
}
