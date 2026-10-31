"use client";

import * as React from "react";
import { ViewLink } from "@/components/transition/ViewLink";
import { NavLinks } from "@/components/shell/NavLinks";
import { Clock } from "@/components/shell/Clock";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { GameSlot } from "@/components/shell/GameSlot";
import { Icon } from "@/components/ui/Icon";
import { Kbd } from "@/components/ui/Kbd";
import { useCommand } from "@/components/command/CommandProvider";
import { useIsMac } from "@/lib/useIsMac";

const emptySubscribe = () => () => {};
function useMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function Header() {
  const { toggle: toggleCommand } = useCommand();
  const isMac = useIsMac();
  const mounted = useMounted();

  const kbdText = mounted && isMac ? "⌘K" : "Ctrl K";

  return (
    <header data-print="hide" className="relative z-30 h-[var(--header-h)] px-[var(--page-x)] border-b border-line bg-paper select-none">
      <div className="h-full max-w-[1760px] mx-auto flex items-center justify-between">
        {/* Left: Logo & Desktop NavLinks */}
        <div className="flex items-center">
          <ViewLink
            href="/"
            aria-label="Chirag Patil, home"
            className="group flex items-center gap-2.5 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-3 rounded-sm"
          >
            {/* 28px Circle with CP in Fraunces 13px/500 */}
            <div className="w-7 h-7 rounded-full border border-ink flex items-center justify-center font-serif text-[13px] font-medium leading-none transition-colors group-hover:bg-paper-2">
              CP
            </div>
            {/* "Chirag Patil" in Fraunces 18px/500 (≥ md) */}
            <span className="hidden md:inline font-serif text-[18px] font-medium tracking-tight">
              Chirag Patil
            </span>
          </ViewLink>

          {/* Responsive gap to NavLinks on ≥ md */}
          <div className="hidden md:block ml-4 lg:ml-12">
            <NavLinks />
          </div>
        </div>

        {/* Right Chrome Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
          <Clock />

          <div
            className="hidden sm:block w-[1px] h-4 bg-line"
            aria-hidden="true"
          />

          <ThemeToggle />
          <GameSlot />

          {/* Command trigger: pill on ≥ md, icon-only below */}
          <button
            type="button"
            onClick={toggleCommand}
            aria-label="Open command menu"
            className="hidden md:flex items-center gap-1.5 lg:gap-2 h-9 px-2.5 lg:px-3 rounded-md border border-line bg-surface hover:bg-paper-2 transition-colors duration-160 text-sm font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-3"
          >
            <Icon name="search" size={14} className="text-ink-2" />
            <span className="text-xs hidden lg:inline">Search</span>
            <Kbd>{kbdText}</Kbd>
          </button>

          <button
            type="button"
            onClick={toggleCommand}
            aria-label="Open command menu"
            className="md:hidden relative w-9 h-9 flex items-center justify-center rounded-md border border-line bg-surface hover:bg-paper-2 active:scale-[0.96] transition-all duration-160 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-3 cursor-pointer select-none [@media(pointer:coarse)]:after:content-[''] [@media(pointer:coarse)]:after:absolute [@media(pointer:coarse)]:after:-inset-1"
          >
            <Icon name="search" size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
