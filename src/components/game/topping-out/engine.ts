/**
 * Pure Game Engine for Topping Out
 * Fully typed, deterministic given inputs, zero DOM dependency.
 */

import { GAME_CONSTANTS } from "./constants";

export type Axis = "x" | "z";
export type GameState = "ready" | "playing" | "over";

export interface Slab {
  id: number;
  x: number; // centre x
  z: number; // centre z
  y0: number; // bottom y
  y1: number; // top y
  w: number; // width along x
  d: number; // depth along z
  squashScale?: number;
  squashVelocity?: number;
  isBase?: boolean;
}

export interface MovingSlab {
  axis: Axis;
  x: number;
  z: number;
  y0: number;
  y1: number;
  w: number;
  d: number;
  dir: number; // +1 or -1
  speed: number;
  minPos: number;
  maxPos: number;
}

export interface Debris {
  id: number;
  x: number;
  z: number;
  y0: number;
  y1: number;
  w: number;
  d: number;
  vy: number;
  rx: number;
  rz: number;
  vrx: number;
  vrz: number;
  alpha: number;
  lifetime: number;
  maxLifetime: number;
}

export interface FallingSlab {
  x: number;
  z: number;
  y0: number;
  y1: number;
  w: number;
  d: number;
  vy: number;
  rx: number;
  rz: number;
  vrx: number;
  vrz: number;
  timeRemaining: number;
}

export interface DropResult {
  type: "miss" | "perfect" | "trim";
  delta: number;
  overlap: number;
  combo: number;
  floors: number;
  regrew: boolean;
  regrowAmount: number;
  newSlab?: Slab;
  debris?: Debris;
}

export interface EngineCallbacks {
  onGameOver?: (floors: number, best: number, isNewBest: boolean) => void;
  onDrop?: (result: DropResult) => void;
  onFloorMilestone?: (floors: number) => void;
}

export class ToppingOutEngine {
  public state: GameState = "ready";
  public slabs: Slab[] = [];
  public movingSlab: MovingSlab | null = null;
  public debrisList: Debris[] = [];
  public fallingSlab: FallingSlab | null = null;

  public floors = 0;
  public perfects = 0;
  public combo = 0;
  public best = 0;

  public cameraShift = 0;
  public targetCameraShift = 0;

  private nextId = 1;
  private callbacks: EngineCallbacks = {};

  constructor(callbacks?: EngineCallbacks) {
    if (callbacks) {
      this.callbacks = callbacks;
    }
    this.reset();
  }

