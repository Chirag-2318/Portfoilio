import * as React from "react";
import { cn } from "@/lib/cn";

interface RegMarkProps {
  className?: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

/**
 * 9px registration mark: 1px crosshair in var(--dimension) with a 5px circle.
 * Sits at hairline intersections. Hidden below 640px (sm).
 */
export function RegMark({ className, position }: RegMarkProps) {
  const positionClasses = {
    "top-left": "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
    "top-right": "top-0 right-0 translate-x-1/2 -translate-y-1/2",
    "bottom-left": "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
    "bottom-right": "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        "hidden sm:flex absolute size-[9px] items-center justify-center pointer-events-none z-20 select-none",
        position ? positionClasses[position] : "",
        className
      )}
    >
      <svg
        width="9"
        height="9"
        viewBox="0 0 9 9"
        fill="none"
        className="text-[var(--dimension)]"
      >
        <line x1="4.5" y1="0" x2="4.5" y2="9" stroke="currentColor" strokeWidth="1" />
        <line x1="0" y1="4.5" x2="9" y2="4.5" stroke="currentColor" strokeWidth="1" />
        <circle cx="4.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  );
}

