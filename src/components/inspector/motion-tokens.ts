// Centralized Motion Tokens, Easings, Seeded Micro-Variance & Debug Config Store
// Strictly avoids linear motion; standardizes timing curves across all animations.

export const MOTION_DURATIONS = {
  instant: 120,      // Micro-interactions, caret blinks, quick clicks
  fast: 240,         // Icon placements, snapping lines, handle pops
  normal: 400,       // Box drawings, drawer passes, cursor trajectories
  slow: 650,         // Ghost-echo headline collapse, mask aperture expansion
  deliberate: 1100,  // Full hero transition, complex multi-line reveals
} as const;

export const MOTION_EASINGS = {
  // Apple Keynote / Expo Out: rapid explosive start with silky-smooth deceleration
  expoOut: "cubic-bezier(0.16, 1, 0.3, 1)",
  expoOutCubic: [0.16, 1, 0.3, 1] as const,

  // Gentle physical overshoot and settling for snap points and handles
  backOut: "cubic-bezier(0.34, 1.45, 0.64, 1)",
  backOutCubic: [0.34, 1.45, 0.64, 1] as const,

  // Smooth editorial ease for content fills and crossfades
  smooth: "cubic-bezier(0.25, 1, 0.5, 1)",
  smoothCubic: [0.25, 1, 0.5, 1] as const,

  // Mechanical snap for layout guides and dimension pills
  snap: "cubic-bezier(0, 0, 0.2, 1)",
  snapCubic: [0, 0, 0.2, 1] as const,
} as const;

/**
 * Deterministic pseudo-random number generator (Mulberry32).
 * Produces reproducible micro-variance so no two elements start on the exact same frame.
 */
export function seededRandom(seed: number): number {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * Generates a non-uniform stagger offset in milliseconds based on index and seed.
 * Range: +3ms to +28ms jitter.
 */
export function getMicroStagger(index: number, baseMs: number = 30): number {
  const variance = seededRandom(index * 997 + 42) * 22; // 0 to 22ms
  return Math.round(baseMs + variance);
}

// ─── LIVE DEBUG TUNING STORE (Activated via ?debug in URL) ───
export interface DebugConfig {
  speedMultiplier: number;
  cursorCount: number;
  heroDurationMs: number;
  trailLifetimeMs: number;
  showInspectorLines: boolean;
  active: boolean;
}

const DEFAULT_DEBUG_CONFIG: DebugConfig = {
  speedMultiplier: 1.0,
  cursorCount: 16,
  heroDurationMs: 5200,
  trailLifetimeMs: 250,
  showInspectorLines: true,
  active: false,
};

type DebugListener = (config: DebugConfig) => void;

class DebugStore {
  private config: DebugConfig = { ...DEFAULT_DEBUG_CONFIG };
  private listeners: Set<DebugListener> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has("debug")) {
        this.config.active = true;
      }
    }
  }

  public get(): DebugConfig {
    return this.config;
  }

  public set(updates: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...updates };
    this.listeners.forEach((fn) => fn(this.config));
  }

  public subscribe(fn: DebugListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

export const debugStore = new DebugStore();
