"use client";

import * as React from "react";

export type CommandContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const CommandContext = React.createContext<CommandContextType>({
  open: false,
  setOpen: () => {},
  toggle: () => {},
});

export function CommandProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  const toggle = React.useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <CommandContext.Provider value={{ open, setOpen, toggle }}>
      {children}
    </CommandContext.Provider>
  );
}

export function useCommand(): CommandContextType {
  return React.useContext(CommandContext);
}
