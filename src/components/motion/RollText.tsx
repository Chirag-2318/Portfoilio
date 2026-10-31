// Prompt 7 may replace this with Pixel Perfect Flip Text Reveal.

import * as React from "react";

export interface RollTextProps {
  children: React.ReactNode;
  className?: string;
}

export function RollText({ children, className = "" }: RollTextProps) {
  return (
    <span className={`inline-block overflow-hidden h-[1.3em] align-baseline ${className}`}>
      <span className="flex flex-col transition-transform duration-[260ms] ease-out-expo group-hover:-translate-y-1/2 group-focus-visible:-translate-y-1/2">
        <span className="inline-block leading-[1.3em]">{children}</span>
        <span aria-hidden="true" className="inline-block leading-[1.3em] select-none">
          {children}
        </span>
      </span>
    </span>
  );
}

