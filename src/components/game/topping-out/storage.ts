/**
 * Persistence layer for Topping Out achievements and stats.
 * Tolerant of corrupted JSON, resets silently without throwing.
 */

import {
  type LifetimeStats,
  type AchievementState,
  createInitialAchievementState,
} from "./achievements";

export const STORAGE_KEY_ACHIEVEMENTS = "topping-out-achievements";
export const STORAGE_KEY_STATS = "topping-out-stats";
export const STORAGE_KEY_SEEN = "topping-out-seen";

export function loadAchievements(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      // Validate all values are numbers
      const clean: Record<string, number> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === "number" && Number.isFinite(v)) {
          clean[k] = v;
        }
      }
      return clean;
    }
    return {};
  } catch {
    return {};
  }
}

export function saveAchievements(unlocked: Record<string, number>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(unlocked));
  } catch {
    // Ignore storage quota or disabled errors
  }
}

export function loadLifetimeStats(): LifetimeStats {
  const defaults: LifetimeStats = {
    games: 0,
    floorsTotal: 0,
    bestFloors: 0,
    bestCombo: 0,
  };
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATS);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return {
        games: typeof parsed.games === "number" ? parsed.games : 0,
        floorsTotal: typeof parsed.floorsTotal === "number" ? parsed.floorsTotal : 0,
        bestFloors: typeof parsed.bestFloors === "number" ? parsed.bestFloors : 0,
        bestCombo: typeof parsed.bestCombo === "number" ? parsed.bestCombo : 0,
      };
    }
    return defaults;
  } catch {
    return defaults;
  }
}

export function saveLifetimeStats(stats: LifetimeStats): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  } catch {
    // Ignore storage errors
  }
}

export function hasSeenAchievementHint(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(STORAGE_KEY_SEEN) === "1";
  } catch {
    return false;
  }
}

export function markSeenAchievementHint(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_SEEN, "1");
  } catch {
    // Ignore storage errors
  }
}

export function loadInitialState(): AchievementState {
  const unlocked = loadAchievements();
  const lifetime = loadLifetimeStats();
  return createInitialAchievementState(unlocked, lifetime);
}
