"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/cn";
import { TECH, type TechId } from "@/lib/tech-icons";

export interface TechChipProps {
  id: TechId;
  size?: "md" | "sm";
  className?: string;
}

export function TechChip({ id, size = "md", className }: TechChipProps) {
  const tech = TECH[id];
  if (!tech) return null;

  const isSmall = size === "sm";
  const iconSize = isSmall ? 14 : 16;

  return (
    <span
      className={cn(
        "inline-flex items-center border border-[var(--border)] bg-transparent select-none transition-colors duration-150 hover:bg-[var(--muted)]",
        isSmall
          ? "h-7 px-2 gap-1.5 rounded-lg text-xs font-medium text-foreground"
          : "h-8 px-2.5 gap-1.5 rounded-lg text-[13px] font-medium text-foreground",
        className
      )}
      title={tech.note || tech.name}
    >
      <span
        className="flex items-center justify-center shrink-0"
        style={{ width: iconSize, height: iconSize }}
        aria-hidden="true"
      >
        {tech.isMonoGlyph ? (
          <span className={cn("font-mono font-bold leading-none", isSmall ? "text-[10px]" : "text-[11px]")}>
            SQL
          </span>
        ) : tech.icon ? (
          <Icon
            icon={tech.icon}
            width={iconSize}
            height={iconSize}
            className={cn("shrink-0 block select-none pointer-events-none", tech.invertOnDark && "dark:invert")}
          />
        ) : null}
      </span>
      <span className="whitespace-nowrap">{tech.name}</span>
    </span>
  );
}
