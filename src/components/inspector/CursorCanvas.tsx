"use client";

import * as React from "react";
import type { CursorRole, CursorState } from "./inspector-types";
import { INSPECTOR_CONFIG } from "./timeline-config";

interface CursorCanvasProps {
  active: boolean;
  origin: { x: number; y: number } | null;
  cursorTargets: Map<number, { x: number; y: number; role: CursorRole; isActionActive: boolean }>;
  isSequenceComplete: boolean;
}

export function CursorCanvas({
  active,
  origin,
  cursorTargets,
  isSequenceComplete,
}: CursorCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const cursorsRef = React.useRef<CursorState[]>([]);
  const mousePosRef = React.useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const animFrameRef = React.useRef<number | null>(null);
  const startTimeRef = React.useRef<number>(0);

  // Track visitor's real mouse for ambient idler repulsion
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Initialize cursors when active and origin becomes available
  React.useEffect(() => {
    if (!active || !origin) {
      cursorsRef.current = [];
      return;
    }

    const isMobile = window.innerWidth < 768;
    const count = isMobile
      ? INSPECTOR_CONFIG.mobileCursorCount
      : INSPECTOR_CONFIG.desktopCursorCount;

    const palette = INSPECTOR_CONFIG.cursorPalette;
    const newCursors: CursorState[] = [];

    for (let i = 0; i < count; i++) {
      // Non-uniform fan-out angle and initial velocity
      const angle = (i / count) * Math.PI * 2 + (Math.sin(i * 1.5) * 0.3);
      const speed = 180 + (i % 5) * 40;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      newCursors.push({
        id: i,
        x: origin.x,
        y: origin.y,
        targetX: origin.x + Math.cos(angle) * 120,
        targetY: origin.y + Math.sin(angle) * 120,
        vx,
        vy,
        color: palette[i % palette.length],
        role: "drawer",
        nameTag: INSPECTOR_CONFIG.nameTags[i],
        scale: 0.9,
        leanAngle: 0,
        isDrawing: false,
        isTyping: false,
        trail: [],
        isIdle: false,
        idleWanderAngle: (i / count) * Math.PI * 2,
        isVisible: true,
      });
    }

    cursorsRef.current = newCursors;
    startTimeRef.current = performance.now();
  }, [active, origin]);

  // Main Render Loop
  React.useEffect(() => {
    if (!active) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05); // cap dt at 50ms to prevent jumps
      lastTime = now;

      // Handle DPR & Resize
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cursors = cursorsRef.current;
      const realMouse = mousePosRef.current;

      cursors.forEach((c) => {
        if (!c.isVisible) return;

        // If whole sequence is complete, keep 3 ambient idlers and gracefully retire the rest
        if (isSequenceComplete) {
          if (c.id >= 3) {
            c.scale = Math.max(0, c.scale - dt * 2.5);
            if (c.scale <= 0.01) {
              c.isVisible = false;
              return;
            }
          } else {
            c.isIdle = true;
          }
        }

        const assignedTarget = cursorTargets.get(c.id);

        if (assignedTarget && !c.isIdle) {
          // Guided movement towards active assigned target
          c.targetX = assignedTarget.x;
          c.targetY = assignedTarget.y;
          c.role = assignedTarget.role;
          c.isDrawing = assignedTarget.role === "drawer" && assignedTarget.isActionActive;
          c.isTyping = assignedTarget.role === "typer" && assignedTarget.isActionActive;

          // Spring physics toward target
          const dx = c.targetX - c.x;
          const dy = c.targetY - c.y;
          const dist = Math.hypot(dx, dy);

          const springK = c.isDrawing ? 16 : 24;
          const damping = c.isDrawing ? 0.72 : 0.65;

          const ax = dx * springK;
          const ay = dy * springK;

          c.vx = (c.vx + ax * dt) * Math.pow(damping, dt * 60);
          c.vy = (c.vy + ay * dt) * Math.pow(damping, dt * 60);

          c.x += c.vx * dt;
          c.y += c.vy * dt;

          // 0.3px micro hand-tremor on arrival
          if (dist < 4) {
            c.x += Math.sin(now * 0.01 + c.id) * 0.3;
            c.y += Math.cos(now * 0.01 + c.id) * 0.3;
          }

          // Press scale down when drawing (0.9), normal 1.0
          const targetScale = c.isDrawing ? 0.9 : 1.0;
          c.scale += (targetScale - c.scale) * 0.2;
        } else {
          // Idler / Boid behavior (wandering + mouse evasion)
          c.idleWanderAngle += (Math.sin(now * 0.002 + c.id * 1.7) * 0.5) * dt * 2;
          const wanderSpeed = 55 + (c.id % 3) * 15;

          let targetVx = Math.cos(c.idleWanderAngle) * wanderSpeed;
          let targetVy = Math.sin(c.idleWanderAngle) * wanderSpeed;

          // Repulsion from visitor's real mouse cursor
          const mdx = c.x - realMouse.x;
          const mdy = c.y - realMouse.y;
          const mDist = Math.hypot(mdx, mdy);
          if (mDist < 160 && mDist > 0.1) {
            const repelStrength = ((160 - mDist) / 160) * 220;
            targetVx += (mdx / mDist) * repelStrength;
            targetVy += (mdy / mDist) * repelStrength;
          }

          // Bounce off viewport boundaries
          const pad = 30;
          if (c.x < pad) targetVx += 80;
          if (c.x > width - pad) targetVx -= 80;
          if (c.y < pad) targetVy += 80;
          if (c.y > height - pad) targetVy -= 80;

          c.vx += (targetVx - c.vx) * 0.1;
          c.vy += (targetVy - c.vy) * 0.1;

          c.x += c.vx * dt;
          c.y += c.vy * dt;
          c.scale = 1.0;
        }

        // Lean angle up to 12 degrees (0.21 rad) proportional to horizontal velocity
        const targetLean = Math.max(-0.21, Math.min(0.21, (c.vx / 300) * 0.21));
        c.leanAngle += (targetLean - c.leanAngle) * 0.25;

        // Distance-sampled ghost trail
        const speed = Math.hypot(c.vx, c.vy);
        const lastTrail = c.trail[c.trail.length - 1];
        const distFromLast = lastTrail ? Math.hypot(c.x - lastTrail.x, c.y - lastTrail.y) : 999;

        if (distFromLast >= INSPECTOR_CONFIG.trailSampleDistancePx && speed > 25) {
          c.trail.push({ x: c.x, y: c.y, time: now });
        }

        // Prune old trail points
        const trailLifetime = INSPECTOR_CONFIG.trailLifetimeMs;
        c.trail = c.trail.filter((p) => now - p.time <= trailLifetime);

        // 1. Render Ghost Trails
        for (let t = 0; t < c.trail.length; t++) {
          const pt = c.trail[t];
          const age = now - pt.time;
          const trailAlpha = (1 - age / trailLifetime) * 0.25;
          if (trailAlpha > 0.02) {
            ctx.save();
            ctx.globalAlpha = trailAlpha;
            ctx.translate(pt.x, pt.y);
            ctx.rotate(c.leanAngle);
            ctx.scale(c.scale * 0.95, c.scale * 0.95);
            drawPointerShape(ctx, c.color);
            ctx.restore();
          }
        }

        // 2. Render Main Cursor
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.leanAngle);
        ctx.scale(c.scale, c.scale);

        // Typer role blinking caret oscillation
        if (c.isTyping) {
          const caretVisible = Math.sin(now * 0.015) > 0;
          if (caretVisible) {
            ctx.fillStyle = c.color;
            ctx.fillRect(0, -6, 2, 14);
          }
        }

        drawPointerShape(ctx, c.color);

        // Monospace Name Tag (e.g. "layout", "type", "assets", "engine")
        if (c.nameTag) {
          drawNameTag(ctx, c.nameTag, c.color);
        }

        ctx.restore();
      });

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [active, cursorTargets, isSequenceComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9990] select-none"
      style={{ width: "100vw", height: "100vh" }}
      aria-hidden="true"
    />
  );
}

