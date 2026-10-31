"use client";

import * as React from "react";

export type DraftContextValue = {
  draft: boolean;
  toggle: () => void;
};

const DraftContext = React.createContext<DraftContextValue>({
  draft: false,
  toggle: () => {},
});

export function DraftProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value?: DraftContextValue;
}) {
  const [draft, setDraft] = React.useState(false);
  const toggle = React.useCallback(() => setDraft((d) => !d), []);
  const contextValue = value || { draft, toggle };

  return (
    <DraftContext.Provider value={contextValue}>
      {children}
    </DraftContext.Provider>
  );
}

export function useDraft(): DraftContextValue {
  return React.useContext(DraftContext);
}
