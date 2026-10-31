/**
 * Achievements System for Topping Out
 * Pure deterministic logic, fully typed, zero DOM dependencies.
 */

export type AchievementCategory = "craft" | "height" | "landmark" | "secret" | "meta";
export type AchievementTier = 1 | 2 | 3;

export interface Achievement {
  id: string;
  name: string;
  flavour: string;
  how: string;
  category: AchievementCategory;
  tier: AchievementTier;
  secret?: boolean;
  hint?: string;
  reward?: string;
}

export const ACHIEVEMENTS: readonly Achievement[] = [
  {
    id: "foundation-laid",
    name: "Foundation Laid",
    tier: 1,
    category: "craft",
    how: "Place your first slab.",
    flavour: "Everything starts somewhere flat.",
  },
  {
    id: "plumb-line",
    name: "Plumb Line",
    tier: 1,
    category: "craft",
    how: "Land your first perfect drop.",
    flavour: "Dead centre.",
  },
  {
    id: "hat-trick",
    name: "Hat Trick",
    tier: 1,
    category: "craft",
    how: "Land 3 perfect drops in a row.",
    flavour: "Three in a row. Suspiciously steady.",
  },
  {
    id: "level-headed",
    name: "Level Headed",
    tier: 2,
    category: "craft",
    how: "Land 8 perfect drops in a row.",
    flavour: "Eight straight. Your coffee is not shaking.",
  },
  {
    id: "growth-spurt",
    name: "Growth Spurt",
    tier: 2,
    category: "craft",
    how: "Make a slab grow back via regrow bonus.",
    flavour: "The slab grew back. Nobody asked how.",
  },
  {
    id: "flawless-ten",
    name: "Flawless Ten",
    tier: 3,
    category: "craft",
    how: "The first 10 floors of a run are all perfect.",
    flavour: "Ten floors, zero chips.",
  },
  {
    id: "by-a-hair",
    name: "By a Hair",
    tier: 2,
    category: "craft",
    how: "After a trim leaves the slab narrower than 0.35 units, place the next slab successfully.",
    flavour: "A sliver of slab holding it all together.",
  },
  {
    id: "mid-rise",
    name: "Mid-Rise",
    tier: 1,
    category: "height",
    how: "Reach 10 floors.",
    flavour: "Double digits.",
  },
  {
    id: "high-rise",
    name: "High-Rise",
    tier: 2,
    category: "height",
    how: "Reach 20 floors.",
    flavour: "Now we need an elevator.",
  },
  {
    id: "skyline",
    name: "Skyline",
    tier: 2,
    category: "height",
    how: "Reach 30 floors.",
    flavour: "The pigeons are filing complaints.",
    reward: "Unlocks the palette 'Gold Hour'",
  },
  {
    id: "cloud-piercer",
    name: "Cloud Piercer",
    tier: 3,
    category: "height",
    how: "Reach 50 floors.",
    flavour: "Air traffic control has questions.",
  },
  {
    id: "landmark-collector",
    name: "Landmark Collector",
    tier: 2,
    category: "landmark",
    how: "Clear both the Gateway of India (26 m) and the Qutub Minar (73 m) in one run.",
    flavour: "Two landmarks, both below you.",
  },
  {
    id: "leaning-tower",
    name: "Leaning Tower",
    tier: 2,
    category: "secret",
    secret: true,
    how: "5 consecutive trimmed drops, all trimmed on the same side.",
    hint: "Always cut the same corner.",
    flavour: "Pisa called. They want their tilt back.",
  },
  {
    id: "lucky-seven",
    name: "Lucky Seven",
    tier: 1,
    category: "secret",
    secret: true,
    how: "End a run on exactly 7 floors.",
    hint: "Some numbers are luckier than others.",
    flavour: "Lucky number, unlucky ending.",
  },
  {
    id: "night-shift",
    name: "Night Shift",
    tier: 1,
    category: "secret",
    secret: true,
    how: "End a run with at least 5 floors between 00:00 and 04:59 local time.",
    hint: "The best towers go up after midnight.",
    flavour: "Late-night deploy, early-morning tower.",
  },
  {
    id: "chartered-architect",
    name: "Chartered Architect",
    tier: 3,
    category: "meta",
    how: "Unlock 10 other achievements.",
    flavour: "Ten achievements. The council approves.",
    reward: "Unlocks the palette 'Copper'",
  },
] as const;

export const ACHIEVEMENTS_BY_ID = new Map<string, Achievement>(
  ACHIEVEMENTS.map((a) => [a.id, a])
);

export interface LifetimeStats {
  games: number;
  floorsTotal: number;
  bestFloors: number;
  bestCombo: number;
}

