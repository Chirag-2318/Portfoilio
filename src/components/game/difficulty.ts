export interface DifficultySettings {
  time: number;
  tolerance: number;
  wander: number;
}

export function difficulty(prints: number): DifficultySettings {
  return {
    time: Math.max(7, 12 - 0.3 * prints),
    tolerance: Math.max(5, 14 - 0.6 * prints),
    wander: 260 * (1 + 0.04 * prints),
  };
}

