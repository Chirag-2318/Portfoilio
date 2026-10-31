"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { useSheet } from "./SheetContext";

interface PanelHeaderProps {
  children?: React.ReactNode;
  title?: React.ReactNode;
  eyebrow?: string;
  sheet?: string;
  sheetId?: string;
  className?: string;
  noBottomLine?: boolean;
}

export function PanelHeader({
  children,
  title,
  eyebrow,
  sheet,
  sheetId,
  className,
  noBottomLine = false,
}: PanelHeaderProps) {
  const computedSheet = useSheet(sheetId);
  const displaySheet = sheet || computedSheet;

  return (
    <header
      className={cn(
        "px-5 py-5 relative bg-[var(--background)] flex flex-col justify-center",
        noBottomLine ? "screen-line-bottom-none" : "screen-line-bottom",
        className
      )}
    >
      {eyebrow && (
        <span className="text-xs/none font-mono uppercase tracking-wider text-muted-foreground mb-1 text-center">
          {eyebrow}
        </span>
      )}

      <div className="flex items-baseline justify-between gap-4">
        {title && (
          <h2
            className="font-serif text-[2.25rem] leading-[1.05] font-normal tracking-[-0.005em] text-balance text-foreground"
            style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
          >
            {title}
          </h2>
        )}

        {children}

        {displaySheet && (
          <span className="font-mono text-xs text-[var(--dimension-foreground)] opacity-60 shrink-0 tracking-wider uppercase ml-auto">
            {displaySheet}
          </span>
        )}
      </div>
    </header>
  );
}
