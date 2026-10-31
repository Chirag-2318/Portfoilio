import * as React from "react";

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  as?: "span" | "div";
  children: React.ReactNode;
  className?: string;
}

export function Chip({
  as: Component = "span",
  children,
  className = "",
  ...props
}: ChipProps) {
  return (
    <Component
      className={`inline-flex items-center font-mono text-[11px] leading-none text-ink-2 px-2 py-[4px] rounded-sm border border-line-strong bg-transparent whitespace-nowrap select-none ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