export interface RunState {
  floors: number;
  comboNow: number;
  bestComboRun: number;
  perfects: number;
  regrows: number;
  firstTenAllPerfect: boolean; // true until a non-perfect among the first 10 placements
  sameSideTrimStreak: number;
  lastTrimSign: -1 | 0 | 1;
  pendingHair: boolean;
  landmarksCleared: string[];
}

export interface AchievementState {
  unlocked: Record<string, number>; // id to timestamp
  lifetime: LifetimeStats;
  run: RunState;
}

export type AchievementEvent =
  | { type: "placed"; kind: "perfect" | "trim"; floor: number; widthAfter: number; sign: -1 | 0 | 1 }
  | { type: "regrow" }
  | { type: "landmark"; id: string }
  | { type: "gameover"; floors: number; hour: number };

export function createInitialRunState(): RunState {
  return {
    floors: 0,
    comboNow: 0,
    bestComboRun: 0,
    perfects: 0,
    regrows: 0,
    firstTenAllPerfect: true,
    sameSideTrimStreak: 0,
    lastTrimSign: 0,
    pendingHair: false,
    landmarksCleared: [],
  };
}

export function createInitialAchievementState(
  unlocked: Record<string, number> = {},
  lifetime?: Partial<LifetimeStats>
): AchievementState {
  return {
    unlocked: { ...unlocked },
    lifetime: {
      games: lifetime?.games ?? 0,
      floorsTotal: lifetime?.floorsTotal ?? 0,
      bestFloors: lifetime?.bestFloors ?? 0,
      bestCombo: lifetime?.bestCombo ?? 0,
    },
    run: createInitialRunState(),
  };
}

/**
 * Pure state reducer for achievements
 */
export function reduceAchievements(
  state: AchievementState,
  event: AchievementEvent,
  now = Date.now()
): { state: AchievementState; unlockedNow: Achievement[] } {
  const nextUnlocked = { ...state.unlocked };
  const nextLifetime = { ...state.lifetime };
  let nextRun = { ...state.run, landmarksCleared: [...state.run.landmarksCleared] };
  const newlyUnlocked: Achievement[] = [];

  const tryUnlock = (id: string) => {
    if (!nextUnlocked[id]) {
      nextUnlocked[id] = now;
      const ach = ACHIEVEMENTS_BY_ID.get(id);
      if (ach) {
        newlyUnlocked.push(ach);
      }
    }
  };

  switch (event.type) {
    case "placed": {
      const { kind, floor, widthAfter, sign } = event;
      nextRun.floors = floor;

      // 1. Foundation Laid on first placed slab
      tryUnlock("foundation-laid");

      // 2. Pending Hair check:
      // "placed with kind 'trim' and widthAfter < 0.35 sets pendingHair, and the NEXT 'placed' event (any kind) unlocks by-a-hair and clears it"
      if (nextRun.pendingHair) {
        tryUnlock("by-a-hair");
        nextRun.pendingHair = false;
      }

      if (kind === "perfect") {
        nextRun.perfects += 1;
        nextRun.comboNow += 1;
        nextRun.bestComboRun = Math.max(nextRun.bestComboRun, nextRun.comboNow);

        tryUnlock("plumb-line");

        if (nextRun.comboNow >= 3) {
          tryUnlock("hat-trick");
        }
        if (nextRun.comboNow >= 8) {
          tryUnlock("level-headed");
        }

        // Perfect breaks same-side trim streak
        nextRun.sameSideTrimStreak = 0;
        nextRun.lastTrimSign = 0;
      } else {
        // kind === "trim"
        nextRun.comboNow = 0;
        if (floor <= 10) {
          nextRun.firstTenAllPerfect = false;
        }

        // Leaning Tower: 5 consecutive trimmed drops, all trimmed on the same side
        if (sign !== 0) {
          if (sign === nextRun.lastTrimSign) {
            nextRun.sameSideTrimStreak += 1;
          } else {
            nextRun.sameSideTrimStreak = 1;
            nextRun.lastTrimSign = sign;
          }
        } else {
          nextRun.sameSideTrimStreak = 0;
          nextRun.lastTrimSign = 0;
        }

        if (nextRun.sameSideTrimStreak >= 5) {
          tryUnlock("leaning-tower");
        }

        // Check if this trim arms pendingHair for the NEXT placement
        if (widthAfter < 0.35) {
          nextRun.pendingHair = true;
        } else {
          nextRun.pendingHair = false;
        }
      }

      // Flawless Ten check: the first 10 floors of a run are all perfect
      if (floor === 10 && nextRun.firstTenAllPerfect && nextRun.perfects >= 10) {
        tryUnlock("flawless-ten");
      }

      // Height achievements
      if (floor >= 10) {
        tryUnlock("mid-rise");
      }
      if (floor >= 20) {
        tryUnlock("high-rise");
      }
      if (floor >= 30) {
        tryUnlock("skyline");
      }
      if (floor >= 50) {
        tryUnlock("cloud-piercer");
      }
      break;
    }

    case "regrow": {
      nextRun.regrows += 1;
      tryUnlock("growth-spurt");
      break;
    }

    case "landmark": {
      if (!nextRun.landmarksCleared.includes(event.id)) {
        nextRun.landmarksCleared.push(event.id);
      }
      if (
        nextRun.landmarksCleared.includes("gateway") &&
        nextRun.landmarksCleared.includes("qutub")
      ) {
        tryUnlock("landmark-collector");
      }
      break;
    }

    case "gameover": {
      const { floors, hour } = event;
      nextRun.pendingHair = false;

      // Update lifetime stats
      nextLifetime.games += 1;
      nextLifetime.floorsTotal += floors;
      nextLifetime.bestFloors = Math.max(nextLifetime.bestFloors, floors);
      nextLifetime.bestCombo = Math.max(nextLifetime.bestCombo, nextRun.bestComboRun);

      // Secret 1: Lucky Seven (end a run on exactly 7 floors)
      if (floors === 7) {
        tryUnlock("lucky-seven");
      }

      // Secret 2: Night Shift (end a run with at least 5 floors between 00:00 and 04:59 local time)
      if (floors >= 5 && hour >= 0 && hour <= 4) {
        tryUnlock("night-shift");
      }

      // Reset run state for next game
      nextRun = createInitialRunState();
      break;
    }
  }

  // Meta achievement: Chartered Architect (unlock 10 other achievements)
  // After any unlock, if the number of unlocked ids other than chartered-architect is at least 10, unlock chartered-architect in the same call
  if (!nextUnlocked["chartered-architect"]) {
    const otherUnlockedCount = Object.keys(nextUnlocked).filter(
      (id) => id !== "chartered-architect"
    ).length;
    if (otherUnlockedCount >= 10) {
      tryUnlock("chartered-architect");
    }
  }

  return {
    state: {
      unlocked: nextUnlocked,
      lifetime: nextLifetime,
      run: nextRun,
    },
    unlockedNow: newlyUnlocked,
  };
}

