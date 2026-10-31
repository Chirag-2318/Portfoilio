import * as React from "react";
import { cn } from "@/lib/cn";

interface IconTileProps {
  children: React.ReactNode;
  className?: string;
  size?: number;
}

export function IconTile({ children, className, size = 24 }: IconTileProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center size-6 rounded-md select-none shrink-0",
        "border border-muted-foreground/15 ring-1 ring-inset ring-foreground/5",
        "text-muted-foreground",
        className
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: "var(--muted)",
      }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}
