"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { site } from "@/content/site";
import { MosaicReveal } from "@/components/ui/MosaicReveal";

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
            <MosaicReveal
              src={site.assets.photo}
              cols={4}
              rows={4}
              order="edges"
              trigger="mount"
              aspect="1 / 1"
              alt={site.assets.photoAlt}
              rounded="rounded-[4px]"
              className="w-full h-full object-cover object-top grayscale contrast-105 dark:contrast-115"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[var(--muted)] text-muted-foreground select-none">
              <span className="font-mono text-2xl sm:text-3xl font-medium tracking-wider text-foreground/80">
                CP
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
