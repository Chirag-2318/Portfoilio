"use client";

import * as React from "react";
import { site } from "@/content/site";
import { useAssets } from "@/lib/AssetsContext";

export interface PortraitProps {
  variant: "final" | "draft";
  className?: string;
}

export function Portrait({ variant, className = "" }: PortraitProps) {
  const { hasPhoto } = useAssets();
  const isDraft = variant === "draft";

  return (
    <div className={`relative select-none ${className}`}>
      {/* Corner crop ticks outside the frame (4 x two 6px lines, var(--ink-3)) */}
      <div aria-hidden="true" className="pointer-events-none">
        {/* Top Left */}
        <div className="absolute -top-1.5 -left-1.5 w-1.5 h-1.5 border-t border-l border-ink-3" />
        {/* Top Right */}
        <div className="absolute -top-1.5 -right-1.5 w-1.5 h-1.5 border-t border-r border-ink-3" />
        {/* Bottom Left */}
        <div className="absolute -bottom-1.5 -left-1.5 w-1.5 h-1.5 border-b border-l border-ink-3" />
        {/* Bottom Right */}
        <div className="absolute -bottom-1.5 -right-1.5 w-1.5 h-1.5 border-b border-r border-ink-3" />
      </div>

      {/* Frame container */}
      <div className="aspect-[4/5] rounded-md border border-line-strong overflow-hidden bg-paper-2 relative w-full h-full shadow-xs">
        {hasPhoto ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={site.assets.photo}
              alt={isDraft ? "" : site.assets.photoAlt}
              aria-hidden={isDraft ? "true" : undefined}
              width={400}
              height={500}
              decoding="async"
              loading="eager"
              fetchPriority="high"
              className={`w-full h-full object-cover object-[50%_30%] transition-filter duration-200 ${
                isDraft
                  ? "filter grayscale contrast-125 brightness-105"
                  : "filter contrast-[1.02]"
              }`}
            />
            {isDraft && (
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, var(--ink) 1px, transparent 1px)",
                  backgroundSize: "6px 6px",
                  opacity: 0.25,
                }}
              />
            )}
          </>
        ) : (
          <div className="w-full h-full relative">
            <svg
              viewBox="0 0 160 200"
              className="w-full h-full block"
              role={isDraft ? undefined : "img"}
              aria-label={isDraft ? undefined : "Placeholder portrait of Chirag Patil"}
              aria-hidden={isDraft ? "true" : undefined}
            >
              <rect width="160" height="200" fill="var(--paper-2)" />
              {isDraft ? (
                <>
                  {/* Outline CP text */}
                  <text
                    x="80"
                    y="115"
                    textAnchor="middle"
                    fill="transparent"
                    stroke="var(--ink-3)"
                    strokeWidth="1"
                    className="font-serif font-medium"
                    fontSize="56"
                    letterSpacing="-0.03em"
                  >
                    CP
                  </text>
                  {/* Center registration tick */}
                  <line
                    x1="76"
                    y1="100"
                    x2="84"
                    y2="100"
                    stroke="var(--ink-3)"
                    strokeWidth="1"
                  />
                  <line
                    x1="80"
                    y1="96"
                    x2="80"
                    y2="104"
                    stroke="var(--ink-3)"
                    strokeWidth="1"
                  />
                </>
              ) : (
                /* Filled CP text with accent dot */
                <text
                  x="80"
                  y="115"
                  textAnchor="middle"
                  fill="var(--ink)"
                  className="font-serif font-medium"
                  fontSize="56"
                  letterSpacing="-0.03em"
                >
                  CP<tspan fill="var(--accent)">.</tspan>
                </text>
              )}
            </svg>
            {isDraft && (
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, var(--ink) 1px, transparent 1px)",
                  backgroundSize: "6px 6px",
                  opacity: 0.25,
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
