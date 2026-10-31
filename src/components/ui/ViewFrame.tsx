import * as React from "react";
import { ResolveText } from "@/components/motion/ResolveText";

export interface ViewFrameProps {
  title: string;
  sub?: string;
  kicker?: string;
  children: React.ReactNode;
  className?: string;
}

export function ViewFrame({
  title,
  sub,
  kicker,
  children,
  className = "",
}: ViewFrameProps) {
  return (
    <div className={`pt-6 sm:pt-8 ${className}`}>
      {/* Header row */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between pb-8 mb-8 border-b border-line hairline border-t-0 border-x-0 gap-4">
        <div>
          {kicker && <span className="label block mb-2">{kicker}</span>}
          <ResolveText as="h1" className="title-2xl font-serif">
            {title}
          </ResolveText>
        </div>
        {sub && (
          <p className="text-base text-ink-2 max-w-[48ch] leading-relaxed lg:text-right">
            {sub}
          </p>
        )}
      </div>

      {/* Main children area */}
      <div>{children}</div>
    </div>
  );
}

