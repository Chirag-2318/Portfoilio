"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { AssetsProvider, type AssetsState } from "@/lib/AssetsContext";
import { ToasterProvider } from "@/components/ui/Toaster";
import { GameProvider } from "@/components/shell/GameProvider";
import { CommandProvider } from "@/components/command/CommandProvider";

export function Providers({
  assets,
  children,
}: {
  assets: AssetsState;
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      themes={["dark", "light"]}
      storageKey="theme"
      disableTransitionOnChange
    >
      <AssetsProvider assets={assets}>
        <ToasterProvider>
          <GameProvider>
            <CommandProvider>
              {children}
            </CommandProvider>
          </GameProvider>
        </ToasterProvider>
      </AssetsProvider>
    </ThemeProvider>
  );
}
