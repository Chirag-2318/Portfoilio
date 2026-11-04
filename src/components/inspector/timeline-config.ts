// Master Timeline and Visual Configuration for the Dev-Tools Inspector & Cursors
//
// ─── HOW TO RETIME OR ADD A NEW TARGET ───
// 1. Add `data-build-id="your-id"` and `data-build-type="text|block|media|chrome|pill"` to your DOM element.
// 2. Add an entry to RAW_HERO_STEPS below with your targetId, assigned cursorIndex, role, startMs, and durationMs.
// 3. To retime: adjust `startMs` or `durationMs` (all times in milliseconds relative to sequence start).

import type { TimelineStep } from "./inspector-types";
import { MOTION_DURATIONS, seededRandom } from "./motion-tokens";

export const INSPECTOR_CONFIG = {
  // Cursor Swarm Counts
  desktopCursorCount: 16,
  mobileCursorCount: 6,

  // Swarm Burst Physics (fanning out from Enter button origin)
  burstSpreadRadius: 180,
  burstDurationMs: MOTION_DURATIONS.normal,

  // Trail Settings
  trailSampleDistancePx: 12,
  trailLifetimeMs: 250,

  // Timing Targets
  heroTotalDurationMs: 5200,      // Total hero sequence target (5-6s)
  sectionDurationMs: 1800,        // Brisk build for below-the-fold sections
  failsafeTimeoutMs: 8000,        // 8s failsafe: forces entire page visible under any slow/errored device

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

// ─── RAW HERO SEQUENCE TIMELINE ───
// Sequence:
// 1. Nav (0.0s - 0.9s): Logo, Links, Search, Tools
// 2. Profile Block (0.9s - 2.6s): Photo Frame, Name, Mute Icon, Tagline
// 3. Info Rows (2.6s - 4.4s): 6 rows (icons then text typing)
// 4. Handwritten Annotation (4.4s - 5.2s): "find me here" stroke reveal
const RAW_HERO_STEPS: TimelineStep[] = [
  // ── 1. Navigation Bar (0.0s - 0.9s)
  {
    targetId: "nav-logo",
    cursorIndex: 0,
    cursorRole: "drawer",
    startMs: 80,
    durationMs: MOTION_DURATIONS.normal,
    guideAxis: "both",
  },
  {
    targetId: "nav-links",
    cursorIndex: 1,
    cursorRole: "drawer",
    startMs: 210,
    durationMs: 440,
    guideAxis: "y",
  },
  {
    targetId: "nav-search",
    cursorIndex: 2,
    cursorRole: "drawer",
    startMs: 350,
    durationMs: MOTION_DURATIONS.normal,
    guideAxis: "y",
  },
  {
    targetId: "nav-tools",
    cursorIndex: 3,
    cursorRole: "drawer",
    startMs: 470,
    durationMs: 360,
    guideAxis: "both",
  },

  // ── 2. Profile Block (0.9s - 2.6s)
  // Photo Frame (Media placer with placeholder and blur-up)
  {
    targetId: "hero-photo",
    cursorIndex: 2,
    cursorRole: "placer",
    startMs: 890,
    durationMs: MOTION_DURATIONS.slow,
    guideAxis: "both",
  },
  // Name "Chirag Patil" (Ghost Echo Headline Collapse)
  {
    targetId: "hero-name",
    cursorIndex: 1,
    cursorRole: "drawer",
    startMs: 1210,
    durationMs: 620,
    guideAxis: "both",
  },
  // Mute Sound Toggle Button
  {
    targetId: "hero-mute",
    cursorIndex: 4,
    cursorRole: "drawer",
    startMs: 1560,
    durationMs: 340,
    guideAxis: "y",
  },
  // Monospace Tagline (Typewriter typing)
  {
    targetId: "hero-tagline",
    cursorIndex: 1,
    cursorRole: "typer",
    startMs: 1860,
    durationMs: 720,
    guideAxis: "x",
  },

  // ── 3. Overview Info Rows (2.6s - 4.4s)
  // Row 1: Barclays Summer Intern
  {
    targetId: "info-row-1-icon",
    cursorIndex: 5,
    cursorRole: "drawer",
    startMs: 2560,
    durationMs: 300,
    guideAxis: "x",
  },
  {
    targetId: "info-row-1-text",
    cursorIndex: 6,
    cursorRole: "typer",
    startMs: 2660,
    durationMs: 450,
    guideAxis: "x",
  },

  // Row 2: Pune, Maharashtra
  {
    targetId: "info-row-2-icon",
    cursorIndex: 7,
    cursorRole: "drawer",
    startMs: 2960,
    durationMs: 280,
    guideAxis: "x",
  },
  {
    targetId: "info-row-2-text",
    cursorIndex: 8,
    cursorRole: "typer",
    startMs: 3060,
    durationMs: 420,
    guideAxis: "x",
  },

  // Row 3: Live IST Clock & Timezone (Scramble decode)
  {
    targetId: "info-row-3-icon",
    cursorIndex: 9,
    cursorRole: "drawer",
    startMs: 3310,
    durationMs: 280,
    guideAxis: "x",
  },
  {
    targetId: "info-row-3-text",
    cursorIndex: 10,
    cursorRole: "typer",
    startMs: 3410,
    durationMs: 460,
    guideAxis: "x",
  },

  // Row 4: Email (Scramble decode)
  {
    targetId: "info-row-4-icon",
    cursorIndex: 11,
    cursorRole: "drawer",
    startMs: 3660,
    durationMs: 280,
    guideAxis: "x",
  },
  {
    targetId: "info-row-4-text",
    cursorIndex: 12,
    cursorRole: "typer",
    startMs: 3760,
    durationMs: 410,
    guideAxis: "x",
  },

  // Row 5: Phone Number (Scramble decode)
  {
    targetId: "info-row-5-icon",
    cursorIndex: 13,
    cursorRole: "drawer",
    startMs: 4010,
    durationMs: 280,
    guideAxis: "x",
  },
  {
    targetId: "info-row-5-text",
    cursorIndex: 14,
    cursorRole: "typer",
    startMs: 4090,
    durationMs: 410,
    guideAxis: "x",
  },

  // Row 6: Education (PICT + IIT Madras)
  {
    targetId: "info-row-6-icon",
    cursorIndex: 5,
    cursorRole: "drawer",
    startMs: 4310,
    durationMs: 280,
    guideAxis: "x",
  },
  {
    targetId: "info-row-6-text",
    cursorIndex: 6,
    cursorRole: "typer",
    startMs: 4390,
    durationMs: 490,
    guideAxis: "x",
  },

  // ── 4. Social Links & Handwritten Annotation (4.7s - 5.3s)
  {
    targetId: "social-buttons",
    cursorIndex: 3,
    cursorRole: "drawer",
    startMs: 4710,
    durationMs: MOTION_DURATIONS.normal,
    guideAxis: "both",
  },
  {
    targetId: "social-note",
    cursorIndex: 0,
    cursorRole: "typer",
    startMs: 4860,
    durationMs: 490,
    guideAxis: "both",
  },
];

// Apply deterministic seeded micro-variance so no two elements ever share the exact same start frame
export const HERO_STEPS: TimelineStep[] = RAW_HERO_STEPS.map((step, idx) => {
  const jitterMs = Math.round((seededRandom(idx * 7919) - 0.5) * 14); // -7ms to +7ms
  return {
    ...step,
    startMs: Math.max(0, step.startMs + jitterMs),
  };
});
