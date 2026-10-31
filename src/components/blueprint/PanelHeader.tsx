import * as React from "react";
import { cn } from "@/lib/cn";

interface PanelHeaderProps {
  children?: React.ReactNode;
  title?: React.ReactNode;
  eyebrow?: string;
  sheet?: string;
  className?: string;
  noBottomLine?: boolean;
}

export function PanelHeader({
  children,
  title,
  eyebrow,
  sheet,
  className,
  noBottomLine = false,
}: PanelHeaderProps) {
  return (
    <header
      className={cn(
        "px-4 py-3 relative bg-[var(--background)] flex flex-col justify-center",
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

        {sheet && (
          <span className="font-mono text-xs text-[var(--dimension-foreground)] shrink-0 tracking-wider uppercase ml-auto">
            {sheet}
          </span>
        )}
      </div>
    </header>
  );
}
