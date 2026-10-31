import { SHAPES, type GameShape } from "./shapes";
import { difficulty, type DifficultySettings } from "./difficulty";

export type GameState = "intro" | "playing" | "paused" | "over";

export interface EngineCallbacks {
  onSheetsChange: (sheets: number) => void;
  onPrintsChange: (prints: number) => void;
  onBestChange: (best: number) => void;
  onStatus: (text: string, durationMs: number) => void;
  onGameOver: (prints: number, best: number, isNewBest: boolean) => void;
  onStateChange: (state: GameState) => void;
}

export interface EngineColors {
  paper: string;
  ink: string;
  ink2: string;
  ink3: string;
  accent: string;
  isDark: boolean;
}

export class RegistrationEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private timerLineEl: HTMLElement | null = null;
  private callbacks: EngineCallbacks;
  private getReducedMotion: () => boolean;

  // Observers & Listeners
  private resizeObserver: ResizeObserver | null = null;
  private themeObserver: MutationObserver | null = null;
  private rafId: number | null = null;
  private lastTimestamp: number = 0;

  // Canvas geometry
  private width: number = 0;
  private height: number = 0;
  private dpr: number = 1;

  // Colors
  private colors: EngineColors = {
    paper: "#F3F0E8",
    ink: "#15140F",
    ink2: "#55514A",
    ink3: "#7A756B",
    accent: "#C8321A",
    isDark: false,
  };

  // Cached Path2D objects
  private pathCache: Map<string, Path2D> = new Map();

  // Game state
  public state: GameState = "intro";
  public sheets: number = 3;
  public prints: number = 0;
  public best: number = 0;

  // Current sheet configuration & physics
  private currentShape: GameShape = SHAPES[0];
  private diff: DifficultySettings = difficulty(0);
  private timeRemaining: number = 12;
  private sheetAge: number = 0; // seconds since sheet began
  private hold: number = 0; // seconds aligned (0 to 1.0)

  // Target & plate coordinates
  public targetX: number = 0;
  public targetY: number = 0;
  public plateX: number = 0;
  public plateY: number = 0;
  public plateVx: number = 0;
  public plateVy: number = 0;
  public shapeSize: number = 160; // S

  // Dragging state
  private isDragging: boolean = false;
  private dragPointerStart: { x: number; y: number } = { x: 0, y: 0 };
  private dragPlateStart: { x: number; y: number } = { x: 0, y: 0 };
  private activePointerId: number | null = null;

  // Keyboard input state
  private keysHeld: Set<string> = new Set();

  // Sheet transition animations
  private animPhase:
    | "normal"
    | "snap"
    | "flash"
    | "slide"
    | "spoil"
    | "print-cut" = "normal";
  private animProgress: number = 0; // 0 -> 1
  private animDuration: number = 0;
  private animTimer: number = 0;
  private snapStartX: number = 0;
  private snapStartY: number = 0;
  private prevShape: GameShape | null = null;
  private prevTargetX: number = 0;
  private prevTargetY: number = 0;

  constructor(
    canvas: HTMLCanvasElement,
    timerLineEl: HTMLElement | null,
    callbacks: EngineCallbacks,
    getReducedMotion: () => boolean
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not acquire 2D canvas context");
    this.ctx = ctx;
    this.timerLineEl = timerLineEl;
    this.callbacks = callbacks;
    this.getReducedMotion = getReducedMotion;

    // Load best score
    this.loadBest();

    // Initialize shapes in Path2D cache
    for (const s of SHAPES) {
      this.pathCache.set(s.id, new Path2D(s.path));
    }

    // Read colors
    this.updateColors();

    // Setup observers
    this.setupObservers();

    // Setup canvas event listeners
    this.setupEvents();

    // Measure initial size and position
    this.handleResize();
    this.drawStaticFrame();
  }

  public setTimerLine(el: HTMLElement | null) {
    this.timerLineEl = el;
    this.updateTimerBar();
  }

  private loadBest() {
    try {
      const stored = localStorage.getItem("cp:registration:best");
      if (stored !== null) {
        const val = parseInt(stored, 10);
        if (!isNaN(val)) this.best = val;
      }
    } catch {
      // localStorage unavailable; keep memory default
    }
    this.callbacks.onBestChange(this.best);
  }

  private saveBest(newBest: number) {
    this.best = newBest;
    try {
      localStorage.setItem("cp:registration:best", String(newBest));
    } catch {
      // localStorage failure tolerated
    }
    this.callbacks.onBestChange(this.best);
  }

  private updateColors() {
    try {
      const style = getComputedStyle(document.documentElement);
      const paper = style.getPropertyValue("--paper").trim() || "#F3F0E8";
      const ink = style.getPropertyValue("--ink").trim() || "#15140F";
      const ink2 = style.getPropertyValue("--ink-2").trim() || "#55514A";
      const ink3 = style.getPropertyValue("--ink-3").trim() || "#7A756B";
      const accent = style.getPropertyValue("--accent").trim() || "#C8321A";
      const isDark =
        document.documentElement.getAttribute("data-theme") === "dark";

      this.colors = { paper, ink, ink2, ink3, accent, isDark };
    } catch {
      // Fallback
    }
  }

  private setupObservers() {
    // Resize Observer on canvas container
    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize();
      if (this.state !== "playing") {
        this.drawStaticFrame();
      }
    });
    if (this.canvas.parentElement) {
      this.resizeObserver.observe(this.canvas.parentElement);
    }

    // Theme Mutation Observer
    this.themeObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === "data-theme") {
          this.updateColors();
          if (this.state !== "playing") {
            this.drawStaticFrame();
          }
        }
      }
    });
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // Window blur & visibility change for auto-pause
    window.addEventListener("blur", this.handleBlur);
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  private handleResize = () => {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);

    if (w <= 0 || h <= 0) return;

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = w;
    this.height = h;

    this.canvas.width = Math.floor(w * this.dpr);
    this.canvas.height = Math.floor(h * this.dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    // Recalculate S and target center
    this.shapeSize = Math.max(120, Math.min(260, 0.28 * Math.min(w, h)));
    this.targetX = w / 2;
    this.targetY = h / 2 + 8;

    // If starting or resizing during play, clamp plate
    if (this.plateX === 0 && this.plateY === 0) {
      this.initPlatePosition();
    } else {
      this.clampPlatePosition();
    }
  };

  private initPlatePosition() {
    const minDim = Math.min(this.width, this.height);
    const radius = 0.3 * minDim;
    const angle = Math.random() * Math.PI * 2;

    this.plateX = this.targetX + radius * Math.cos(angle);
    this.plateY = this.targetY + radius * Math.sin(angle);
    this.plateVx = 0;
    this.plateVy = 0;
    this.hold = 0;
    this.sheetAge = 0;
    this.clampPlatePosition();
  }

  private clampPlatePosition() {
    const margin = (this.shapeSize / 2) * 0.5;
    const minX = margin;
    const maxX = this.width - margin;
    const minY = margin;
    const maxY = this.height - margin;

    if (this.plateX < minX) {
      this.plateX = minX;
      if (this.plateVx < 0) this.plateVx = 0;
    } else if (this.plateX > maxX) {
      this.plateX = maxX;
      if (this.plateVx > 0) this.plateVx = 0;
    }

    if (this.plateY < minY) {
      this.plateY = minY;
      if (this.plateVy < 0) this.plateVy = 0;
    } else if (this.plateY > maxY) {
      this.plateY = maxY;
      if (this.plateVy > 0) this.plateVy = 0;
    }
  }

  private setupEvents() {
    this.canvas.addEventListener("pointerdown", this.handlePointerDown);
    this.canvas.addEventListener("pointermove", this.handlePointerMove);
    this.canvas.addEventListener("pointerup", this.handlePointerUp);
    this.canvas.addEventListener("pointercancel", this.handlePointerUp);
  }

  // Pointer Drag handling
  private handlePointerDown = (e: PointerEvent) => {
    if (this.state !== "playing" || (e.button !== 0 && e.pointerType === "mouse"))
      return;

    this.isDragging = true;
    this.activePointerId = e.pointerId;
    this.dragPointerStart = { x: e.clientX, y: e.clientY };
    this.dragPlateStart = { x: this.plateX, y: this.plateY };

    try {
      this.canvas.setPointerCapture(e.pointerId);
    } catch {}
  };

  private handlePointerMove = (e: PointerEvent) => {
    if (!this.isDragging || e.pointerId !== this.activePointerId) return;

    const dx = e.clientX - this.dragPointerStart.x;
    const dy = e.clientY - this.dragPointerStart.y;

    // Desired plate target
    const targetQx = this.dragPlateStart.x + dx;
    const targetQy = this.dragPlateStart.y + dy;

    // Follow with soft smoothing
    this.plateX = targetQx;
    this.plateY = targetQy;
    this.plateVx = 0;
    this.plateVy = 0;

    this.clampPlatePosition();
  };

  private handlePointerUp = (e: PointerEvent) => {
    if (e.pointerId === this.activePointerId) {
      this.isDragging = false;
      this.activePointerId = null;
      try {
        this.canvas.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Keyboard controls
  private handleKeyDown = (e: KeyboardEvent) => {
    const active = document.activeElement;
    const isButton =
      active &&
      (active.tagName === "BUTTON" ||
        active.getAttribute("role") === "button");

    if (e.code === "KeyP" || (e.code === "Space" && !isButton)) {
      e.preventDefault();
      if (this.state === "playing") {
        this.pause();
      } else if (this.state === "paused") {
        this.resume();
      }
      return;
    }

    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code) ||
      ["KeyW", "KeyA", "KeyS", "KeyD"].includes(e.code)
    ) {
      e.preventDefault();
      this.keysHeld.add(e.code);
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keysHeld.delete(e.code);
  };

  private handleBlur = () => {
    this.keysHeld.clear();
    if (this.state === "playing") {
      this.pause();
    }
  };

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.keysHeld.clear();
      if (this.state === "playing") {
        this.pause();
      }
    }
  };

  // State transitions
  public start() {
    this.sheets = 3;
    this.prints = 0;
    this.callbacks.onSheetsChange(this.sheets);
    this.callbacks.onPrintsChange(this.prints);

    this.loadSheet(0);
    this.state = "playing";
    this.callbacks.onStateChange("playing");

    this.startLoop();
  }

  public restart() {
    this.start();
  }

  public pause() {
    if (this.state !== "playing") return;
    this.state = "paused";
    this.keysHeld.clear();
    this.isDragging = false;
    this.stopLoop();
    this.callbacks.onStateChange("paused");
    this.drawStaticFrame();
  }

  public resume() {
    if (this.state !== "paused") return;
    this.state = "playing";
    this.callbacks.onStateChange("playing");
    this.startLoop();
  }

  private loadSheet(printsCount: number) {
    this.currentShape = SHAPES[printsCount % SHAPES.length];
    this.diff = difficulty(printsCount);
    this.timeRemaining = this.diff.time;
    this.sheetAge = 0;
    this.hold = 0;
    this.animPhase = "normal";
    this.animProgress = 0;

    this.initPlatePosition();
    this.updateTimerBar();
  }

  private updateTimerBar() {
    if (!this.timerLineEl) return;
    const progress = Math.max(0, Math.min(1, this.timeRemaining / this.diff.time));
    this.timerLineEl.style.transform = `scaleX(${progress})`;
  }

  private startLoop() {
    if (this.rafId !== null) return;
    this.lastTimestamp = performance.now();
    this.rafId = requestAnimationFrame(this.gameLoop);
  }

  private stopLoop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private gameLoop = (timestamp: number) => {
    if (this.state !== "playing") {
      this.rafId = null;
      return;
    }

    const rawDt = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    // Clamped dt (1/30s max step)
    const dt = Math.min(rawDt, 1 / 30);

    this.update(dt);
    this.render();

    this.rafId = requestAnimationFrame(this.gameLoop);
  };

  private update(dt: number) {
    const isReduced = this.getReducedMotion();

    // If handling transition animation
    if (this.animPhase !== "normal") {
      this.animTimer += dt;
      this.animProgress = Math.min(1, this.animTimer / this.animDuration);

      if (this.animPhase === "snap") {
        // Snap plate onto target over 120ms
        const t = this.animProgress;
        this.plateX = this.snapStartX + (this.targetX - this.snapStartX) * t;
        this.plateY = this.snapStartY + (this.targetY - this.snapStartY) * t;

        if (this.animProgress >= 1) {
          // Transition to ink flash
          this.animPhase = "flash";
          this.animTimer = 0;
          this.animDuration = 0.22;
          this.animProgress = 0;
        }
      } else if (this.animPhase === "flash") {
        if (this.animProgress >= 1) {
          if (isReduced) {
            // Cut directly to new sheet
            this.prints += 1;
            this.callbacks.onPrintsChange(this.prints);
            this.loadSheet(this.prints);
          } else {
            // Transition to slide
            this.prints += 1;
            this.callbacks.onPrintsChange(this.prints);
            this.prevShape = this.currentShape;
            this.prevTargetX = this.targetX;
            this.prevTargetY = this.targetY;
            this.loadSheet(this.prints);

            this.animPhase = "slide";
            this.animTimer = 0;
            this.animDuration = 0.35;
            this.animProgress = 0;
          }
        }
      } else if (this.animPhase === "slide") {
        if (this.animProgress >= 1) {
          this.animPhase = "normal";
          this.prevShape = null;
        }
      } else if (this.animPhase === "print-cut") {
        if (this.animProgress >= 1) {
          this.prints += 1;
          this.callbacks.onPrintsChange(this.prints);
          this.loadSheet(this.prints);
        }
      } else if (this.animPhase === "spoil") {
        if (this.animProgress >= 1) {
          if (this.sheets <= 0) {
            this.triggerGameOver();
          } else {
            // Reload same sheet shape
            this.loadSheet(this.prints);
          }
        }
      }
      return;
    }

    // Normal active gameplay
    this.sheetAge += dt;
    this.timeRemaining -= dt;
    this.updateTimerBar();

    // Check timeout
    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.sheets -= 1;
      this.callbacks.onSheetsChange(this.sheets);
      this.callbacks.onStatus("Sheet spoiled", 1200);

      this.animPhase = "spoil";
      this.animTimer = 0;
      this.animDuration = isReduced ? 0.3 : 0.95; // 250ms fade + 700ms pause
      this.animProgress = 0;
      return;
    }

    // Calculate wander
    let wanderAx = 0;
    let wanderAy = 0;
    if (!isReduced) {
      const theta =
        this.sheetAge * 0.9 + 2 * Math.sin(this.sheetAge * 0.37);
      wanderAx = this.diff.wander * Math.cos(theta);
      wanderAy = this.diff.wander * Math.sin(theta);
    }

    if (this.isDragging) {
      // While dragging, drift Q0 by wander * 0.12 * dt
      this.dragPlateStart.x += wanderAx * 0.12 * dt;
      this.dragPlateStart.y += wanderAy * 0.12 * dt;
    } else {
      // Keyboard input acceleration (1400 px/s²)
      let keyAx = 0;
      let keyAy = 0;
      const accel = 1400;

      if (this.keysHeld.has("ArrowLeft") || this.keysHeld.has("KeyA")) keyAx -= accel;
      if (this.keysHeld.has("ArrowRight") || this.keysHeld.has("KeyD")) keyAx += accel;
      if (this.keysHeld.has("ArrowUp") || this.keysHeld.has("KeyW")) keyAy -= accel;
      if (this.keysHeld.has("ArrowDown") || this.keysHeld.has("KeyS")) keyAy += accel;

      // Update velocity: v += (a_key + a_wander) * dt
      this.plateVx += (keyAx + wanderAx) * dt;
      this.plateVy += (keyAy + wanderAy) * dt;

      // Damping: v *= exp(-4 * dt)
      const damp = Math.exp(-4 * dt);
      this.plateVx *= damp;
      this.plateVy *= damp;

      // Max speed clamping (600 px/s)
      const speed = Math.hypot(this.plateVx, this.plateVy);
      if (speed > 600) {
        this.plateVx = (this.plateVx / speed) * 600;
        this.plateVy = (this.plateVy / speed) * 600;
      }

      // Update position
      this.plateX += this.plateVx * dt;
      this.plateY += this.plateVy * dt;

      this.clampPlatePosition();
    }

    // Alignment calculation
    const dist = Math.hypot(
      this.plateX - this.targetX,
      this.plateY - this.targetY
    );
    const isAligned = dist <= this.diff.tolerance;

    if (isAligned) {
      this.hold += dt;
      if (this.hold >= 1.0) {
        this.triggerPrint();
      }
    } else {
      this.hold = Math.max(0, this.hold - 2 * dt);
    }
  }

  private triggerPrint() {
    this.callbacks.onStatus("Printed", 600);
    const isReduced = this.getReducedMotion();

    if (isReduced) {
      this.animPhase = "print-cut";
      this.animTimer = 0;
      this.animDuration = 0.2;
      this.animProgress = 0;
    } else {
      this.animPhase = "snap";
      this.animTimer = 0;
      this.animDuration = 0.12; // 120ms snap
      this.animProgress = 0;
      this.snapStartX = this.plateX;
      this.snapStartY = this.plateY;
    }
  }

  private triggerGameOver() {
    this.state = "over";
    this.stopLoop();

    const isNewBest = this.prints > this.best;
    if (isNewBest) {
      this.saveBest(this.prints);
    }

    this.callbacks.onGameOver(this.prints, this.best, isNewBest);
    this.callbacks.onStateChange("over");
    this.drawStaticFrame();
  }

  private inOutQuart(t: number): number {
    return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
  }

  // Rendering
  public drawStaticFrame() {
    this.render();
  }

  private render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    if (w <= 0 || h <= 0) return;

    // Reset transform to DPR
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // 1. Clear background to paper
    ctx.fillStyle = this.colors.paper;
    ctx.fillRect(0, 0, w, h);

    if (this.animPhase === "slide") {
      // World slide animation
      const eased = this.inOutQuart(this.animProgress);
      const slideOffset = eased * w;

      // Draw previous sheet sliding out to left (0 -> -w)
      ctx.save();
      ctx.translate(-slideOffset, 0);
      if (this.prevShape) {
        this.drawSheetContents(
          this.prevShape,
          this.prevTargetX,
          this.prevTargetY,
          this.prevTargetX,
          this.prevTargetY,
          0,
          true,
          1,
          0
        );
      }
      ctx.restore();

      // Draw incoming new sheet sliding in from right (+w -> 0)
      ctx.save();
      ctx.translate(w - slideOffset, 0);
      this.drawSheetContents(
        this.currentShape,
        this.targetX,
        this.targetY,
        this.plateX,
        this.plateY,
        0,
        false,
        1,
        0
      );
      ctx.restore();
    } else {
      let plateAlpha = 1;
      if (this.animPhase === "spoil") {
        // Plate fades out over first 250ms (0.25 / 0.95 progress)
        const fadeP = Math.min(1, this.animTimer / 0.25);
        plateAlpha = 1 - fadeP;
      }

      let flashAlpha = 0;
      if (this.animPhase === "flash" || this.animPhase === "print-cut") {
        // Ink fill fading over 220ms
        flashAlpha = 1 - this.animProgress;
      }

      const dist = Math.hypot(
        this.plateX - this.targetX,
        this.plateY - this.targetY
      );
      const isAligned = dist <= this.diff.tolerance;

      this.drawSheetContents(
        this.currentShape,
        this.targetX,
        this.targetY,
        this.plateX,
        this.plateY,
        this.hold,
        isAligned,
        plateAlpha,
        flashAlpha
      );
    }
  }

  private drawSheetContents(
    shape: GameShape,
    targetX: number,
    targetY: number,
    plateX: number,
    plateY: number,
    hold: number,
    isAligned: boolean,
    plateAlpha: number,
    flashAlpha: number
  ) {
    const ctx = this.ctx;
    const S = this.shapeSize;
    const path = this.pathCache.get(shape.id);
    if (!path) return;

    // 2. Registration crosshair at target center (two 1px lines, 16px length, ink-3)
    ctx.strokeStyle = this.colors.ink3;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(targetX - 8, targetY);
    ctx.lineTo(targetX + 8, targetY);
    ctx.moveTo(targetX, targetY - 8);
    ctx.lineTo(targetX, targetY + 8);
    ctx.stroke();

    // 3. Target outline
    ctx.save();
    ctx.translate(targetX - S / 2, targetY - S / 2);
    ctx.scale(S / 100, S / 100);

    // If flash is active, fill target with ink (fading)
    if (flashAlpha > 0) {
      ctx.fillStyle = this.colors.ink;
      ctx.globalAlpha = flashAlpha;
      if (shape.evenodd) {
        ctx.fill(path, "evenodd");
      } else {
        ctx.fill(path);
      }
      ctx.globalAlpha = 1;
    }

    // Stroke target: accent when aligned, ink otherwise
    ctx.strokeStyle = isAligned ? this.colors.accent : this.colors.ink;
    ctx.lineWidth = 2 * (100 / S);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke(path);
    ctx.restore();

    // 4. Progress ring: arc of radius 0.62 * S around target center, 2px accent
    if (hold > 0) {
      const ringRadius = 0.62 * S;
      const startAngle = -Math.PI / 2;
      const sweep = Math.min(1, hold / 1.0) * Math.PI * 2;

      ctx.save();
      ctx.strokeStyle = this.colors.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(targetX, targetY, ringRadius, startAngle, startAngle + sweep, false);
      ctx.stroke();
      ctx.restore();
    }

    // 5. The plate
    if (plateAlpha > 0) {
      ctx.save();
      ctx.translate(plateX - S / 2, plateY - S / 2);
      ctx.scale(S / 100, S / 100);

      ctx.fillStyle = this.colors.accent;
      ctx.globalAlpha = 0.9 * plateAlpha;

      // Multiply in light theme, Screen in dark theme (multiply invisible on near-black paper)
      ctx.globalCompositeOperation = this.colors.isDark ? "screen" : "multiply";

      if (shape.evenodd) {
        ctx.fill(path, "evenodd");
      } else {
        ctx.fill(path);
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }

  // Cleanup
  public destroy() {
    this.stopLoop();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.themeObserver) {
      this.themeObserver.disconnect();
      this.themeObserver = null;
    }

    window.removeEventListener("blur", this.handleBlur);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);

    this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
    this.canvas.removeEventListener("pointermove", this.handlePointerMove);
    this.canvas.removeEventListener("pointerup", this.handlePointerUp);
    this.canvas.removeEventListener("pointercancel", this.handlePointerUp);
  }
}
