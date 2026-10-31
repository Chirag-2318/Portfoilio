import * as React from "react";
import { cn } from "@/lib/cn";

interface PanelHeaderProps {
  children?: React.ReactNode;
  title?: string;
  eyebrow?: string;
  className?: string;
  noBottomLine?: boolean;
}

export function PanelHeader({
  children,
  title,
  eyebrow,
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
        <span className="text-sm/none font-medium tracking-wide uppercase text-muted-foreground mb-1 text-center">
          {eyebrow}
        </span>
      )}
      {title && (
        <h2 className="text-3xl font-medium tracking-tight text-balance text-foreground">
          {title}
        </h2>
      )}
      {children}
    </header>
  );
}
