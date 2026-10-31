import * as React from "react";
import { cn } from "@/lib/cn";
import { RegMark } from "./RegMark";

interface PanelProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
  noTopLine?: boolean;
  noBottomLine?: boolean;
  "aria-labelledby"?: string;
}

export function Panel({
  id,
  className,
  children,
  noTopLine = false,
  noBottomLine = false,
  "aria-labelledby": ariaLabelledBy,
}: PanelProps) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        "mx-auto max-w-3xl w-full border-x border-[var(--line)] relative bg-[var(--background)]",
        noTopLine ? "screen-line-top-none" : "screen-line-top",
        noBottomLine ? "screen-line-bottom-none" : "screen-line-bottom",
        className
      )}
    >
      {/* Registration marks at hairline intersections (skip duplicates between adjacent panels) */}
      {!noTopLine && (
        <>
          <RegMark position="top-left" />
          <RegMark position="top-right" />
        </>
      )}
      {!noBottomLine && (
        <>
          <RegMark position="bottom-left" />
          <RegMark position="bottom-right" />
        </>
      )}

      {children}
    </section>
  );
}

export function PanelBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("p-4", className)}>{children}</div>;
}
