"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { useCommand } from "@/components/command/CommandProvider";
import { useGame } from "@/components/shell/GameProvider";
import { ThemeToggle } from "@/components/blueprint/ThemeToggle";

interface SiteHeaderProps {
  className?: string;
}

const NAV_ITEMS = [
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#education", label: "Education" },
  { href: "#resume", label: "Resume" },
];

export function SiteHeader({ className }: SiteHeaderProps) {
  const { toggle: toggleCommand } = useCommand();
  const { openGame } = useGame();
  const [activeSection, setActiveSection] = React.useState<string>("");
  const [isMac, setIsMac] = React.useState(false);

  React.useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0,
      }
    );

    const sectionIds = [
      "top",
      "overview",
      "socials",
      "about",
      "numbers",
      "experience",
      "projects",
      "achievements",
      "education",
      "stack",
      "resume",
      "contact",
    ];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 h-14 bg-[var(--background)] px-2 pt-1 select-none",
        className
      )}
    >
      <div className="mx-auto md:max-w-3xl h-full flex items-center gap-2 sm:gap-4 border-x border-[var(--line)] pl-4 pr-2 screen-line-top screen-line-bottom relative">
        {/* Left: Original 28px "CP" monogram + Breadcrumb */}
        <div className="flex items-center gap-2.5">
          <a
            href="#top"
            aria-label="Chirag Patil — back to top"
            className="text-foreground hover:opacity-80 transition-opacity focus-visible:ring-2 focus-visible:ring-ring rounded-sm shrink-0"
          >
            <PixelMonogramCP size={28} />
          </a>

          {/* Breadcrumb (hidden below 640px / sm): clicking opens command menu */}
          <button
            type="button"
            onClick={toggleCommand}
            aria-label="Open command menu"
            className="hidden sm:inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors group cursor-pointer focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            <span className="text-muted-foreground/60">/</span>
            <span className="group-hover:text-[var(--accent)] transition-colors">
              {activeSection || "top"}
            </span>
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Nav (hidden below sm): Experience, Projects, Education, Resume */}
        <nav
          aria-label="Main navigation"
          className="hidden sm:flex items-center gap-4 text-sm font-medium tracking-wide"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.href.slice(1);
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors relative py-1",
                  isActive
                    ? "text-foreground font-semibold underline decoration-2 decoration-[var(--accent)] underline-offset-[6px]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* 1px x 20px vertical separator (hidden below sm) */}
        <div
          className="hidden sm:block w-px h-5 bg-[var(--line)] shrink-0"
          aria-hidden="true"
        />

        {/* Right tools: Search, Gamepad, ThemeToggle */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Search ghost button */}
          <button
            type="button"
            onClick={toggleCommand}
            aria-label="Search"
            title={`Search (${isMac ? "⌘" : "Ctrl"} K)`}
            className="h-8 px-1.5 md:px-2 rounded-[10px] text-muted-foreground hover:text-foreground hover:bg-[var(--muted)] flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="hidden md:inline text-xs font-sans text-muted-foreground">
              Search…
            </span>
            <span className="hidden md:inline-flex items-center gap-0.5 kbd text-[10px]">
              {isMac ? "⌘ K" : "Ctrl K"}
            </span>
          </button>

          {/* Gamepad icon button */}
          <button
            type="button"
            data-game-slot
            onClick={() => openGame()}
            aria-label="Play Topping Out game"
            title="Play Topping Out"
            className="size-8 rounded-[10px] text-muted-foreground hover:text-foreground hover:bg-[var(--muted)] flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="6" y1="12" x2="10" y2="12" />
              <line x1="8" y1="10" x2="8" y2="14" />
              <line x1="15" y1="13" x2="15.01" y2="13" strokeWidth="2.5" />
              <line x1="18" y1="11" x2="18.01" y2="11" strokeWidth="2.5" />
              <rect x="2" y="6" width="20" height="12" rx="6" />
            </svg>
          </button>

          {/* Theme toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

/** 28px "CP" monogram built from 4x4 pixel blocks on a 7x7 grid */
function PixelMonogramCP({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="currentColor"
      className="text-foreground"
      aria-hidden="true"
    >
      {/* ── Letter 'C' (grid columns x=2,6,10; y=4,8,12,16,20) ── */}
      {/* Top bar of C */}
      <rect x="2" y="4" width="4" height="4" />
      <rect x="6" y="4" width="4" height="4" />
      <rect x="10" y="4" width="4" height="4" />
      {/* Spine of C */}
      <rect x="2" y="8" width="4" height="4" />
      <rect x="2" y="12" width="4" height="4" />
      <rect x="2" y="16" width="4" height="4" />
      {/* Bottom bar of C */}
      <rect x="2" y="20" width="4" height="4" />
      <rect x="6" y="20" width="4" height="4" />
      <rect x="10" y="20" width="4" height="4" />

      {/* ── Letter 'P' (grid columns x=16,20,24; y=4,8,12,16,20) ── */}
      {/* Stem of P */}
      <rect x="16" y="4" width="4" height="4" />
      <rect x="16" y="8" width="4" height="4" />
      <rect x="16" y="12" width="4" height="4" />
      <rect x="16" y="16" width="4" height="4" />
      <rect x="16" y="20" width="4" height="4" />
      {/* Top bar of P */}
      <rect x="20" y="4" width="4" height="4" />
      <rect x="24" y="4" width="4" height="4" />
      {/* Right side of P loop */}
      <rect x="24" y="8" width="4" height="4" />
      {/* Middle bar of P */}
      <rect x="20" y="12" width="4" height="4" />
      <rect x="24" y="12" width="4" height="4" />
    </svg>
  );
}
