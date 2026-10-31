import * as React from "react";
import { ResolveText } from "@/components/motion/ResolveText";

export interface ViewFrameProps {
  title: string;
  sub?: string;
  kicker?: string;
  compactHeader?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ViewFrame({
  title,
  sub,
  kicker,
  compactHeader = false,
  children,
  className = "",
}: ViewFrameProps) {
  return (
    <div className={`${compactHeader ? "pt-1.5 sm:pt-2.5" : "pt-6 sm:pt-8"} ${className}`}>
      {/* Header row */}
      <div
        data-print="hide"
        className={`flex flex-col lg:flex-row lg:items-end justify-between border-b border-line hairline border-t-0 border-x-0 gap-3 ${
          compactHeader ? "pb-2.5 mb-3 sm:pb-3 sm:mb-4" : "pb-8 mb-8"
        }`}
      >
        <div>
          {kicker && (
            <span className={`label block ${compactHeader ? "mb-1" : "mb-2"}`}>
              {kicker}
            </span>
          )}
          <ResolveText as="h1" className="title-2xl font-serif">
            {title}
          </ResolveText>
        </div>
        {sub && (
          <p className="text-sm sm:text-base text-ink-2 max-w-[48ch] leading-relaxed lg:text-right">
            {sub}
          </p>
        )}
      </div>

      {/* Main children area */}
      <div className="min-h-0 flex-1 flex flex-col">{children}</div>
    </div>
  );
}

