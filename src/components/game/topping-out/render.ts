/**
 * Canvas Isometric Renderer for Topping Out (V2)
 * Features solid realistic blocks, dynamic crane, landmarks, confetti, and flags.
 */

import { GAME_CONSTANTS } from "./constants";
import type { Slab, MovingSlab, Debris, FallingSlab } from "./engine";
import { blockColors, type BlockColors, type PaletteId } from "./palettes";
import { LANDMARK_LIST, type Landmark } from "./landmarks";

export interface ThemeColors {
  background: string;
  foreground: string;
  mutedForeground: string;
  line: string;
  lineStrong: string;
  dimension: string;
  dimensionForeground: string;
  accent: string;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  alpha: number;
  elapsed: number;
  duration: number;
  isCaveat?: boolean;
  color?: string;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  elapsed: number;
  duration: number;
}

export interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  w: number;
  h: number;
  color: string;
  alpha: number;
  elapsed: number;
  duration: number;
}

export interface PerfectRipple {
  id: number;
  points: { px: number; py: number }[];
  centre: { px: number; py: number };
  elapsed: number;
  duration: number;
}

export interface ActiveMilestone {
  text: string;
  targetY: number;
  elapsed: number;
  duration: number;
}

export function readThemeColors(): ThemeColors {
  if (typeof window === "undefined") {
    return {
      background: "#09090b",
      foreground: "#fafafa",
      mutedForeground: "#a1a1aa",
      line: "#1c1c1f",
      lineStrong: "#2a2a2f",
      dimension: "#3a3a40",
      dimensionForeground: "#6b6b75",
      accent: "#ff5a2c",
    };
  }

  const style = getComputedStyle(document.documentElement);
  const get = (prop: string, fallback: string) => style.getPropertyValue(prop).trim() || fallback;

  return {
    background: get("--background", "#09090b"),
    foreground: get("--foreground", "#fafafa"),
    mutedForeground: get("--muted-foreground", "#a1a1aa"),
    line: get("--line", "#1c1c1f"),
    lineStrong: get("--line-strong", "#2a2a2f"),
    dimension: get("--dimension", "#3a3a40"),
    dimensionForeground: get("--dimension-foreground", "#6b6b75"),
    accent: get("--accent", "#ff5a2c"),
  };
}

export class ToppingOutRenderer {
  public colors: ThemeColors;

  constructor() {
    this.colors = readThemeColors();
  }

  public updateTheme() {
    this.colors = readThemeColors();
  }

  public getScale(canvasWidth: number): number {
    return Math.max(
      GAME_CONSTANTS.SCALE_MIN,
      Math.min(canvasWidth * GAME_CONSTANTS.SCALE_FACTOR, GAME_CONSTANTS.SCALE_MAX)
    );
  }

  public project(
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    scale: number,
    cameraShift: number
  ): { px: number; py: number } {
    let originX = width / 2;
    if (GAME_CONSTANTS.ANCHOR === "gutter" && width >= 1100) {
      // Place in right gutter outside 768px center column
      const columnRight = (width + 768) / 2;
      originX = (columnRight + width) / 2;
    }

    const originY = height * GAME_CONSTANTS.ORIGIN_Y_RATIO + cameraShift;
    const cos30 = 0.86602540378; // Math.cos(Math.PI / 6)
    const sin30 = 0.5; // Math.sin(Math.PI / 6)

    const px = originX + (x - z) * cos30 * scale;
    const py = originY + (x + z) * sin30 * scale - y * scale;
    return { px, py };
  }

  /**
   * Draw solid ground platform (6 x 6 units, height 0.6)
   */
  public drawGroundPlatform(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scale: number,
    cameraShift: number
  ) {
    const halfW = GAME_CONSTANTS.GROUND_WIDTH / 2;
    const halfD = GAME_CONSTANTS.GROUND_DEPTH / 2;
    const groundH = GAME_CONSTANTS.GROUND_HEIGHT;

    this.drawSolidBox(
      ctx,
      {
        x0: -halfW,
        x1: halfW,
        z0: -halfD,
        z1: halfD,
        y0: -groundH,
        y1: 0,
        colors: {
          top: "#d4d4d8",
          left: "#a1a1aa",
          right: "#71717a",
          edge: "#3f3f46",
          windowDark: "#a1a1aa",
          windowLit: "#d4d4d8",
          highlight: "rgba(255, 255, 255, 0.4)",
        },
        hasWindows: false,
        groundLabel: "GROUND",
      },
      width,
      height,
      scale,
      cameraShift
    );
  }