/**
 * Returns progress { current, target } for count-based achievements, or null for boolean/secret ones
 */
export function progressFor(
  achievement: Achievement,
  state: AchievementState
): { current: number; target: number } | null {
  const currentFloors = state.run.floors > 0 ? state.run.floors : state.lifetime.bestFloors;

  switch (achievement.id) {
    case "mid-rise":
      return { current: Math.min(10, currentFloors), target: 10 };
    case "high-rise":
      return { current: Math.min(20, currentFloors), target: 20 };
    case "skyline":
      return { current: Math.min(30, currentFloors), target: 30 };
    case "cloud-piercer":
      return { current: Math.min(50, currentFloors), target: 50 };

    case "hat-trick": {
      const bestCombo = Math.max(state.run.bestComboRun, state.lifetime.bestCombo);
      return { current: Math.min(3, bestCombo), target: 3 };
    }
    case "level-headed": {
      const bestCombo = Math.max(state.run.bestComboRun, state.lifetime.bestCombo);
      return { current: Math.min(8, bestCombo), target: 8 };
    }

    case "flawless-ten": {
      const count = state.run.firstTenAllPerfect ? Math.min(10, state.run.perfects) : 0;
      return { current: count, target: 10 };
    }

    case "landmark-collector": {
      const cleared = ["gateway", "qutub"].filter((id) =>
        state.run.landmarksCleared.includes(id)
      ).length;
      return { current: cleared, target: 2 };
    }

    case "chartered-architect": {
      const count = Object.keys(state.unlocked).filter(
        (id) => id !== "chartered-architect"
      ).length;
      return { current: Math.min(10, count), target: 10 };
    }

    default:
      return null;
  }
}

/**
 * Next Goal: the locked non-secret achievement with progress available and the highest current/target ratio below 1;
 * if none, the first locked non-secret achievement; if all unlocked, null.
 */
export function nextGoal(state: AchievementState): Achievement | null {
  const lockedNonSecrets = ACHIEVEMENTS.filter(
    (a) => !state.unlocked[a.id] && !a.secret
  );

  if (lockedNonSecrets.length === 0) {
    return null;
  }

  let bestCandidate: Achievement | null = null;
  let bestRatio = -1;

  for (const ach of lockedNonSecrets) {
    const prog = progressFor(ach, state);
    if (prog && prog.target > 0) {
      const ratio = prog.current / prog.target;
      if (ratio < 1 && ratio > bestRatio) {
        bestRatio = ratio;
        bestCandidate = ach;
      }
    }
  }

  if (bestCandidate) {
    return bestCandidate;
  }

  return lockedNonSecrets[0];
}
