"use client";

import * as React from "react";

interface SheetContextValue {
  getSheet: (id: string) => string;
}

const SheetContext = React.createContext<SheetContextValue>({
  getSheet: () => "",
});

export interface SheetProviderProps {
  panels: (string | null | false | undefined)[];
  children: React.ReactNode;
}

export function SheetProvider({ panels, children }: SheetProviderProps) {
  const activePanels = React.useMemo(() => {
    return panels.filter((p): p is string => typeof p === "string" && p.length > 0);
  }, [panels]);

  const total = activePanels.length;
  const pad = (n: number) => String(n).padStart(2, "0");

  const getSheet = React.useCallback(
    (id: string) => {
      const idx = activePanels.indexOf(id);
      if (idx === -1) return "";
      return `SHEET ${pad(idx + 1)} / ${pad(total)}`;
    },
    [activePanels, total]
  );

  return (
    <SheetContext.Provider value={{ getSheet }}>
      {children}
    </SheetContext.Provider>
  );
}

export function useSheet(panelId?: string): string {
  const { getSheet } = React.useContext(SheetContext);
  if (!panelId) return "";
  return getSheet(panelId);
}
