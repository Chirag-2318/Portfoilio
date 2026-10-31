"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { AssetsProvider, type AssetsState } from "@/lib/AssetsContext";
import { ToasterProvider } from "@/components/ui/Toaster";
import { ViewTransitionProvider } from "@/components/transition/ViewTransitionProvider";
import { Curtain } from "@/components/transition/Curtain";
import { GameProvider } from "@/components/shell/GameProvider";
import { CommandProvider } from "@/components/command/CommandProvider";
import { CommandMenu } from "@/components/command/CommandMenu";
import { DraftProvider } from "@/components/home/DraftContext";

export function Providers({
  assets,
  children,
}: {
  assets: AssetsState;
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AssetsProvider assets={assets}>
        <DraftProvider>
          <ToasterProvider>
            <ViewTransitionProvider>
              <GameProvider>
                <CommandProvider>
                  {children}
                  <Curtain />
                  <CommandMenu />
                </CommandProvider>
              </GameProvider>
            </ViewTransitionProvider>
          </ToasterProvider>
        </DraftProvider>
      </AssetsProvider>
    </ThemeProvider>
  );
}
