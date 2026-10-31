"use client";

// PROMPT 8 REPLACES THE POPOVER WITH THE LAZY-LOADED GAME OVERLAY (keep this button and the provider API)

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { useGame } from "@/components/shell/GameProvider";

export function GameSlot() {
  const { open, openGame, closeGame } = useGame();
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeGame();
        buttonRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        closeGame();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, closeGame]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? closeGame() : openGame())}
        aria-label="Play Registration, a small optional game"
        aria-expanded={open}
        className="group relative w-9 h-9 flex items-center justify-center rounded-md hover:bg-paper-2 active:scale-[0.96] transition-all duration-160 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-3 cursor-pointer select-none [@media(pointer:coarse)]:after:content-[''] [@media(pointer:coarse)]:after:absolute [@media(pointer:coarse)]:after:-inset-1"
      >
        <Icon name="registration" size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-[260px] p-4 rounded-lg bg-surface hairline z-40 shadow-sm"
          >
            <span className="label block mb-1">REGISTRATION</span>
            <p className="text-sm text-ink-2 mb-4 leading-relaxed">
              A small game of alignment. Arriving soon.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={closeGame}
                className="px-3 py-1 rounded-md hairline bg-surface hover:bg-paper-2 transition-colors text-xs font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

