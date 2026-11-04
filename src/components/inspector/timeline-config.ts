// Master Timeline and Visual Configuration for the Dev-Tools Inspector & Cursors
//
// ─── HOW TO RETIME OR ADD A NEW TARGET ───
// 1. Add `data-build-id="your-id"` and `data-build-type="text|block|media|chrome|pill"` to your DOM element.
// 2. Add an entry to HERO_STEPS below with your targetId, assigned cursorIndex, role, startMs, and durationMs.
// 3. To retime: adjust `startMs` or `durationMs` (all times in milliseconds relative to sequence start).

import type { TimelineStep } from "./inspector-types";

export const INSPECTOR_CONFIG = {
  // Cursor Swarm Counts
  desktopCursorCount: 16,
  mobileCursorCount: 6,

  // Swarm Burst Physics (fanning out from Enter button origin)
  burstSpreadRadius: 180,
  burstDurationMs: 400,

  // Trail Settings
  trailSampleDistancePx: 12,
  trailLifetimeMs: 250,

  // Timing Targets
  heroTotalDurationMs: 5200,      // Total hero sequence target (5-6s)
  sectionDurationMs: 1800,        // Brisk build for below-the-fold sections
  failsafeTimeoutMs: 12000,       // Absolute fallback to force entire page visible

  // Inspector Visual Tokens
  blueOutlineColor: "#2563eb",    // Saturated blueprint blue (matches inspector theme)
  accentGuideColor: "#ff5a2c",    // Theme redline accent
  redGuideColor: "#ef4444",       // Alignment snapping guide
  orangeGuideColor: "#f97316",    // Section boundaries
  cornerHandleSizePx: 5,
  overlayFadeDurationMs: 200,     // Skeleton fade after completion
  guideLingerDurationMs: 400,     // Alignment guide persistence

  // Cursor Appearance (Harmonized OKLCH Palette: Lightness 0.68, Chroma 0.18)
  cursorPalette: [
    "oklch(0.68 0.18 25)",   // Coral red
    "oklch(0.68 0.18 60)",   // Amber
    "oklch(0.68 0.18 135)",  // Emerald green
    "oklch(0.68 0.18 185)",  // Cyan
    "oklch(0.68 0.18 230)",  // Sky blue
    "oklch(0.68 0.18 280)",  // Indigo / Purple
    "oklch(0.68 0.18 320)",  // Magenta / Rose
    "oklch(0.68 0.18 45)",   // Warm gold
    "oklch(0.68 0.18 160)",  // Mint
    "oklch(0.68 0.18 205)",  // Electric blue
    "oklch(0.68 0.18 255)",  // Deep violet
    "oklch(0.68 0.18 340)",  // Ruby
    "oklch(0.68 0.18 90)",   // Lime gold
    "oklch(0.68 0.18 145)",  // Bright seafoam
    "oklch(0.68 0.18 215)",  // Cerulean
    "oklch(0.68 0.18 295)",  // Iris
  ],

  // Named Tags carried by specific cursors
  nameTags: {
    0: "layout",
    1: "type",
    2: "assets",
    3: "engine",
  } as Record<number, string>,
} as const;

