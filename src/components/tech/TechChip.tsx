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
      {tech.icon ? (
        <span
          className="flex items-center justify-center shrink-0"
          style={{ width: iconSize, height: iconSize }}
          aria-hidden="true"
        >
          <Icon
            icon={tech.icon}
            width={iconSize}
            height={iconSize}
            className={cn("shrink-0 block select-none pointer-events-none", tech.invertOnDark && "dark:invert")}
          />
        </span>
      ) : tech.isMonoGlyph ? (
        <span
          className="flex items-center justify-center shrink-0"
          style={{ width: iconSize, height: iconSize }}
          aria-hidden="true"
        >
          {tech.id === "oauth2" ? (
            <svg
              width={iconSize}
              height={iconSize}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground"
            >
              <circle cx="7.5" cy="15.5" r="5.5" />
              <path d="m21 2-9.6 9.6" />
              <path d="m15.5 7.5 3 3L22 7l-3-3" />
            </svg>
          ) : (
            <span className={cn("font-mono font-bold leading-none text-muted-foreground", isSmall ? "text-[9px]" : "text-[10px]")}>
              {tech.name.slice(0, 3).toUpperCase()}
            </span>
          )}
        </span>
      ) : null}
      <span className="whitespace-nowrap">{tech.name}</span>
    </span>
  );
}
