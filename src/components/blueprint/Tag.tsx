import * as React from "react";
import { cn } from "@/lib/cn";

interface TagProps {
  children: React.ReactNode;
  className?: string;
}

export function Tag({ children, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border px-1.5 py-0.5",
        "font-mono text-xs text-muted-foreground",
        "bg-zinc-900 light:bg-zinc-50",
        className
      )}
    >
      {children}
    </span>
  );
}
