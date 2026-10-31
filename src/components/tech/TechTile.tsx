"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion, type Transition } from "framer-motion";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/cn";
import type { TechItem } from "@/lib/tech-icons";

export interface TechTileProps {
  tech: TechItem;
  isExpanded: boolean;
  onToggle: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  size?: "md" | "sm";
  className?: string;
}

export const TechTile = React.forwardRef<HTMLButtonElement, TechTileProps>(
  function TechTile(
    {
      tech,
      isExpanded,
      onToggle,
      onHoverStart,
      onHoverEnd,
      onFocus,
      onBlur,
      size = "md",
      className,
    },
    ref
  ) {
    const prefersReducedMotion = useReducedMotion();
    const isSmall = size === "sm";
    const iconSize = isSmall ? 18 : 22;

    const springTransition: Transition = prefersReducedMotion
      ? { duration: 0 }
      : { type: "spring", stiffness: 420, damping: 34, mass: 0.8 };

    return (
      <motion.button
        ref={ref}
        type="button"
        layout
        transition={springTransition}
        onClick={onToggle}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-label={tech.name}
        aria-expanded={isExpanded}
        title={tech.name}
        style={{
          borderStyle: "dashed",
          borderWidth: "1.5px",
          borderColor: "var(--tile-border)",
          backgroundColor: isExpanded ? "var(--tile-bg-hover)" : "var(--tile-bg)",
        }}
        className={cn(
          "relative inline-flex items-center justify-center cursor-pointer select-none",
          "hover:bg-[var(--tile-bg-hover)] transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
          isSmall
            ? cn("h-9 rounded-[10px]", isExpanded ? "pl-2 pr-3 gap-1.5" : "w-9 px-0")
            : cn("h-11 rounded-xl", isExpanded ? "pl-[10px] pr-[14px] gap-2" : "w-11 px-0"),
          className
        )}
      >
        {/* Real Brand Icon or Mono Glyph */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{ width: iconSize, height: iconSize }}
          aria-hidden="true"
        >
          {tech.isMonoGlyph ? (
            <span
              className={cn(
                "font-mono font-bold tracking-tight text-foreground select-none leading-none",
                isSmall ? "text-[11px]" : "text-xs"
              )}
            >
              SQL
            </span>
          ) : tech.icon ? (
            <Icon
              icon={tech.icon}
              width={iconSize}
              height={iconSize}
              className={cn(
                "shrink-0 block select-none pointer-events-none",
                tech.invertOnDark && "dark:invert"
              )}
            />
          ) : null}
        </div>

        {/* Expanded Label */}
        <AnimatePresence>
          {isExpanded && (
            <motion.span
              initial={prefersReducedMotion ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, x: -4 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              className={cn(
                "font-sans font-medium whitespace-nowrap text-foreground select-none truncate leading-none",
                isSmall ? "text-xs sm:text-[13px]" : "text-[15px]"
              )}
            >
              {tech.name}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }
);
