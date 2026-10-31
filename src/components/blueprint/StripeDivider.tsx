"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

interface StripeDividerProps {
  className?: string;
  children?: React.ReactNode;
}

// Precompute ticks for a 768px width: 8px intervals
const TICKS: { x: number; height: number; isMajor: boolean }[] = [];
for (let x = 0; x <= 768; x += 8) {
  const isMajor = x % 80 === 0;
  const isMid = !isMajor && x % 40 === 0;
  const height = isMajor ? 14 : isMid ? 10 : 6;
  TICKS.push({ x, height, isMajor });
}

export function StripeDivider({ className, children }: StripeDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "stripe-divider ruler-divider mx-auto w-full max-w-3xl border-x border-[var(--line)] h-8 relative bg-[var(--background)] overflow-visible",
        className
      )}
    >
      {/* Inside column: SVG ruler visibly measuring the column with ticks and numerals */}
      <svg
        viewBox="0 0 768 32"
        preserveAspectRatio="none"
        className="w-full h-8 block relative z-10 select-none pointer-events-none"
      >
        {/* Top boundary hairline */}
        <line x1="0" y1="0" x2="768" y2="0" stroke="var(--line)" strokeWidth="1" />

        {/* Bottom baseline */}
        <line x1="0" y1="32" x2="768" y2="32" stroke="var(--line-strong)" strokeWidth="1" />

        {/* Ticks and mono numerals */}
        {TICKS.map(({ x, height, isMajor }) => (
          <React.Fragment key={x}>
            <line
              x1={x}
              y1={32}
              x2={x}
              y2={32 - height}
              stroke="var(--dimension)"
              strokeWidth="1"
            />
            {isMajor && (
              <text
                x={x === 0 ? 3 : x >= 760 ? 765 : x}
                y={13}
                fontSize="9"
                fill="var(--dimension-foreground)"
                textAnchor={x === 0 ? "start" : x >= 760 ? "end" : "middle"}
                fontFamily="var(--font-geist-mono), monospace"
              >
                {x}
              </text>
            )}
          </React.Fragment>
        ))}
      </svg>

      {children}
    </div>
  );
}

// Export RulerDivider alias
export { StripeDivider as RulerDivider };
