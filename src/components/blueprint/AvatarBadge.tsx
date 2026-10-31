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
    <div
      className={cn(
        "relative rounded-full overflow-hidden flex-shrink-0 select-none",
        "w-[120px] h-[120px] max-[384px]:w-[120px] max-[384px]:h-[120px] min-[384px]:w-32 min-[384px]:h-32 sm:w-40 sm:h-40",
        "ring-1 ring-inset ring-foreground/20",
        className
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
        <div
          className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground"
        >
          <span className="font-mono text-2xl sm:text-3xl font-medium tracking-wider select-none">
            CP
          </span>
        </div>
      )}
    </div>
  );
}
