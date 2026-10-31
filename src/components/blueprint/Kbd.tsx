import * as React from "react";
import { cn } from "@/lib/cn";

interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd className={cn("kbd", className)}>
      {children}
    </kbd>
  );
}
