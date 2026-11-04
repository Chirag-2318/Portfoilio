"use client";

import * as React from "react";
import { site } from "@/content/site";
import { AvatarBadge } from "@/components/blueprint/AvatarBadge";
import { RotatingTagline } from "@/components/hero/RotatingTagline";
import { SoundToggle } from "@/components/sound/sound-effects";

interface HeroBlueprintProps {
  hasPhoto: boolean;
}

export function HeroBlueprint({ hasPhoto }: HeroBlueprintProps) {
  return (
    <div
      id="top"
      className="relative mx-auto max-w-3xl w-full border-x border-[var(--line-soft)] screen-line-bottom select-none grid grid-cols-[auto_1fr] bg-[var(--background)]"
    >
      {/* 1. Avatar Block: Square ID-Frame Avatar with Crop Marks (left column) */}
      <div className="relative border-r border-[var(--line)] -mx-px flex items-center justify-center p-2.5 sm:p-3 bg-[var(--background)] shrink-0">
        <AvatarBadge hasPhoto={hasPhoto} />
      </div>

      {/* 2. Name Block: Serif display type + Rotating Humour Tagline + Mute Button (right column) */}
      <div className="relative flex flex-col justify-between min-w-0 bg-[var(--background)]">
        {/* Row 1: Serif H1 name + Mute toggle */}
        <div className="flex-1 pl-3 sm:pl-5 pr-2 sm:pr-4 py-2 sm:py-3 flex items-center justify-between sm:justify-start gap-3">
          <h1
            className="font-serif text-[1.85rem] min-[420px]:text-[2.25rem] sm:text-[3.25rem] leading-none font-normal tracking-[-0.01em] text-foreground whitespace-nowrap"
            style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
          >
            {site.name.full}
          </h1>

          <SoundToggle className="size-7 sm:size-8 rounded-[8px] shrink-0" />
        </div>

        {/* Row 2: Rotating Humour Tagline */}
        <div className="border-t border-[var(--line)] h-[44px] sm:h-10 py-1 pl-3 sm:pl-5 pr-3 flex items-center">
          <RotatingTagline className="w-full" />
        </div>
      </div>
    </div>
  );
}
