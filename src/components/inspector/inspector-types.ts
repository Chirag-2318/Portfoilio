// Type definitions for the Dev-Tools Inspector & Multiplayer Cursor Swarm

export type BuildType = "chrome" | "text" | "media" | "block" | "pill";
export type BuildState = "pending" | "skeleton" | "filling" | "done";

export type CursorRole = "drawer" | "typer" | "placer" | "idler";

export interface TargetRect {
  id: string;
  type: BuildType;
  order: number;
  section?: string;
  rect: DOMRect;
  lineRects?: DOMRect[];
  element: HTMLElement;
}

export interface TimelineStep {
  targetId: string;
  cursorIndex: number;
  cursorRole: CursorRole;
  startMs: number;
  durationMs: number;
  guideAxis?: "x" | "y" | "both" | "none";
}

export interface CursorState {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  color: string;
  role: CursorRole;
  nameTag?: string;
  scale: number;
  leanAngle: number;
  isDrawing: boolean;
  isTyping: boolean;
  trail: Array<{ x: number; y: number; time: number }>;
  isIdle: boolean;
  idleWanderAngle: number;
  isVisible: boolean;
}

export interface InspectorGuide {
  id: string;
  axis: "x" | "y";
  pos: number;
  color: "red" | "orange" | "blue";
  alpha: number;
}

export interface ActiveSkeletonBox {
  targetId: string;
  type: BuildType;
  rect: DOMRect;
  lineRects?: DOMRect[];
  progress: number; // 0 to 1
  currentW: number;
  currentH: number;
  alpha: number;
  state: BuildState;
}

