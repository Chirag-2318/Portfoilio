"use client";

import * as React from "react";

export type AssetsState = {
  hasPhoto: boolean;
  hasResume: boolean;
};

const AssetsContext = React.createContext<AssetsState>({
  hasPhoto: false,
  hasResume: false,
});

export function AssetsProvider({
  assets,
  children,
}: {
  assets: AssetsState;
  children: React.ReactNode;
}) {
  return (
    <AssetsContext.Provider value={assets}>
      {children}
    </AssetsContext.Provider>
  );
}

export function useAssets(): AssetsState {
  return React.useContext(AssetsContext);
}
