"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export interface FrameCellProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

const maskY: React.CSSProperties = {
  maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
  WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
};

const maskX: React.CSSProperties = {
  maskImage: "linear-gradient(to right, black 60%, transparent 100%)",
  WebkitMaskImage: "linear-gradient(to right, black 60%, transparent 100%)",
};

const patternStyle: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(315deg, var(--pattern-fg) 0, var(--pattern-fg) 1px, transparent 0, transparent 50%)",
  backgroundSize: "10px 10px",
  backgroundAttachment: "fixed",
  ...maskY,
};

export function FrameCell({
  children,
  className,
  contentClassName,
}: FrameCellProps) {
  return (
    <div
      className={cn(
        "relative w-full h-full grid grid-cols-[1fr_1rem_auto_1rem_1fr] grid-rows-[1fr_1px_auto_1px_1fr]",
        className
      )}
    >
      {/* Center Content Cell */}
      <div
        className={cn(
          "col-start-3 row-start-3 flex max-w-lg flex-col relative z-10",
          contentClassName
        )}
      >
        {children}
      </div>

      {/* Left Hatch Band (col 2, span full rows) */}
      <div
        style={patternStyle}
        className="-right-px col-start-2 row-span-full row-start-1 border-x border-[var(--border)]"
        aria-hidden="true"
      />

      {/* Right Hatch Band (col 4, span full rows) */}
      <div
        style={patternStyle}
        className="relative -left-px col-start-4 row-span-full row-start-1 border-x border-[var(--border)]"
        aria-hidden="true"
      />

      {/* Top Dashed Divider (row 2, span full cols) */}
      <div
        style={maskX}
        className="relative -bottom-px col-span-full col-start-1 row-start-2 border-t border-dashed border-[var(--border)]"
        aria-hidden="true"
      />

      {/* Bottom Dashed Divider (row 4, span full cols) */}
      <div
        style={maskX}
        className="relative -top-px col-span-full col-start-1 row-start-4 border-b border-dashed border-[var(--border)]"
        aria-hidden="true"
      />
    </div>
  );
}
