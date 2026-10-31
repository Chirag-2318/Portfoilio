"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useGame } from "@/components/shell/GameProvider";
import { playSound } from "@/components/sound/sound-effects";

export type CommandContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  preloadMenu: () => void;
};

const CommandContext = React.createContext<CommandContextType>({
  open: false,
  setOpen: () => {},
  toggle: () => {},
  preloadMenu: () => {},
});

const DynamicCommandMenu = dynamic(
  () => import("@/components/blueprint/CommandMenu").then((m) => m.CommandMenu),
  { ssr: false }
);

export function CommandProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [shouldLoad, setShouldLoad] = React.useState(false);
  const { open: gameOpen } = useGame();

  const preloadMenu = React.useCallback(() => {
    setShouldLoad(true);
  }, []);

  const toggle = React.useCallback(() => {
    setShouldLoad(true);
    setOpen((prev) => {
      const next = !prev;
      if (next) playSound("open");
      else playSound("close");
      return next;
    });
  }, []);

  const handleSetOpen = React.useCallback((nextOpen: boolean) => {
    if (nextOpen) setShouldLoad(true);
    setOpen(nextOpen);
  }, []);

  // Idle preloader: requestIdleCallback with 2s timeout fallback
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const load = () => setShouldLoad(true);
    if ("requestIdleCallback" in window) {
      const handle = (window as unknown as { requestIdleCallback: (cb: () => void, opts: { timeout: number }) => number }).requestIdleCallback(load, { timeout: 2000 });
      return () => {
        if ("cancelIdleCallback" in window) {
          (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(handle);
        }
      };
    } else {
      const timer = setTimeout(load, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If game overlay is active, let game overlay handle escape exclusively
      if (gameOpen) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      } else if (
        e.key === "/" &&
        !open &&
        !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName) &&
        !(e.target as HTMLElement)?.isContentEditable
      ) {
        e.preventDefault();
        setShouldLoad(true);
        playSound("open");
        setOpen(true);
      } else if (e.key === "Escape" && open) {
        e.preventDefault();
        playSound("close");
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, gameOpen]);

  return (
    <CommandContext.Provider
      value={{ open, setOpen: handleSetOpen, toggle, preloadMenu }}
    >
      {children}
      {(shouldLoad || open) && <DynamicCommandMenu />}
    </CommandContext.Provider>
  );
}

export function useCommand(): CommandContextType {
  return React.useContext(CommandContext);
}