  public setCallbacks(callbacks: EngineCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public reset(bestScore = 0) {
    this.state = "ready";
    this.nextId = 1;
    this.floors = 0;
    this.perfects = 0;
    this.combo = 0;
    this.best = bestScore;
    this.debrisList = [];
    this.fallingSlab = null;
    this.movingSlab = null;
    this.cameraShift = 0;
    this.targetCameraShift = 0;

    // Base slab (level 0)
    const baseSlab: Slab = {
      id: this.nextId++,
      x: 0,
      z: 0,
      y0: 0,
      y1: GAME_CONSTANTS.SLAB_HEIGHT,
      w: GAME_CONSTANTS.BASE_WIDTH,
      d: GAME_CONSTANTS.BASE_DEPTH,
      squashScale: 1.0,
      squashVelocity: 0,
      isBase: true,
    };
    this.slabs = [baseSlab];
  }

  public start() {
    if (this.state !== "ready") return;
    this.state = "playing";
    this.spawnMovingSlab(1);
  }

  public getTopSlab(): Slab {
    return this.slabs[this.slabs.length - 1];
  }

  public getSpeed(level: number): number {
    if (level <= 3) {
      return GAME_CONSTANTS.SPEED_INITIAL;
    }
    return Math.min(
      GAME_CONSTANTS.SPEED_BASE + level * GAME_CONSTANTS.SPEED_ACCEL,
      GAME_CONSTANTS.SPEED_MAX
    );
  }

  public spawnMovingSlab(level: number) {
    const prev = this.getTopSlab();
    const isOdd = level % 2 === 1;
    const axis: Axis = isOdd ? "x" : "z";
    const speed = this.getSpeed(level);
    const R = GAME_CONSTANTS.OSCILLATION_RANGE;

    // Odd levels move along x; even levels along z
    // Alternate starting side: level 1 starts left (-R), level 2 starts right (+R), etc.
    const startNegative = level % 2 === 1;
    const prevCentre = axis === "x" ? prev.x : prev.z;
    const minPos = prevCentre - R;
    const maxPos = prevCentre + R;
    const initialPos = startNegative ? minPos : maxPos;
    const initialDir = startNegative ? 1 : -1;

    const y0 = level * GAME_CONSTANTS.SLAB_HEIGHT;
    const y1 = (level + 1) * GAME_CONSTANTS.SLAB_HEIGHT;

    this.movingSlab = {
      axis,
      x: axis === "x" ? initialPos : prev.x,
      z: axis === "z" ? initialPos : prev.z,
      y0,
      y1,
      w: prev.w,
      d: prev.d,
      dir: initialDir,
      speed,
      minPos,
      maxPos,
    };
  }

  public drop(): DropResult | null {
    if (this.state !== "playing" || !this.movingSlab) {
      return null;
    }

    const prev = this.getTopSlab();
    const moving = this.movingSlab;
    const axis = moving.axis;
    const level = this.floors + 1;

    const movingCentre = axis === "x" ? moving.x : moving.z;
    const prevCentre = axis === "x" ? prev.x : prev.z;
    const delta = movingCentre - prevCentre;

    const prevSize = axis === "x" ? prev.w : prev.d;
    const currSize = axis === "x" ? moving.w : moving.d;
    const overlap = prevSize - Math.abs(delta);

    // 1. MISS Check
    if (overlap <= GAME_CONSTANTS.MISS_THRESHOLD) {
      this.combo = 0;
      this.movingSlab = null;

      // Spawn falling slab
      const dirSign = delta >= 0 ? 1 : -1;
      this.fallingSlab = {
        x: moving.x,
        z: moving.z,
        y0: moving.y0,
        y1: moving.y1,
        w: moving.w,
        d: moving.d,
        vy: 0,
        rx: 0,
        rz: 0,
        vrx: axis === "z" ? dirSign * 2.5 : (Math.random() - 0.5) * 1.5,
        vrz: axis === "x" ? -dirSign * 2.5 : (Math.random() - 0.5) * 1.5,
        timeRemaining: GAME_CONSTANTS.MISS_DURATION_MS / 1000,
      };

      const result: DropResult = {
        type: "miss",
        delta,
        overlap: Math.max(0, overlap),
        combo: 0,
        floors: this.floors,
        regrew: false,
        regrowAmount: 0,
      };

      this.callbacks.onDrop?.(result);
      return result;
    }

    // 2. PERFECT Check
    if (Math.abs(delta) <= GAME_CONSTANTS.PERFECT_THRESHOLD) {
      this.combo += 1;
      this.perfects += 1;
      this.floors += 1;

      let regrew = false;
      let regrowAmount = 0;

      let w = prev.w;
      let d = prev.d;

      // Check combo regrowth (from 4th consecutive onward)
      if (this.combo >= GAME_CONSTANTS.COMBO_REGROW_THRESHOLD) {
        if (axis === "x") {
          const oldW = w;
          w = Math.min(w + GAME_CONSTANTS.REGROW_AMOUNT, GAME_CONSTANTS.MAX_SLAB_SIZE);
          regrowAmount = w - oldW;
        } else {
          const oldD = d;
          d = Math.min(d + GAME_CONSTANTS.REGROW_AMOUNT, GAME_CONSTANTS.MAX_SLAB_SIZE);
          regrowAmount = d - oldD;
        }
        if (regrowAmount > 0) {
          regrew = true;
        }
      }

      // Snapped new slab
      const newSlab: Slab = {
        id: this.nextId++,
        x: prev.x,
        z: prev.z,
        y0: moving.y0,
        y1: moving.y1,
        w,
        d,
        squashScale: GAME_CONSTANTS.SQUASH_INITIAL_SCALE,
        squashVelocity: 0,
      };

      this.slabs.push(newSlab);
      this.spawnMovingSlab(level + 1);

      const result: DropResult = {
        type: "perfect",
        delta,
        overlap: prevSize,
        combo: this.combo,
        floors: this.floors,
        regrew,
        regrowAmount,
        newSlab,
      };

      this.callbacks.onDrop?.(result);
      this.callbacks.onFloorMilestone?.(this.floors);
      return result;
    }

    // 3. TRIM Check
    this.combo = 0;
    this.floors += 1;

    const mLeft = movingCentre - currSize / 2;
    const mRight = movingCentre + currSize / 2;
    const pLeft = prevCentre - prevSize / 2;
    const pRight = prevCentre + prevSize / 2;

    const overlapStart = Math.max(mLeft, pLeft);
    const overlapEnd = Math.min(mRight, pRight);
    const newSize = Math.max(0.01, overlapEnd - overlapStart);
    const newCentre = (overlapStart + overlapEnd) / 2;

    // Overhang / Debris
    let dStart = 0;
    let dEnd = 0;
    if (delta > 0) {
      dStart = overlapEnd;
      dEnd = mRight;
    } else {
      dStart = mLeft;
      dEnd = overlapStart;
    }
    const debrisSize = Math.max(0.01, dEnd - dStart);
    const debrisCentre = (dStart + dEnd) / 2;

    const dirSign = delta > 0 ? 1 : -1;
    const debris: Debris = {
      id: this.nextId++,
      x: axis === "x" ? debrisCentre : prev.x,
      z: axis === "z" ? debrisCentre : prev.z,
      y0: moving.y0,
      y1: moving.y1,
      w: axis === "x" ? debrisSize : prev.w,
      d: axis === "z" ? debrisSize : prev.d,
      vy: 0,
      rx: 0,
      rz: 0,
      vrx: axis === "z" ? dirSign * 2.2 : (Math.random() - 0.5) * 1.2,
      vrz: axis === "x" ? -dirSign * 2.2 : (Math.random() - 0.5) * 1.2,
      alpha: 1.0,
      lifetime: GAME_CONSTANTS.DEBRIS_LIFETIME_MS / 1000,
      maxLifetime: GAME_CONSTANTS.DEBRIS_LIFETIME_MS / 1000,
    };

    // Add to debris list (capped at MAX_DEBRIS)
    this.debrisList.push(debris);
    if (this.debrisList.length > GAME_CONSTANTS.MAX_DEBRIS) {
      this.debrisList.shift();
    }

    // New placed slab
    const newSlab: Slab = {
      id: this.nextId++,
      x: axis === "x" ? newCentre : prev.x,
      z: axis === "z" ? newCentre : prev.z,
      y0: moving.y0,
      y1: moving.y1,
      w: axis === "x" ? newSize : prev.w,
      d: axis === "z" ? newSize : prev.d,
      squashScale: GAME_CONSTANTS.SQUASH_INITIAL_SCALE,
      squashVelocity: 0,
    };

    this.slabs.push(newSlab);
    this.spawnMovingSlab(level + 1);

    const result: DropResult = {
      type: "trim",
      delta,
      overlap: newSize,
      combo: 0,
      floors: this.floors,
      regrew: false,
      regrowAmount: 0,
      newSlab,
      debris,
    };

    this.callbacks.onDrop?.(result);
    this.callbacks.onFloorMilestone?.(this.floors);
    return result;
  }

  public update(dt: number, scale = 40, canvasHeight = 600) {
    // 1. Moving slab motion
    if (this.state === "playing" && this.movingSlab) {
      const m = this.movingSlab;
      const step = m.dir * m.speed * dt;
      if (m.axis === "x") {
        m.x += step;
        if (m.x >= m.maxPos) {
          m.x = m.maxPos;
          m.dir = -1;
        } else if (m.x <= m.minPos) {
          m.x = m.minPos;
          m.dir = 1;
        }
      } else {
        m.z += step;
        if (m.z >= m.maxPos) {
          m.z = m.maxPos;
          m.dir = -1;
        } else if (m.z <= m.minPos) {
          m.z = m.minPos;
          m.dir = 1;
        }
      }
    }

    // 2. Squash spring on top slab
    const top = this.getTopSlab();
    if (top && top.squashScale !== undefined && top.squashVelocity !== undefined) {
      if (Math.abs(top.squashScale - 1) > 0.001 || Math.abs(top.squashVelocity) > 0.001) {
        const displacement = top.squashScale - 1;
        const force =
          -GAME_CONSTANTS.SPRING_STIFFNESS * displacement -
          GAME_CONSTANTS.SPRING_DAMPING * top.squashVelocity;
        top.squashVelocity += force * dt;
        top.squashScale += top.squashVelocity * dt;
      } else {
        top.squashScale = 1.0;
        top.squashVelocity = 0;
      }
    }

    // 3. Falling slab (miss state)
    if (this.fallingSlab) {
      const f = this.fallingSlab;
      f.vy += GAME_CONSTANTS.GRAVITY * dt;
      f.y0 -= f.vy * dt;
      f.y1 -= f.vy * dt;
      f.rx += f.vrx * dt;
      f.rz += f.vrz * dt;
      f.timeRemaining -= dt;

      if (f.timeRemaining <= 0) {
        this.fallingSlab = null;
        this.finishGameOver();
      }
    }

    // 4. Debris updates
    for (let i = this.debrisList.length - 1; i >= 0; i--) {
      const d = this.debrisList[i];
      d.vy += GAME_CONSTANTS.GRAVITY * dt;
      d.y0 -= d.vy * dt;
      d.y1 -= d.vy * dt;
      d.rx += d.vrx * dt;
      d.rz += d.vrz * dt;
      d.lifetime -= dt;
      d.alpha = Math.max(0, d.lifetime / d.maxLifetime);

      if (d.lifetime <= 0) {
        this.debrisList.splice(i, 1);
      }
    }

    // 5. Camera shift smoothing
    const topY = (this.floors + 1) * GAME_CONSTANTS.SLAB_HEIGHT;
    this.targetCameraShift = Math.max(
      0,
      topY * scale - canvasHeight * GAME_CONSTANTS.CAMERA_VIEW_RATIO
    );
    this.cameraShift +=
      (this.targetCameraShift - this.cameraShift) *
      (1 - Math.exp(-GAME_CONSTANTS.CAMERA_SMOOTH_FACTOR * dt));
  }

  private finishGameOver() {
    this.state = "over";
    const isNewBest = this.floors > this.best;
    if (isNewBest) {
      this.best = this.floors;
    }
    this.callbacks.onGameOver?.(this.floors, this.best, isNewBest);
  }
}
