"use client";

import * as React from "react";
import { SkipLink } from "@/components/shell/SkipLink";
import { SiteHeader } from "@/components/blueprint/SiteHeader";
import { ScrollTopButton } from "@/components/blueprint/ScrollTopButton";
import { IntroGate } from "@/components/intro/IntroGate";
import { BuildInspectorMaster } from "@/components/inspector/BuildInspectorMaster";

export function AppShell({ children }: { children: React.ReactNode }) {
  const portfolioRef = React.useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        id="app-root"
        ref={portfolioRef}
        className="min-h-screen relative bg-[var(--background)] text-foreground"
      >
        <SkipLink />
        <SiteHeader />
        <main id="content" tabIndex={-1} className="focus:outline-none">
          {children}
        </main>
        <ScrollTopButton />
      </div>

      <BuildInspectorMaster />
      <IntroGate portfolioRef={portfolioRef} />
    </>
  );
}