  /**
   * Draw solid, opaque isometric box (slab) with windows and bevel
   */
  public drawSolidBox(
    ctx: CanvasRenderingContext2D,
    box: {
      x0: number;
      x1: number;
      z0: number;
      z1: number;
      y0: number;
      y1: number;
      colors: BlockColors;
      hasWindows?: boolean;
      floorIndex?: number;
      accentOutline?: boolean;
      groundLabel?: string;
    },
    width: number,
    height: number,
    scale: number,
    cameraShift: number,
    alpha = 1.0
  ) {
    const { x0, x1, z0, z1, y0, y1, colors, hasWindows = true, floorIndex = 0, accentOutline, groundLabel } = box;

    const proj = (x: number, y: number, z: number) =>
      this.project(x, y, z, width, height, scale, cameraShift);

    // 8 box vertices
    const p000 = proj(x0, y0, z0);
    const p100 = proj(x1, y0, z0);
    const p101 = proj(x1, y0, z1);
    const p001 = proj(x0, y0, z1);

    const p010 = proj(x0, y1, z0);
    const p110 = proj(x1, y1, z0);
    const p111 = proj(x1, y1, z1);
    const p011 = proj(x0, y1, z1);

    // Bounding culling check
    const minY = Math.min(p010.py, p110.py, p011.py, p111.py);
    const maxY = Math.max(p000.py, p100.py, p001.py, p101.py);
    if (maxY < -80 || minY > height + 80) {
      return; // culled
    }

    ctx.save();
    ctx.lineJoin = "round";
    ctx.globalAlpha = alpha;

    // 1. RIGHT FACE (x = x1)
    ctx.beginPath();
    ctx.moveTo(p100.px, p100.py);
    ctx.lineTo(p101.px, p101.py);
    ctx.lineTo(p111.px, p111.py);
    ctx.lineTo(p110.px, p110.py);
    ctx.closePath();
    ctx.fillStyle = colors.right;
    ctx.fill();

    ctx.strokeStyle = colors.edge;
    ctx.lineWidth = 1.25;
    ctx.stroke();

    // 2. LEFT FACE (z = z1)
    ctx.beginPath();
    ctx.moveTo(p001.px, p001.py);
    ctx.lineTo(p101.px, p101.py);
    ctx.lineTo(p111.px, p111.py);
    ctx.lineTo(p011.px, p011.py);
    ctx.closePath();
    ctx.fillStyle = colors.left;
    ctx.fill();

    ctx.strokeStyle = colors.edge;
    ctx.lineWidth = 1.25;
    ctx.stroke();

    // Windows on faces (if slab has sufficient width/depth)
    if (hasWindows) {
      const faceW = x1 - x0;
      const faceD = z1 - z0;
      const yMid = (y0 + y1) / 2;
      const winW = GAME_CONSTANTS.WINDOW_WIDTH;
      const winH = GAME_CONSTANTS.WINDOW_HEIGHT;
      const yBot = yMid - winH / 2;
      const yTop = yMid + winH / 2;

      // Windows on Left Face (z = z1)
      if (faceW >= GAME_CONSTANTS.WINDOW_MIN_FACE_WIDTH) {
        const numWins = faceW >= 1.6 ? 3 : 2;
        const spacing = faceW / (numWins + 1);
        for (let k = 0; k < numWins; k++) {
          const winCenter = x0 + (k + 1) * spacing;
          const wx0 = winCenter - winW / 2;
          const wx1 = winCenter + winW / 2;
          const isLit = ((floorIndex * 17 + k * 19) % 10) < 4;

          const wp0 = proj(wx0, yBot, z1);
          const wp1 = proj(wx1, yBot, z1);
          const wp2 = proj(wx1, yTop, z1);
          const wp3 = proj(wx0, yTop, z1);

          ctx.beginPath();
          ctx.moveTo(wp0.px, wp0.py);
          ctx.lineTo(wp1.px, wp1.py);
          ctx.lineTo(wp2.px, wp2.py);
          ctx.lineTo(wp3.px, wp3.py);
          ctx.closePath();
          ctx.fillStyle = isLit ? colors.windowLit : colors.windowDark;
          ctx.fill();
        }
      }

      // Windows on Right Face (x = x1)
      if (faceD >= GAME_CONSTANTS.WINDOW_MIN_FACE_WIDTH) {
        const numWins = faceD >= 1.6 ? 3 : 2;
        const spacing = faceD / (numWins + 1);
        for (let k = 0; k < numWins; k++) {
          const winCenter = z0 + (k + 1) * spacing;
          const wz0 = winCenter - winW / 2;
          const wz1 = winCenter + winW / 2;
          const isLit = ((floorIndex * 23 + k * 31 + 7) % 10) < 4;

          const wp0 = proj(x1, yBot, wz0);
          const wp1 = proj(x1, yBot, wz1);
          const wp2 = proj(x1, yTop, wz1);
          const wp3 = proj(x1, yTop, wz0);

          ctx.beginPath();
          ctx.moveTo(wp0.px, wp0.py);
          ctx.lineTo(wp1.px, wp1.py);
          ctx.lineTo(wp2.px, wp2.py);
          ctx.lineTo(wp3.px, wp3.py);
          ctx.closePath();
          ctx.fillStyle = isLit ? colors.windowLit : colors.windowDark;
          ctx.fill();
        }
      }
    }

    // Ground label on left face
    if (groundLabel) {
      const gMid = proj(0, (y0 + y1) / 2, z1);
      ctx.save();
      ctx.font = "500 10px monospace";
      ctx.fillStyle = "#3f3f46";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(groundLabel, gMid.px, gMid.py);
      ctx.restore();
    }

    // 3. TOP FACE (y = y1)
    ctx.beginPath();
    ctx.moveTo(p010.px, p010.py);
    ctx.lineTo(p110.px, p110.py);
    ctx.lineTo(p111.px, p111.py);
    ctx.lineTo(p011.px, p011.py);
    ctx.closePath();
    ctx.fillStyle = colors.top;
    ctx.fill();

    ctx.strokeStyle = colors.edge;
    ctx.lineWidth = 1.25;
    ctx.stroke();

    // 4. Front-top bevel highlight lines
    ctx.beginPath();
    // Edge between Left and Top face (p011 to p111)
    ctx.moveTo(p011.px, p011.py);
    ctx.lineTo(p111.px, p111.py);
    // Edge between Right and Top face (p111 to p110)
    ctx.lineTo(p110.px, p110.py);
    ctx.strokeStyle = colors.highlight;
    ctx.lineWidth = 1;
    ctx.stroke();

    // 5. Streak Halo (2px accent outline on active landing combo)
    if (accentOutline) {
      ctx.beginPath();
      ctx.moveTo(p010.px, p010.py);
      ctx.lineTo(p110.px, p110.py);
      ctx.lineTo(p111.px, p111.py);
      ctx.lineTo(p011.px, p011.py);
      ctx.closePath();
      ctx.strokeStyle = this.colors.accent;
      ctx.lineWidth = 2.0;
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Draw the crane hanging the moving slab
   */
  public drawCrane(
    ctx: CanvasRenderingContext2D,
    moving: MovingSlab,
    retractProgress: number,
    time: number,
    width: number,
    height: number,
    scale: number,
    cameraShift: number,
    reducedMotion = false
  ) {
    const topCenter = this.project(moving.x, moving.y1, moving.z, width, height, scale, cameraShift);

    // Retraction shifts the hook upward towards top of viewport
    let hookY = topCenter.py - 6;
    if (retractProgress > 0) {
      hookY = topCenter.py - 6 - retractProgress * (topCenter.py - 6);
    }

    const sway = reducedMotion ? 0 : Math.sin(time * 2.5) * GAME_CONSTANTS.CRANE_SWAY_AMOUNT;
    const hookX = topCenter.px + sway;

    ctx.save();
    // 1.5px vertical line from top of viewport
    ctx.beginPath();
    ctx.moveTo(hookX, 0);
    ctx.lineTo(hookX, Math.max(0, hookY - 8));
    ctx.strokeStyle = this.colors.foreground;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Small solid hook: 10 x 8 px rectangle with 2px darker edge
    if (hookY > 0) {
      const hw = 10;
      const hh = 8;
      ctx.fillStyle = this.colors.foreground;
      ctx.globalAlpha = 0.95;
      ctx.fillRect(hookX - hw / 2, hookY - hh, hw, hh);

      ctx.strokeStyle = this.colors.lineStrong;
      ctx.lineWidth = 2;
      ctx.strokeRect(hookX - hw / 2, hookY - hh, hw, hh);
    }
    ctx.restore();
  }

  /**
   * Draw landmark horizontal dashed comparison lines
   */
  public drawLandmarks(
    ctx: CanvasRenderingContext2D,
    towerFloors: number,
    width: number,
    height: number,
    scale: number,
    cameraShift: number
  ) {
    const currentMetres = towerFloors * GAME_CONSTANTS.METRES_PER_FLOOR;
    const originY = height * GAME_CONSTANTS.ORIGIN_Y_RATIO + cameraShift;

    ctx.save();
    ctx.font = "500 11px monospace";
    ctx.textBaseline = "bottom";

    for (const lm of LANDMARK_LIST) {
      // World Y: height in metres -> world units
      const worldY = (lm.metres / GAME_CONSTANTS.METRES_PER_FLOOR) * GAME_CONSTANTS.SLAB_HEIGHT;
      const py = originY - worldY * scale;

      // Only draw if in viewport
      if (py < -30 || py > height + 30) continue;

      const isCleared = currentMetres >= lm.metres;

      // Horizontal dashed line across full viewport
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.strokeStyle = isCleared ? this.colors.accent : this.colors.lineStrong;
      ctx.globalAlpha = isCleared ? 0.65 : 0.35;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label at left edge
      ctx.setLineDash([]);
      ctx.globalAlpha = isCleared ? 1.0 : 0.75;
      ctx.fillStyle = isCleared ? this.colors.accent : this.colors.mutedForeground;
      const label = `${isCleared ? "✓ " : ""}${lm.metres} m  ${lm.name}`;
      ctx.fillText(label, 16, py - 4);
    }
    ctx.restore();
  }

  /**
   * Draw topping-out flag on milestone slabs (floor 10, 20, 30...)
   */
  public drawFlag(
    ctx: CanvasRenderingContext2D,
    slab: Slab,
    time: number,
    width: number,
    height: number,
    scale: number,
    cameraShift: number,
    reducedMotion = false
  ) {
    const topProj = this.project(slab.x, slab.y1, slab.z, width, height, scale, cameraShift);
    const poleH = 16;
    const flagW = 12;
    const flagH = 8;

    ctx.save();
    // Pole: 1.5px line
    ctx.beginPath();
    ctx.moveTo(topProj.px, topProj.py);
    ctx.lineTo(topProj.px, topProj.py - poleH);
    ctx.strokeStyle = this.colors.foreground;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Solid accent flag rectangle with wave
    const wave = reducedMotion ? 0 : Math.sin(time * 6 + slab.id) * 2;
    ctx.beginPath();
    ctx.moveTo(topProj.px, topProj.py - poleH);
    ctx.lineTo(topProj.px + flagW, topProj.py - poleH + wave);
    ctx.lineTo(topProj.px + flagW, topProj.py - poleH + flagH + wave);
    ctx.lineTo(topProj.px, topProj.py - poleH + flagH);
    ctx.closePath();
    ctx.fillStyle = this.colors.accent;
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draw confetti burst particles
   */
  public drawConfetti(ctx: CanvasRenderingContext2D, confetti: ConfettiParticle[]) {
    ctx.save();
    for (const c of confetti) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.fillStyle = c.color;
      ctx.globalAlpha = c.alpha;
      ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      ctx.restore();
    }
    ctx.restore();
  }

  /**
   * Draw floating score/status texts and Caveat celebration notes
   */
  public drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]) {
    ctx.save();
    for (const t of texts) {
      ctx.save();
      ctx.globalAlpha = t.alpha;

      if (t.isCaveat) {
        ctx.font = "600 22px var(--font-caveat), cursive";
        ctx.fillStyle = t.color || this.colors.accent;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(t.text, t.x, t.y);
      } else {
        ctx.font = "500 13px monospace";
        ctx.fillStyle = t.color || this.colors.foreground;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(t.text, t.x, t.y);
      }
      ctx.restore();
    }
    ctx.restore();
  }
}
