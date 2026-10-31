import React from "react";
import type { AchievementTier } from "./achievements";

interface GlyphProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * 24x24 blueprint SVG glyphs for Topping Out achievements.
 * Clean, technical, 1.5px stroke, rounded joins and caps.
 */

export function FoundationLaidGlyph(props: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 20h18" />
      <rect x="5" y="13" width="14" height="7" rx="0.5" />
      <line x1="12" y1="13" x2="12" y2="20" />
      <line x1="8.5" y1="13" x2="8.5" y2="20" />
      <line x1="15.5" y1="13" x2="15.5" y2="20" />
    </svg>
  );
}

export function PlumbLineGlyph(props: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="2" x2="12" y2="13" />
      <path d="M12 13l3.5 4.5L12 21.5 8.5 17.5 12 13z" fill="currentColor" fillOpacity="0.1" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
      <line x1="6" y1="2" x2="18" y2="2" />
    </svg>
  );
}

export function HatTrickGlyph(props: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="6" y="16" width="12" height="4" rx="0.5" />
      <rect x="6" y="10" width="12" height="4" rx="0.5" />
      <rect x="6" y="4" width="12" height="4" rx="0.5" />
      <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="1 2" strokeOpacity="0.6" />
    </svg>
  );
}

export function LevelHeadedGlyph(props: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="8" width="18" height="8" rx="1" />
      <line x1="9" y1="8" x2="9" y2="16" />
      <line x1="15" y1="8" x2="15" y2="16" />
      <circle cx="12" cy="12" r="1.75" fill="currentColor" fillOpacity="0.2" />
      <circle cx="12" cy="12" r="0.75" fill="currentColor" />
    </svg>
  );
}

export function GrowthSpurtGlyph(props: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="7" y="9" width="10" height="6" rx="0.5" />
      {/* Expanding outward arrows */}
      <path d="M4 12l-2 0m0 0l1.5-1.5M2 12l1.5 1.5" />
      <path d="M20 12l2 0m0 0l-1.5-1.5M22 12l-1.5 1.5" />
      <path d="M12 4l0-2m0 0l-1.5 1.5M12 2l1.5 1.5" />
      <path d="M12 20l0 2m0 0l-1.5-1.5M12 22l1.5-1.5" />
    </svg>
  );
}

export function FlawlessTenGlyph(props: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="8" y="5" width="8" height="15" rx="0.5" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="11" x2="16" y2="11" />
      <line x1="8" y1="14" x2="16" y2="14" />
      <line x1="8" y1="17" x2="16" y2="17" />
      <path d="M12 2l1 1.5 1.8-.3-0.5 1.7 1.4 1.2-1.8.5-0.5 1.7-1.4-1.2-1.8.5 0.5-1.7-1.4-1.2 1.8-.5z" fill="currentColor" fillOpacity="0.15" />
    </svg>
  );
}

export function ByAHairGlyph(props: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="15" width="16" height="5" rx="0.5" />
      {/* Super narrow sliver balanced on top */}
      <rect x="10.5" y="6" width="3" height="9" rx="0.5" />
      <line x1="12" y1="2" x2="12" y2="6" strokeDasharray="1 1.5" />
    </svg>
  );
}

export function MidRiseGlyph(props: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 21h18" />
      <rect x="6" y="9" width="12" height="12" rx="0.5" />
      <line x1="9" y1="12" x2="11" y2="12" />
      <line x1="13" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="11" y2="16" />
      <line x1="13" y1="16" x2="15" y2="16" />
    </svg>
  );
}

export function HighRiseGlyph(props: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 21h18" />
      <rect x="7" y="4" width="10" height="17" rx="0.5" />
      <line x1="9.5" y1="7" x2="10.5" y2="7" />
      <line x1="13.5" y1="7" x2="14.5" y2="7" />
      <line x1="9.5" y1="11" x2="10.5" y2="11" />
      <line x1="13.5" y1="11" x2="14.5" y2="11" />
      <line x1="9.5" y1="15" x2="10.5" y2="15" />
      <line x1="13.5" y1="15" x2="14.5" y2="15" />
    </svg>
  );
}

export function SkylineGlyph(props: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 21h20" />
      <path d="M4 21V13h4v8" />
      <path d="M8 21V7h5v14" />
      <path d="M13 21V11h3v10" />
      <path d="M16 21V5h4v16" />
    </svg>
  );
}

