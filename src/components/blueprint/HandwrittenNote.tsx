import * as React from "react";
import { cn } from "@/lib/cn";

interface HandwrittenNoteProps {
  children: React.ReactNode;
  className?: string;
  arrow?: "curved-down-left" | "curved-down-right" | "point-right" | "point-left";
  side?: "left" | "right";
}

export function HandwrittenNote({
  children,
  className,
  arrow = "point-right",
  side = "right",
}: HandwrittenNoteProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "hidden xl:flex flex-col items-center pointer-events-none select-none absolute z-20 w-36",
        side === "right" ? "left-[calc(100%+1.5rem)]" : "right-[calc(100%+1.5rem)]",
        className
      )}
    >
      <span
        className="text-xl/none font-medium text-muted-foreground text-center"
        style={{
          fontFamily: "var(--font-caveat), cursive",
          transform: "rotate(-6deg)",
        }}
      >
        {children}
      </span>

      {arrow === "point-right" && (
        <svg
          width="48"
          height="32"
          viewBox="0 0 48 32"
          fill="none"
          className="text-muted-foreground/70 mt-1"
        >
          <path
            d="M 6 8 C 18 10, 32 14, 42 22"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          <path
            d="M 33 22 L 42 22 L 40 13"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {arrow === "point-left" && (
        <svg
          width="48"
          height="32"
          viewBox="0 0 48 32"
          fill="none"
          className="text-muted-foreground/70 mt-1"
        >
          <path
            d="M 42 8 C 30 10, 16 14, 6 22"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          <path
            d="M 15 22 L 6 22 L 8 13"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {arrow === "curved-down-left" && (
        <svg
          width="48"
          height="40"
          viewBox="0 0 48 40"
          fill="none"
          className="text-muted-foreground/70 mt-1"
        >
          <path
            d="M 36 6 C 24 16, 16 26, 8 32"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          <path
            d="M 18 32 L 8 32 L 10 22"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {arrow === "curved-down-right" && (
        <svg
          width="48"
          height="40"
          viewBox="0 0 48 40"
          fill="none"
          className="text-muted-foreground/70 mt-1"
        >
          <path
            d="M 12 6 C 24 16, 32 26, 40 32"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          <path
            d="M 30 32 L 40 32 L 38 22"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}
