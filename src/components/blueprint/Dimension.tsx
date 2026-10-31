import * as React from "react";
import { cn } from "@/lib/cn";

interface DimensionProps {
  label: string;
  variant?: "horizontal" | "vertical" | "angle";
  className?: string;
  style?: React.CSSProperties;
}

export function Dimension({
  label,
  variant = "horizontal",
  className,
  style,
}: DimensionProps) {
  if (variant === "angle") {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "absolute pointer-events-none select-none flex items-center gap-1",
          className
        )}
        style={style}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="text-[var(--dimension)]"
        >
          <path
            d="M 4 20 L 20 20 M 4 20 L 18 10"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M 12 20 A 8 8 0 0 0 14 13"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
        </svg>
        <span
          className="font-mono text-xs text-[var(--dimension-foreground)]"
        >
          {label}
        </span>
      </div>
    );
  }

  if (variant === "vertical") {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "absolute pointer-events-none select-none flex items-center justify-center",
          className
        )}
        style={style}
      >
        {/* Top extension tick */}
        <div
          className="absolute top-0 -left-1.5 w-3 h-px bg-[var(--dimension)]"
        />
        {/* Full vertical dimension line */}
        <div
          className="w-px h-full bg-[var(--dimension)]"
        />
        {/* Centered label with background-matched gap */}
        <span
          className="absolute font-mono text-xs text-[var(--dimension-foreground)] px-1 bg-[var(--background)] tabular-nums"
        >
          {label}
        </span>
        {/* Bottom extension tick */}
        <div
          className="absolute bottom-0 -left-1.5 w-3 h-px bg-[var(--dimension)]"
        />
      </div>
    );
  }

  // Horizontal variant
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none select-none relative flex items-center justify-center w-full",
        className
      )}
      style={style}
    >
      {/* Left extension tick */}
      <div
        className="absolute left-0 -top-1.5 h-3 w-px bg-[var(--dimension)]"
      />
      {/* Horizontal dimension line */}
      <div
        className="w-full h-px bg-[var(--dimension)]"
      />
      {/* Centred label with background-matched gap */}
      <span
        className="absolute font-mono text-xs text-[var(--dimension-foreground)] px-1.5 bg-[var(--background)] tabular-nums"
      >
        {label}
      </span>
      {/* Right extension tick */}
      <div
        className="absolute right-0 -top-1.5 h-3 w-px bg-[var(--dimension)]"
      />
    </div>
  );
}
