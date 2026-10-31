/**
 * Canvas Isometric Renderer for Topping Out
 * Strictly native to the Blueprint Grid visual aesthetic.
 */

import { GAME_CONSTANTS } from "./constants";
import type { Slab, MovingSlab, Debris, FallingSlab } from "./engine";

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
  private hatchPatternCanvas: HTMLCanvasElement | null = null;
  private hatchPattern: CanvasPattern | null = null;
  private hatchColor = "";

  constructor() {
    this.colors = readThemeColors();
  }

  public updateTheme() {
    this.colors = readThemeColors();
    this.hatchPattern = null; // force pattern rebuild
  }

  private getHatchPattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
    if (this.hatchPattern && this.hatchColor === this.colors.foreground) {
      return this.hatchPattern;
    }

    if (typeof document === "undefined") return null;

    if (!this.hatchPatternCanvas) {
      this.hatchPatternCanvas = document.createElement("canvas");
    }
    const size = 10;
    this.hatchPatternCanvas.width = size;
    this.hatchPatternCanvas.height = size;
    const pctx = this.hatchPatternCanvas.getContext("2d");
    if (!pctx) return null;

    pctx.clearRect(0, 0, size, size);
    pctx.strokeStyle = this.colors.foreground;
    pctx.globalAlpha = 0.3;
    pctx.lineWidth = 1;

    // 45 degree hatching
    pctx.beginPath();
    pctx.moveTo(0, size);
    pctx.lineTo(size, 0);
    pctx.moveTo(-size / 2, size / 2);
    pctx.lineTo(size / 2, -size / 2);
    pctx.moveTo(size / 2, size * 1.5);
    pctx.lineTo(size * 1.5, size / 2);
    pctx.stroke();

    this.hatchColor = this.colors.foreground;
    this.hatchPattern = ctx.createPattern(this.hatchPatternCanvas, "repeat");
    return this.hatchPattern;
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
    const originX = width / 2;
    const originY = height * GAME_CONSTANTS.ORIGIN_Y_RATIO + cameraShift;
    const cos30 = 0.86602540378; // Math.cos(Math.PI / 6)
    const sin30 = 0.5; // Math.sin(Math.PI / 6)

    const px = originX + (x - z) * cos30 * scale;
    const py = originY + (x + z) * sin30 * scale - y * scale;
    return { px, py };
  }

  /**
   * Draw isometric dot grid background with subtle camera parallax
   */
  public drawDotGrid(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scale: number,
    cameraShift: number
  ) {
    const spacing = 28;
    const parallaxY = (cameraShift * 0.4) % spacing;

    ctx.save();
    ctx.fillStyle = this.colors.line;
    ctx.globalAlpha = 0.5;

    const startY = -spacing + parallaxY;
    for (let y = startY; y < height + spacing; y += spacing) {
      for (let x = 0; x < width + spacing; x += spacing) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
    ctx.restore();
  }

  /**
   * Draw single isometric box (slab)
   */
  public drawBox(
    ctx: CanvasRenderingContext2D,
    box: {
      x0: number;
      x1: number;
      z0: number;
      z1: number;
      y0: number;
      y1: number;
      accentOutline?: boolean;
      label10F?: string;
    },
    width: number,
    height: number,
    scale: number,
    cameraShift: number,
    alpha = 1.0
  ) {
    const { x0, x1, z0, z1, y0, y1, accentOutline, label10F } = box;

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
    if (maxY < -50 || minY > height + 50) {
      return; // culled
    }

    ctx.save();
    ctx.lineJoin = "round";

    // 1. RIGHT FACE (x = x1)
    // Points: p100, p101, p111, p110
    ctx.beginPath();
    ctx.moveTo(p100.px, p100.py);
    ctx.lineTo(p101.px, p101.py);
    ctx.lineTo(p111.px, p111.py);
    ctx.lineTo(p110.px, p110.py);
    ctx.closePath();

    ctx.fillStyle = this.colors.foreground;
    ctx.globalAlpha = 0.03 * alpha;
    ctx.fill();

    ctx.strokeStyle = this.colors.foreground;
    ctx.globalAlpha = 0.85 * alpha;
    ctx.lineWidth = 1;
    ctx.stroke();

    // 2. LEFT FACE (z = z1)
    // Points: p001, p101, p111, p011
    ctx.beginPath();
    ctx.moveTo(p001.px, p001.py);
    ctx.lineTo(p101.px, p101.py);
    ctx.lineTo(p111.px, p111.py);
    ctx.lineTo(p011.px, p011.py);
    ctx.closePath();

    ctx.fillStyle = this.colors.foreground;
    ctx.globalAlpha = 0.08 * alpha;
    ctx.fill();

    ctx.strokeStyle = this.colors.foreground;
    ctx.globalAlpha = 0.85 * alpha;
    ctx.lineWidth = 1;
    ctx.stroke();

    // 3. TOP FACE
    // Points: p010, p110, p111, p011
    ctx.beginPath();
    ctx.moveTo(p010.px, p010.py);
    ctx.lineTo(p110.px, p110.py);
    ctx.lineTo(p111.px, p111.py);
    ctx.lineTo(p011.px, p011.py);
    ctx.closePath();

    ctx.fillStyle = this.colors.foreground;
    ctx.globalAlpha = 0.14 * alpha;
    ctx.fill();

    // Diagonal hatching inside top face
    const hatch = this.getHatchPattern(ctx);
    if (hatch) {
      ctx.save();
      ctx.clip();
      ctx.fillStyle = hatch;
      ctx.globalAlpha = 0.9 * alpha;
      ctx.fill();
      ctx.restore();
    }

    // Top face outline
    if (accentOutline) {
      ctx.strokeStyle = this.colors.accent;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 1.0 * alpha;
      ctx.stroke();
    } else {
      ctx.strokeStyle = this.colors.foreground;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.85 * alpha;
      ctx.stroke();
    }

    // Optional milestone label for 10F, 20F with leader line
    if (label10F) {
      ctx.save();
      ctx.strokeStyle = this.colors.accent;
      ctx.fillStyle = this.colors.accent;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 1.0 * alpha;

      const rightEdgeX = p111.px;
      const rightEdgeY = p111.py;

      // Small leader line
      ctx.beginPath();
      ctx.moveTo(rightEdgeX + 4, rightEdgeY);
      ctx.lineTo(rightEdgeX + 20, rightEdgeY);
      ctx.stroke();

      ctx.font = '10px "Geist Mono", monospace';
      ctx.textBaseline = "middle";
      ctx.fillText(label10F, rightEdgeX + 24, rightEdgeY);
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Draw left-edge height gauge with ticks and metre labels
   */
  public drawHeightGauge(
    ctx: CanvasRenderingContext2D,
    height: number,
    scale: number,
    cameraShift: number,
    floors: number
  ) {
    const originY = height * GAME_CONSTANTS.ORIGIN_Y_RATIO + cameraShift;
    const rulerX = 22;

    ctx.save();
    ctx.font = '9px "Geist Mono", monospace';
    ctx.textBaseline = "middle";

    const maxFloorToDraw = floors + 6;
    for (let f = 1; f <= maxFloorToDraw; f++) {
      const yWorld = f * GAME_CONSTANTS.SLAB_HEIGHT;
      const py = originY - yWorld * scale;

      if (py < -30 || py > height + 30) continue;

      const isFive = f % 5 === 0;
      const tickLength = isFive ? 10 : 4;

      ctx.strokeStyle = isFive ? this.colors.lineStrong : this.colors.dimension;
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(rulerX, py);
      ctx.lineTo(rulerX + tickLength, py);
      ctx.stroke();

      if (isFive) {
        ctx.fillStyle = this.colors.dimensionForeground;
        ctx.fillText(`${f * GAME_CONSTANTS.METRES_PER_FLOOR} m`, rulerX + tickLength + 4, py);
      }
    }

    // Ruler baseline
    ctx.strokeStyle = this.colors.line;
    ctx.beginPath();
    ctx.moveTo(rulerX, 0);
    ctx.lineTo(rulerX, height);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draw CAD dimension line above the moving slab
   */
  public drawDimensionLine(
    ctx: CanvasRenderingContext2D,
    moving: MovingSlab,
    width: number,
    height: number,
    scale: number,
    cameraShift: number,
    isAccent: boolean
  ) {
    const x0 = moving.x - moving.w / 2;
    const x1 = moving.x + moving.w / 2;
    const z0 = moving.z - moving.d / 2;
    const z1 = moving.z + moving.d / 2;
    const dimY = moving.y1 + 0.35; // slightly above

    const proj = (x: number, y: number, z: number) =>
      this.project(x, y, z, width, height, scale, cameraShift);

    let pStart: { px: number; py: number };
    let pEnd: { px: number; py: number };
    const val = moving.axis === "x" ? moving.w : moving.d;
    const axisLabel = moving.axis === "x" ? "w" : "d";
    const label = `${axisLabel} ${val.toFixed(2)}`;

    if (moving.axis === "x") {
      pStart = proj(x0, dimY, moving.z);
      pEnd = proj(x1, dimY, moving.z);
    } else {
      pStart = proj(moving.x, dimY, z0);
      pEnd = proj(moving.x, dimY, z1);
    }

    const midX = (pStart.px + pEnd.px) / 2;
    const midY = (pStart.py + pEnd.py) / 2;

    ctx.save();
    const color = isAccent ? this.colors.accent : this.colors.dimension;
    const textColor = isAccent ? this.colors.accent : this.colors.dimensionForeground;

    ctx.strokeStyle = color;
    ctx.fillStyle = textColor;
    ctx.lineWidth = 1;
    ctx.font = '10px "Geist Mono", monospace';
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    // Extension lines
    const pStartLow = proj(
      moving.axis === "x" ? x0 : moving.x,
      moving.y1 + 0.05,
      moving.axis === "x" ? moving.z : z0
    );
    const pEndLow = proj(
      moving.axis === "x" ? x1 : moving.x,
      moving.y1 + 0.05,
      moving.axis === "x" ? moving.z : z1
    );

    ctx.beginPath();
    ctx.moveTo(pStartLow.px, pStartLow.py);
    ctx.lineTo(pStart.px, pStart.py);
    ctx.moveTo(pEndLow.px, pEndLow.py);
    ctx.lineTo(pEnd.px, pEnd.py);
    ctx.stroke();

    // Dimension line
    ctx.beginPath();
    ctx.moveTo(pStart.px, pStart.py);
    ctx.lineTo(pEnd.px, pEnd.py);
    ctx.stroke();

    // Label with background cutout
    const textWidth = ctx.measureText(label).width;
    ctx.fillStyle = this.colors.background;
    ctx.fillRect(midX - textWidth / 2 - 3, midY - 6, textWidth + 6, 12);

    ctx.fillStyle = textColor;
    ctx.fillText(label, midX, midY);

    ctx.restore();
  }

  /**
   * Draw expanding diamond ripple for perfect landing
   */
  public drawPerfectRipple(ctx: CanvasRenderingContext2D, ripple: PerfectRipple) {
    const progress = ripple.elapsed / ripple.duration;
    if (progress >= 1) return;

    const scale = 1.0 + progress * 0.35;
    const alpha = (1.0 - progress) * 0.8;

    ctx.save();
    ctx.strokeStyle = this.colors.accent;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = alpha;

    ctx.beginPath();
    for (let i = 0; i < ripple.points.length; i++) {
      const pt = ripple.points[i];
      const rx = ripple.centre.px + (pt.px - ripple.centre.px) * scale;
      const ry = ripple.centre.py + (pt.py - ripple.centre.py) * scale;
      if (i === 0) {
        ctx.moveTo(rx, ry);
      } else {
        ctx.lineTo(rx, ry);
      }
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Draw floating text (e.g. "Perfect!", "Perfect x3", "REGROW!")
   */
  public drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (const item of texts) {
      const progress = item.elapsed / item.duration;
      const currentY = item.y - progress * 36;
      const alpha = (1 - progress) * item.alpha;

      ctx.font = '28px "Caveat", cursive';
      ctx.fillStyle = this.colors.accent;
      ctx.globalAlpha = alpha;
      ctx.fillText(item.text, item.x, currentY);
    }
    ctx.restore();
  }

  /**
   * Draw landing dust particles
   */
  public drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    ctx.save();
    ctx.fillStyle = this.colors.foreground;

    for (const p of particles) {
      const progress = p.elapsed / p.duration;
      const alpha = (1 - progress) * 0.6;
      ctx.globalAlpha = alpha;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.restore();
  }

  /**
   * Draw milestone note in Caveat with hand-drawn SVG-like arrow
   */
  public drawMilestoneNote(
    ctx: CanvasRenderingContext2D,
    note: ActiveMilestone,
    width: number
  ) {
    const progress = note.elapsed / note.duration;
    if (progress >= 1) return;

    const alpha = progress < 0.2 ? progress / 0.2 : progress > 0.8 ? (1 - progress) / 0.2 : 1.0;

    const noteX = width - 40;
    const noteY = Math.max(80, note.targetY - 20);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = '22px "Caveat", cursive';
    ctx.fillStyle = this.colors.accent;
    ctx.strokeStyle = this.colors.accent;
    ctx.textAlign = "right";

    ctx.fillText(note.text, noteX, noteY);

    // Hand-drawn arrow curving to the left towards the tower
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(noteX - ctx.measureText(note.text).width - 8, noteY - 2);
    ctx.quadraticCurveTo(noteX - 140, noteY + 10, noteX - 160, noteY + 24);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(noteX - 160, noteY + 24);
    ctx.lineTo(noteX - 150, noteY + 20);
    ctx.moveTo(noteX - 160, noteY + 24);
    ctx.lineTo(noteX - 154, noteY + 32);
    ctx.stroke();

    ctx.restore();
  }
}