/**
 * Classic Arrow Pointer shape with 1px crisp white border and soft drop shadow.
 */
function drawPointerShape(ctx: CanvasRenderingContext2D, fillColor: string) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 16);
  ctx.lineTo(4.2, 12.2);
  ctx.lineTo(7.4, 18.8);
  ctx.lineTo(9.8, 17.6);
  ctx.lineTo(6.6, 11.2);
  ctx.lineTo(12, 11.2);
  ctx.closePath();

  // Drop Shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 2;

  // Fill
  ctx.fillStyle = fillColor;
  ctx.fill();

  // Reset shadow for crisp hairline stroke
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.25;
  ctx.lineJoin = "round";
  ctx.stroke();

  ctx.restore();
}

/**
 * Renders small monospace name tag pill beside the cursor.
 */
function drawNameTag(ctx: CanvasRenderingContext2D, tag: string, accentColor: string) {
  ctx.save();
  ctx.font = "600 10px monospace, ui-monospace, SFMono-Regular, Menlo, monospace";
  const metrics = ctx.measureText(tag);
  const textWidth = metrics.width;
  const padX = 5;
  const pillW = textWidth + padX * 2;
  const pillH = 15;
  const pillX = 14;
  const pillY = 12;

  // Pill background
  ctx.fillStyle = "rgba(15, 15, 18, 0.92)";
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 3);
  ctx.fill();

  // Pill 1px border
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Text
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.fillText(tag, pillX + padX, pillY + pillH / 2 + 0.5);

  ctx.restore();
}
