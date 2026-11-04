import * as React from "react";
import { cn } from "@/lib/cn";

interface PanelProps extends React.HTMLAttributes<HTMLElement> {
  id?: string;
  className?: string;
  children: React.ReactNode;
  noTopLine?: boolean;
  noBottomLine?: boolean;
  "aria-labelledby"?: string;
  "data-build-section"?: string;
}

export function Panel({
  id,
  className,
  children,
  noTopLine = false,
  noBottomLine = false,
  "aria-labelledby": ariaLabelledBy,
  "data-build-section": dataBuildSection,
  ...props
}: PanelProps) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      data-build-section={dataBuildSection}
      {...props}
      className={cn(
        "mx-auto max-w-3xl w-full border-x border-[var(--line-soft)] relative bg-[var(--background)]",
        noTopLine ? "screen-line-top-none" : "screen-line-top",
        noBottomLine ? "screen-line-bottom-none" : "screen-line-bottom",
        className
      )}
    >
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
  return <div className={cn("p-5 sm:p-6", className)}>{children}</div>;
}
