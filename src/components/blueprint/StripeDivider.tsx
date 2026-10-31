import * as React from "react";
import { cn } from "@/lib/cn";

interface StripeDividerProps {
  className?: string;
  children?: React.ReactNode;
}

export function StripeDivider({ className }: StripeDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "mx-auto w-full max-w-3xl border-x border-[var(--line-soft)] h-10 relative bg-transparent",
        className
      )}
    />
  );
}

export { StripeDivider as RulerDivider };
