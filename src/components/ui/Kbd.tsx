import * as React from "react";

export function Kbd({
  children,
  className = "",
  "aria-hidden": ariaHidden,
}: {
  children: React.ReactNode;
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}) {
  return (
    <kbd
      aria-hidden={ariaHidden}
      className={`inline-flex items-center justify-center font-mono text-[11px] leading-tight border border-line-strong rounded-sm px-1.5 py-0.5 bg-surface text-ink-2 select-none uppercase tracking-wider ${className}`}
    >
      {children}
    </kbd>
  );
}

