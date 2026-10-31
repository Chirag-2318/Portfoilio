import * as React from "react";
import { cn } from "@/lib/cn";

interface StripeDividerProps {
  className?: string;
  children?: React.ReactNode;
}

export function StripeDivider({ className, children }: StripeDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "stripe-divider mx-auto w-full max-w-3xl border-x border-[var(--line)]",
        className
      )}
    >
      {children}
    </div>
  );
}
