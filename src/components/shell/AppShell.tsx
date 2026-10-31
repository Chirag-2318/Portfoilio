"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SkipLink } from "@/components/shell/SkipLink";
import { Header } from "@/components/shell/Header";
import { Footer } from "@/components/shell/Footer";
import { MobileTabs } from "@/components/shell/MobileTabs";
import { CropMarks } from "@/components/shell/CropMarks";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mainRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: "instant" });
      mainRef.current.focus({ preventScroll: true });
    }
  }, [pathname]);

  return (
    <div
      id="app-root"
      data-view={pathname}
      className="flex h-dvh flex-col overflow-hidden bg-paper text-ink relative"
    >
      <SkipLink />
      <Header />

      <main
        ref={mainRef}
        id="content"
        tabIndex={-1}
        className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain overflow-x-clip px-[var(--page-x)] pb-[calc(56px+env(safe-area-inset-bottom,0px)+16px)] md:pb-8 focus:outline-none"
      >
        <div className="max-w-[1760px] mx-auto w-full h-full">
          {children}
        </div>
      </main>

      <Footer />
      <MobileTabs />
      <CropMarks />
    </div>
  );
}

