"use client";

import * as React from "react";

export type DraftContextValue = {
  draft: boolean;
  toggle: () => void;
  setDraft: (d: boolean) => void;
};

const DraftContext = React.createContext<DraftContextValue>({
  draft: false,
  toggle: () => {},
  setDraft: () => {},
});

export function DraftProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value?: DraftContextValue;
}) {
  const [draft, setDraftState] = React.useState(false);

  const toggle = React.useCallback(() => {
    setDraftState((prev) => !prev);
  }, []);

  const setDraft = React.useCallback((d: boolean) => {
    setDraftState(d);
  }, []);

  // Reset draft on unmount
  React.useEffect(() => {
    return () => {
      setDraftState(false);
    };
  }, []);

  // Escape key leaves draft mode when active
  React.useEffect(() => {
    if (!draft) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDraftState(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [draft]);

  const contextValue = React.useMemo(() => {
    return value || { draft, toggle, setDraft };
  }, [value, draft, toggle, setDraft]);

  return (
    <DraftContext.Provider value={contextValue}>
      {children}
    </DraftContext.Provider>
  );
}

export function useDraft(): DraftContextValue {
  return React.useContext(DraftContext);
}
