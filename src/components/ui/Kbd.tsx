import * as React from "react";

export function Kbd({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={`inline-flex items-center justify-center font-mono text-[11px] leading-tight border border-line-strong rounded-sm px-1.5 py-0.5 bg-surface text-ink-2 select-none uppercase tracking-wider ${className}`}
    >
      {children}
    </kbd>
  );
}

