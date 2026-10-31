"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { site } from "@/content/site";

interface AvatarBadgeProps {
  hasPhoto: boolean;
  className?: string;
}

export function AvatarBadge({ hasPhoto, className }: AvatarBadgeProps) {
  const [imageError, setImageError] = React.useState(false);

  return (
    <div className={cn("relative flex flex-col items-center select-none", className)}>
      {/* Tile Container with 4 Corner Crop Marks */}
      <div className="relative">
        {/* Four L-shaped Crop Marks (10px arms, 1px var(--foreground)/60, 6px gap) */}
        {/* Top-Left */}
        <div
          aria-hidden="true"
          className="absolute -top-1.5 -left-1.5 pointer-events-none"
        >
          <div className="absolute right-0 bottom-0 w-2.5 h-px bg-foreground/60" />
          <div className="absolute right-0 bottom-0 w-px h-2.5 bg-foreground/60" />
        </div>

        {/* Top-Right */}
        <div
          aria-hidden="true"
          className="absolute -top-1.5 -right-1.5 pointer-events-none"
        >
          <div className="absolute left-0 bottom-0 w-2.5 h-px bg-foreground/60" />
          <div className="absolute left-0 bottom-0 w-px h-2.5 bg-foreground/60" />
        </div>

        {/* Bottom-Left */}
        <div
          aria-hidden="true"
          className="absolute -bottom-1.5 -left-1.5 pointer-events-none"
        >
          <div className="absolute right-0 top-0 w-2.5 h-px bg-foreground/60" />
          <div className="absolute right-0 top-0 w-px h-2.5 bg-foreground/60" />
        </div>

        {/* Bottom-Right */}
        <div
          aria-hidden="true"
          className="absolute -bottom-1.5 -right-1.5 pointer-events-none"
        >
          <div className="absolute left-0 top-0 w-2.5 h-px bg-foreground/60" />
          <div className="absolute left-0 top-0 w-px h-2.5 bg-foreground/60" />
        </div>

        {/* Square ID-Frame Avatar Tile (128px mobile, 160px sm+) */}
        <div
          className={cn(
            "w-32 h-32 sm:w-40 sm:h-40 rounded-[4px] overflow-hidden shrink-0",
            "ring-1 ring-inset ring-foreground/20 bg-[var(--muted)] relative"
          )}
          aria-label={`Portrait of ${site.name.full}`}
        >
          {hasPhoto && !imageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={site.assets.photo}
              alt={site.assets.photoAlt}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover object-top grayscale contrast-105 dark:contrast-115 transition-all"
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--muted)] text-muted-foreground relative">
              {/* Technical cross lines in the background */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, var(--line-strong) 1px, transparent 1px), linear-gradient(to bottom, var(--line-strong) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
              <span className="font-mono text-2xl sm:text-3xl font-medium tracking-wider select-none text-foreground/80 z-10">
                CP
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Dimension Under Tile: "160 x 160" */}
      <div
        aria-hidden="true"
        className="w-32 sm:w-40 flex items-center justify-between gap-1 pt-2 font-mono text-[10px] text-[var(--dimension-foreground)]"
      >
        <span className="w-2 h-px bg-[var(--dimension)]" />
        <span className="tabular-nums uppercase tracking-wider">160 × 160</span>
        <span className="w-2 h-px bg-[var(--dimension)]" />
      </div>
    </div>
  );
}