export function CloudPiercerGlyph(props: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Tower piercing cloud */}
      <line x1="12" y1="2" x2="12" y2="10" />
      <polygon points="12,2 14,7 10,7" fill="currentColor" fillOpacity="0.2" />
      <path d="M6 14a4 4 0 0 1 7.5-1.8A3.5 3.5 0 0 1 18 15a3 3 0 0 1-.5 6H5a3.5 3.5 0 0 1 1-7z" strokeDasharray="3 1.5" />
      <line x1="10" y1="14" x2="10" y2="21" />
      <line x1="14" y1="14" x2="14" y2="21" />
    </svg>
  );
}

export function LandmarkCollectorGlyph(props: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Arch (Gateway) + Minaret spire (Qutub) */}
      <path d="M3 20h8V11a4 4 0 0 1 0-8" />
      {/* Gateway Arch */}
      <path d="M4 20v-8a2 2 0 0 1 4 0v8" />
      {/* Qutub Minar silhouette */}
      <polygon points="17,3 15,20 19,20" />
      <line x1="17" y1="3" x2="17" y2="2" />
      <line x1="15.5" y1="10" x2="18.5" y2="10" />
      <line x1="15.2" y1="15" x2="18.8" y2="15" />
    </svg>
  );
}

export function LeaningTowerGlyph(props: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 21h18" />
      <g transform="rotate(12 12 18)">
        <rect x="9" y="4" width="6" height="15" rx="0.5" />
        <line x1="9" y1="8" x2="15" y2="8" />
        <line x1="9" y1="12" x2="15" y2="12" />
        <line x1="9" y1="16" x2="15" y2="16" />
      </g>
    </svg>
  );
}

export function LuckySevenGlyph(props: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      {/* Architectural "7" */}
      <path d="M8 8h8l-5 8" />
      <circle cx="9" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

export function NightShiftGlyph(props: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Crescent moon */}
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
      {/* Small skyscraper with one lit window */}
      <rect x="5" y="13" width="7" height="8" rx="0.5" />
      <rect x="8" y="15" width="2" height="2" fill="currentColor" />
    </svg>
  );
}

export function CharteredArchitectGlyph(props: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Compass / dividers */}
      <circle cx="12" cy="4" r="2" />
      <line x1="11" y1="6" x2="6" y2="20" />
      <line x1="13" y1="6" x2="18" y2="20" />
      <line x1="8.5" y1="13" x2="15.5" y2="13" />
      <path d="M5 21a10 10 0 0 0 14 0" strokeDasharray="1.5 2" strokeOpacity="0.6" />
    </svg>
  );
}

export function LockGlyph(props: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="5" y="11" width="14" height="10" rx="1.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <circle cx="12" cy="16" r="1.25" fill="currentColor" />
    </svg>
  );
}

export function TrophyGlyph(props: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 4h16v6a7 7 0 0 1-14 0V4z" />
      <line x1="12" y1="17" x2="12" y2="20" />
      <line x1="8" y1="20" x2="16" y2="20" />
    </svg>
  );
}

/**
 * Returns the matching glyph component for an achievement ID
 */
export function getAchievementGlyph(id: string) {
  switch (id) {
    case "foundation-laid":
      return FoundationLaidGlyph;
    case "plumb-line":
      return PlumbLineGlyph;
    case "hat-trick":
      return HatTrickGlyph;
    case "level-headed":
      return LevelHeadedGlyph;
    case "growth-spurt":
      return GrowthSpurtGlyph;
    case "flawless-ten":
      return FlawlessTenGlyph;
    case "by-a-hair":
      return ByAHairGlyph;
    case "mid-rise":
      return MidRiseGlyph;
    case "high-rise":
      return HighRiseGlyph;
    case "skyline":
      return SkylineGlyph;
    case "cloud-piercer":
      return CloudPiercerGlyph;
    case "landmark-collector":
      return LandmarkCollectorGlyph;
    case "leaning-tower":
      return LeaningTowerGlyph;
    case "lucky-seven":
      return LuckySevenGlyph;
    case "night-shift":
      return NightShiftGlyph;
    case "chartered-architect":
      return CharteredArchitectGlyph;
    default:
      return TrophyGlyph;
  }
}

/**
 * Tier pips: 1 to 3 dots, representing the difficulty / prestige tier
 */
export function TierPips({
  tier,
  className = "",
}: {
  tier: AchievementTier;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      aria-label={`Tier ${tier}`}
      title={`Tier ${tier}`}
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <span
          key={i}
          className={`inline-block w-1.5 h-1.5 rounded-full transition-colors ${
            i < tier ? "bg-[var(--accent)]" : "bg-[var(--muted-foreground)]/25"
          }`}
        />
      ))}
    </span>
  );
}

