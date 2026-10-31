"use client";

import * as React from "react";
import { SkipLink } from "@/components/shell/SkipLink";
import { SiteHeader } from "@/components/blueprint/SiteHeader";
import { ScrollTopButton } from "@/components/blueprint/ScrollTopButton";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      id="app-root"
      className="min-h-screen relative bg-[var(--background)] text-foreground"
    >
      <SkipLink />
      <SiteHeader />
      <main id="content" tabIndex={-1} className="focus:outline-none">
        {children}
      </main>
      <ScrollTopButton />
    </div>
  );
}