// ─── HERO SEQUENCE TIMELINE ───
// Sequence:
// 1. Nav (0.0s - 0.9s): Logo, Links, Search, Tools
// 2. Profile Block (0.9s - 2.6s): Photo Frame, Name, Mute Icon, Tagline
// 3. Info Rows (2.6s - 4.4s): 6 rows (icons then text typing)
// 4. Handwritten Annotation (4.4s - 5.2s): "find me here" stroke reveal
export const HERO_STEPS: TimelineStep[] = [
  // ── 1. Navigation Bar (0.0s - 0.9s)
  {
    targetId: "nav-logo",
    cursorIndex: 0,
    cursorRole: "drawer",
    startMs: 80,
    durationMs: 380,
    guideAxis: "both",
  },
  {
    targetId: "nav-links",
    cursorIndex: 1,
    cursorRole: "drawer",
    startMs: 200,
    durationMs: 450,
    guideAxis: "y",
  },
  {
    targetId: "nav-search",
    cursorIndex: 2,
    cursorRole: "drawer",
    startMs: 340,
    durationMs: 400,
    guideAxis: "y",
  },
  {
    targetId: "nav-tools",
    cursorIndex: 3,
    cursorRole: "drawer",
    startMs: 460,
    durationMs: 360,
    guideAxis: "both",
  },

  // ── 2. Profile Block (0.9s - 2.6s)
  // Photo Frame (Media placer with placeholder and blur-up)
  {
    targetId: "hero-photo",
    cursorIndex: 2,
    cursorRole: "placer",
    startMs: 880,
    durationMs: 650,
    guideAxis: "both",
  },
  // Name "Chirag Patil" (Drawer frames it, then Typer resolves)
  {
    targetId: "hero-name",
    cursorIndex: 1,
    cursorRole: "drawer",
    startMs: 1200,
    durationMs: 600,
    guideAxis: "both",
  },
  // Mute Sound Toggle Button
  {
    targetId: "hero-mute",
    cursorIndex: 4,
    cursorRole: "drawer",
    startMs: 1550,
    durationMs: 350,
    guideAxis: "y",
  },
  // Monospace Tagline (Typer types in)
  {
    targetId: "hero-tagline",
    cursorIndex: 1,
    cursorRole: "typer",
    startMs: 1850,
    durationMs: 700,
    guideAxis: "x",
  },

  // ── 3. Overview Info Rows (2.6s - 4.4s)
  // Row 1: Barclays Summer Intern
  {
    targetId: "info-row-1-icon",
    cursorIndex: 5,
    cursorRole: "drawer",
    startMs: 2550,
    durationMs: 300,
    guideAxis: "x",
  },
  {
    targetId: "info-row-1-text",
    cursorIndex: 6,
    cursorRole: "typer",
    startMs: 2650,
    durationMs: 450,
    guideAxis: "x",
  },

  // Row 2: Pune, Maharashtra
  {
    targetId: "info-row-2-icon",
    cursorIndex: 7,
    cursorRole: "drawer",
    startMs: 2950,
    durationMs: 280,
    guideAxis: "x",
  },
  {
    targetId: "info-row-2-text",
    cursorIndex: 8,
    cursorRole: "typer",
    startMs: 3050,
    durationMs: 420,
    guideAxis: "x",
  },

  // Row 3: Live IST Clock & Timezone
  {
    targetId: "info-row-3-icon",
    cursorIndex: 9,
    cursorRole: "drawer",
    startMs: 3300,
    durationMs: 280,
    guideAxis: "x",
  },
  {
    targetId: "info-row-3-text",
    cursorIndex: 10,
    cursorRole: "typer",
    startMs: 3400,
    durationMs: 450,
    guideAxis: "x",
  },

  // Row 4: Email
  {
    targetId: "info-row-4-icon",
    cursorIndex: 11,
    cursorRole: "drawer",
    startMs: 3650,
    durationMs: 280,
    guideAxis: "x",
  },
  {
    targetId: "info-row-4-text",
    cursorIndex: 12,
    cursorRole: "typer",
    startMs: 3750,
    durationMs: 400,
    guideAxis: "x",
  },

  // Row 5: Phone Number
  {
    targetId: "info-row-5-icon",
    cursorIndex: 13,
    cursorRole: "drawer",
    startMs: 4000,
    durationMs: 280,
    guideAxis: "x",
  },
  {
    targetId: "info-row-5-text",
    cursorIndex: 14,
    cursorRole: "typer",
    startMs: 4080,
    durationMs: 400,
    guideAxis: "x",
  },

  // Row 6: Education (PICT + IIT Madras)
  {
    targetId: "info-row-6-icon",
    cursorIndex: 5,
    cursorRole: "drawer",
    startMs: 4300,
    durationMs: 280,
    guideAxis: "x",
  },
  {
    targetId: "info-row-6-text",
    cursorIndex: 6,
    cursorRole: "typer",
    startMs: 4380,
    durationMs: 480,
    guideAxis: "x",
  },

  // ── 4. Social Links & Handwritten Annotation (4.7s - 5.3s)
  {
    targetId: "social-buttons",
    cursorIndex: 3,
    cursorRole: "drawer",
    startMs: 4700,
    durationMs: 400,
    guideAxis: "both",
  },
  {
    targetId: "social-note",
    cursorIndex: 0,
    cursorRole: "typer",
    startMs: 4850,
    durationMs: 480,
    guideAxis: "both",
  },
];
