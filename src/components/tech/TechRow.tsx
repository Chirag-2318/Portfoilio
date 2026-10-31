"use client";

import * as React from "react";
import { LayoutGroup } from "framer-motion";
import { cn } from "@/lib/cn";
import { TECH, type TechId, type TechItem } from "@/lib/tech-icons";
import { TechTile } from "./TechTile";

export interface TechRowProps {
  heading?: string;
  headingClassName?: string;
  techs: (TechId | TechItem)[];
  size?: "md" | "sm";
  className?: string;
  layoutId?: string;
}

export function TechRow({
  heading,
  headingClassName,
  techs,
  size = "md",
  className,
  layoutId,
}: TechRowProps) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const autoLayoutId = React.useId();
  const effectiveLayoutId = layoutId || autoLayoutId;

  // Resolve items from registry if TechId string is passed
  const items: TechItem[] = React.useMemo(() => {
    return techs
      .map((t) => {
        if (typeof t === "string") {
          return TECH[t as TechId];
        }
        return t;
      })
      .filter(Boolean);
  }, [techs]);

  // Collapse on tapping outside (especially on touch devices)
  React.useEffect(() => {
    if (!expandedId) return;

    function handlePointerDown(e: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setExpandedId(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [expandedId]);

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      {/* Row Heading */}
      {heading && (
        <h4
          className={cn(
            "font-sans font-semibold text-[15px] leading-snug text-foreground mb-3 tracking-normal select-none",
            headingClassName
          )}
        >
          {heading}
        </h4>
      )}

      {/* Tiles row with LayoutGroup so neighbours glide smoothly */}
      <LayoutGroup id={effectiveLayoutId}>
        <div className="flex flex-wrap items-center gap-2">
          {items.map((item) => {
            const isExpanded = expandedId === item.id;

            return (
              <TechTile
                key={item.id}
                tech={item}
                size={size}
                isExpanded={isExpanded}
                onToggle={() => {
                  setExpandedId((prev) => (prev === item.id ? null : item.id));
                }}
                onHoverStart={() => {
                  setExpandedId(item.id);
                }}
                onHoverEnd={() => {
                  setExpandedId((prev) => (prev === item.id ? null : prev));
                }}
                onFocus={() => {
                  setExpandedId(item.id);
                }}
                onBlur={() => {
                  setExpandedId((prev) => (prev === item.id ? null : prev));
                }}
              />
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}
