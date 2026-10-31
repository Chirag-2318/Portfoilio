/**
 * Topping Out V2 — Color Palettes & Block Shading
 */

export type PaletteId = "rainbow" | "dusk" | "mint" | "mono" | "gold" | "copper";

export interface PaletteMeta {
  id: PaletteId;
  name: string;
  unlockThreshold?: number;
  requiredAchievement?: string;
  unlockHint?: string;
  previewHue: number;
}

export const PALETTES: PaletteMeta[] = [
  { id: "rainbow", name: "Rainbow", unlockThreshold: 0, previewHue: 30 },
  { id: "dusk", name: "Dusk", unlockThreshold: 10, previewHue: 300 },
  { id: "mint", name: "Mint", unlockThreshold: 20, previewHue: 175 },
  { id: "mono", name: "Mono", unlockThreshold: 30, previewHue: 14 },
  {
    id: "gold",
    name: "Gold Hour",
    requiredAchievement: "skyline",
    unlockHint: "Unlock Skyline (30 floors)",
    previewHue: 38,
  },
  {
    id: "copper",
    name: "Copper",
    requiredAchievement: "chartered-architect",
    unlockHint: "Unlock Chartered Architect",
    previewHue: 16,
  },
];

export function isPaletteUnlocked(
  palette: PaletteId,
  bestScore: number = 0,
  unlockedAchievements?: Record<string, number>
): boolean {
  const meta = PALETTES.find((p) => p.id === palette);
  if (!meta) return false;
  if (meta.requiredAchievement) {
    return Boolean(unlockedAchievements && unlockedAchievements[meta.requiredAchievement]);
  }
  return bestScore >= (meta.unlockThreshold ?? 0);
}

export interface BlockColors {
  top: string;
  left: string;
  right: string;
  edge: string;
  windowDark: string;
  windowLit: string;
  highlight: string;
}

export function blockColors(floorIndex: number, palette: PaletteId = "rainbow"): BlockColors {
  const windowLit = "#ffe9a8";

  switch (palette) {
    case "rainbow": {
      const hue = Math.round((floorIndex * 13 + 8) % 360);
      return {
        top: `hsl(${hue}, 72%, 66%)`,
        left: `hsl(${hue}, 70%, 56%)`,
        right: `hsl(${hue}, 68%, 44%)`,
        edge: `hsl(${hue}, 60%, 28%)`,
        windowDark: `hsl(${hue}, 55%, 24%)`,
        windowLit,
        highlight: `hsla(${hue}, 80%, 80%, 0.6)`,
      };
    }

    case "dusk": {
      const hue = Math.round((300 + floorIndex * 9) % 360);
      return {
        top: `hsl(${hue}, 65%, 66%)`,
        left: `hsl(${hue}, 65%, 54%)`,
        right: `hsl(${hue}, 65%, 42%)`,
        edge: `hsl(${hue}, 55%, 26%)`,
        windowDark: `hsl(${hue}, 50%, 22%)`,
        windowLit,
        highlight: `hsla(${hue}, 80%, 80%, 0.6)`,
      };
    }

    case "mint": {
      const rawHue = 175 + 25 * Math.sin(floorIndex * 0.35);
      const hue = Math.round(((rawHue % 360) + 360) % 360);
      return {
        top: `hsl(${hue}, 60%, 68%)`,
        left: `hsl(${hue}, 60%, 56%)`,
        right: `hsl(${hue}, 60%, 44%)`,
        edge: `hsl(${hue}, 50%, 26%)`,
        windowDark: `hsl(${hue}, 45%, 22%)`,
        windowLit,
        highlight: `hsla(${hue}, 80%, 80%, 0.6)`,
      };
    }

    case "mono": {
      // Every 10th floor is accent (#ff5a2c), others are neutral zinc
      if (floorIndex > 0 && floorIndex % 10 === 0) {
        return {
          top: "hsl(14, 100%, 63%)",
          left: "hsl(14, 100%, 58%)",
          right: "hsl(14, 82%, 46%)",
          edge: "hsl(14, 80%, 28%)",
          windowDark: "hsl(14, 70%, 18%)",
          windowLit,
          highlight: "hsla(14, 85%, 85%, 0.7)",
        };
      }
      return {
        top: "#a1a1aa",
        left: "#71717a",
        right: "#52525b",
        edge: "#27272a",
        windowDark: "#3f3f46",
        windowLit,
        highlight: "rgba(255, 255, 255, 0.4)",
      };
    }

    case "gold": {
      const rawHue = 38 + 8 * Math.sin(floorIndex * 0.3);
      const hue = Math.round(((rawHue % 360) + 360) % 360);
      return {
        top: `hsl(${hue}, 78%, 70%)`,
        left: `hsl(${hue}, 78%, 60%)`,
        right: `hsl(${hue}, 78%, 48%)`,
        edge: `hsl(${hue}, 78%, 30%)`,
        windowDark: `hsl(${hue}, 45%, 22%)`,
        windowLit,
        highlight: `hsla(${hue}, 80%, 80%, 0.6)`,
      };
    }

    case "copper": {
      const rawHue = 16 + 10 * Math.sin(floorIndex * 0.25);
      const hue = Math.round(((rawHue % 360) + 360) % 360);
      return {
        top: `hsl(${hue}, 62%, 70%)`,
        left: `hsl(${hue}, 62%, 60%)`,
        right: `hsl(${hue}, 62%, 48%)`,
        edge: `hsl(${hue}, 62%, 30%)`,
        windowDark: `hsl(${hue}, 45%, 22%)`,
        windowLit,
        highlight: `hsla(${hue}, 80%, 80%, 0.6)`,
      };
    }
  }
}

