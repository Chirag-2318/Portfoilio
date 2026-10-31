// Adapted from Pixel Perfect (https://www.pixel-perfect.space/), MIT License. Copyright notice and licence retained in THIRD_PARTY_NOTICES.md.
"use client";

import * as React from "react";

export interface FlipTextRevealProps {
  text: string;
  className?: string;
  trigger?: "self" | "parent";
}

export function FlipTextReveal({
  text,
  className = "",
  trigger = "self",
}: FlipTextRevealProps) {
  const chars = React.useMemo(() => Array.from(text), [text]);

  const hoverClass =
    trigger === "parent"
      ? "group-hover:[transform:translateY(-100%)] group-focus-visible:[transform:translateY(-100%)] motion-reduce:group-hover:transform-none motion-reduce:group-focus-visible:transform-none"
      : "hover:[transform:translateY(-100%)] focus-visible:[transform:translateY(-100%)] motion-reduce:hover:transform-none motion-reduce:focus-visible:transform-none";

  return (
    <span
      className={`relative inline-flex overflow-hidden h-[1.15em] leading-[1.15em] select-none ${className}`}
    >
      {/* Screen-reader accessible label */}
      <span className="sr-only">{text}</span>

      {/* Visual character stream */}
      <span aria-hidden="true" className="inline-flex">
        {chars.map((char, index) => {
          if (char === " ") {
            return (
              <span key={index} className="inline-block w-[0.25em]">
                &nbsp;
              </span>
            );
          }

          const delayMs = index * 20;

          return (
            <span
              key={index}
              className="relative inline-block h-[1.15em] overflow-hidden leading-[1.15em]"
            >
              <span
                style={{
                  transitionDelay: `${delayMs}ms`,
                }}
                className={`flex flex-col transition-transform duration-[260ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none motion-reduce:transform-none ${hoverClass}`}
              >
                {/* Top character */}
                <span className="inline-block h-[1.15em] leading-[1.15em]">
                  {char}
                </span>
                {/* Bottom flipped character */}
                <span className="inline-block h-[1.15em] leading-[1.15em] text-accent">
                  {char}
                </span>
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
