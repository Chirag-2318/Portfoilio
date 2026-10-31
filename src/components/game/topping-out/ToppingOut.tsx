"use client";

import * as React from "react";
import { GAME_CONSTANTS } from "./constants";
import { ToppingOutEngine, type DropResult } from "./engine";
import {
  ToppingOutRenderer,
  type FloatingText,
  type Particle,
  type PerfectRipple,
  type ActiveMilestone,
} from "./render";
import { ToppingOutAudio } from "./audio";
import { getLandmarkLine, getMilestoneNote } from "./landmarks";

export interface ToppingOutProps {
  mode?: "overlay" | "inline";
  onClose?: () => void;
  className?: string;
  autoFocus?: boolean;
}

export function ToppingOut({
  mode = "overlay",
  onClose,
  className = "",
  autoFocus = true,
}: ToppingOutProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Audio and Engine instances in refs
  const audioRef = React.useRef<ToppingOutAudio | null>(null);
  const engineRef = React.useRef<ToppingOutEngine | null>(null);
  const rendererRef = React.useRef<ToppingOutRenderer | null>(null);

  // Visual effects and animations in refs (zero React re-renders per frame)
  const floatingTextsRef = React.useRef<FloatingText[]>([]);
  const particlesRef = React.useRef<Particle[]>([]);
  const ripplesRef = React.useRef<PerfectRipple[]>([]);
  const activeMilestoneRef = React.useRef<ActiveMilestone | null>(null);

  const dimensionAccentUntilRef = React.useRef<number>(0);
  const screenShakeUntilRef = React.useRef<number>(0);
  const gameOverDelayUntilRef = React.useRef<number>(0);
  const canRestartAtRef = React.useRef<number>(0);

  const reducedMotionRef = React.useRef(false);
  const nextEffectIdRef = React.useRef(1);
  const isHoveredRef = React.useRef(false);

  // React state for HUD and UI overlays
  const [gameState, setGameState] = React.useState<"ready" | "playing" | "paused" | "over">("ready");
  const [floors, setFloors] = React.useState(0);
  const [perfects, setPerfects] = React.useState(0);
  const [best, setBest] = React.useState(0);
  const [isNewBest, setIsNewBest] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [showGameOverCard, setShowGameOverCard] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);

  // Initialize best score and audio
  React.useEffect(() => {
    let initialBest = 0;
    try {
      const stored = localStorage.getItem(GAME_CONSTANTS.STORAGE_KEY_BEST);
      if (stored) initialBest = parseInt(stored, 10) || 0;
    } catch {
      // ignore storage error
    }
    setBest(initialBest);

    const audio = new ToppingOutAudio();
    audioRef.current = audio;
    setIsMuted(audio.muted);

    const engine = new ToppingOutEngine();
    engine.reset(initialBest);
    engineRef.current = engine;

    const renderer = new ToppingOutRenderer();
    rendererRef.current = renderer;

    if (typeof window !== "undefined") {
      (window as unknown as { __toppingOut?: unknown }).__toppingOut = {
        getEngine: () => engineRef.current,
        getAudio: () => audioRef.current,
        trigger: () => handleTrigger(),
      };
    }

    // Reduced motion preference
    if (typeof window !== "undefined") {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      reducedMotionRef.current = media.matches;
      const listener = (e: MediaQueryListEvent) => {
        reducedMotionRef.current = e.matches;
      };
      media.addEventListener("change", listener);
      return () => {
        media.removeEventListener("change", listener);
        delete (window as unknown as { __toppingOut?: unknown }).__toppingOut;
      };
    }
    return () => {
      delete (window as unknown as { __toppingOut?: unknown }).__toppingOut;
    };
  }, []);

  // Listen for theme changes to refresh renderer colors
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const observer = new MutationObserver(() => {
      rendererRef.current?.updateTheme();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Auto-focus container if requested
  React.useEffect(() => {
    if (autoFocus && containerRef.current) {
      containerRef.current.focus();
    }
  }, [autoFocus]);

  // Handle Drop trigger
  const handleTrigger = React.useCallback(() => {
    const audio = audioRef.current;
    const engine = engineRef.current;
    if (!engine) return;

    audio?.unlock();

    if (engine.state === "ready") {
      engine.start();
      setGameState("playing");
      setIsPaused(false);
      setShowGameOverCard(false);
      return;
    }

    if (isPaused) {
      setIsPaused(false);
      return;
    }

    if (engine.state === "over") {
      const now = performance.now();
      if (now >= canRestartAtRef.current) {
        engine.reset(engine.best);
        engine.start();
        setGameState("playing");
        setFloors(0);
        setPerfects(0);
        setIsNewBest(false);
        setShowGameOverCard(false);
      }
      return;
    }

    if (engine.state === "playing") {
      const dropRes: DropResult | null = engine.drop();
      if (!dropRes) return;

      const now = performance.now();

      if (dropRes.type === "miss") {
        audio?.playGameOver();
        if (!reducedMotionRef.current) {
          screenShakeUntilRef.current = now + GAME_CONSTANTS.SCREEN_SHAKE_DURATION_MS;
        }
        canRestartAtRef.current = now + GAME_CONSTANTS.MISS_DURATION_MS + GAME_CONSTANTS.RESTART_DELAY_MS;
        gameOverDelayUntilRef.current = now + GAME_CONSTANTS.MISS_DURATION_MS + 500;
        return;
      }

      setFloors(dropRes.floors);
      setPerfects(engine.perfects);

      // Save best score if beaten
      if (dropRes.floors > engine.best) {
        setBest(dropRes.floors);
        try {
          localStorage.setItem(GAME_CONSTANTS.STORAGE_KEY_BEST, String(dropRes.floors));
        } catch {
          // ignore
        }
      }

      const canvas = canvasRef.current;
      const renderer = rendererRef.current;
      const top = engine.getTopSlab();

      if (canvas && renderer && top) {
        const scale = renderer.getScale(canvas.width / (window.devicePixelRatio || 1));
        const proj = renderer.project(
          top.x,
          top.y1,
          top.z,
          canvas.width / (window.devicePixelRatio || 1),
          canvas.height / (window.devicePixelRatio || 1),
          scale,
          engine.cameraShift
        );

        if (dropRes.type === "perfect") {
          audio?.playPerfect(dropRes.combo);
          dimensionAccentUntilRef.current = now + GAME_CONSTANTS.DIMENSION_ACCENT_DURATION_MS;

          // Expanding diamond ripple
          if (!reducedMotionRef.current) {
            const p010 = renderer.project(
              top.x - top.w / 2,
              top.y1,
              top.z - top.d / 2,
              canvas.width / (window.devicePixelRatio || 1),
              canvas.height / (window.devicePixelRatio || 1),
              scale,
              engine.cameraShift
            );
            const p110 = renderer.project(
              top.x + top.w / 2,
              top.y1,
              top.z - top.d / 2,
              canvas.width / (window.devicePixelRatio || 1),
              canvas.height / (window.devicePixelRatio || 1),
              scale,
              engine.cameraShift
            );
            const p111 = renderer.project(
              top.x + top.w / 2,
              top.y1,
              top.z + top.d / 2,
              canvas.width / (window.devicePixelRatio || 1),
              canvas.height / (window.devicePixelRatio || 1),
              scale,
              engine.cameraShift
            );
            const p011 = renderer.project(
              top.x - top.w / 2,
              top.y1,
              top.z + top.d / 2,
              canvas.width / (window.devicePixelRatio || 1),
              canvas.height / (window.devicePixelRatio || 1),
              scale,
              engine.cameraShift
            );

            ripplesRef.current.push({
              id: nextEffectIdRef.current++,
              points: [p010, p110, p111, p011],
              centre: proj,
              elapsed: 0,
              duration: GAME_CONSTANTS.PERFECT_EXPAND_DURATION_MS / 1000,
            });
          }

          // Floating text: "Perfect!" or "Perfect x3" or "REGROW!"
          let text = dropRes.combo > 1 ? `Perfect x${dropRes.combo}` : "Perfect!";
          if (dropRes.regrew) {
            text = "REGROW!";
          }
          floatingTextsRef.current.push({
            id: nextEffectIdRef.current++,
            text,
            x: proj.px,
            y: proj.py - 10,
            alpha: 1.0,
            elapsed: 0,
            duration: GAME_CONSTANTS.FLOATING_TEXT_DURATION_MS / 1000,
          });
          if (floatingTextsRef.current.length > GAME_CONSTANTS.MAX_FLOATING_TEXTS) {
            floatingTextsRef.current.shift();
          }
        } else {
          // Trim landing
          audio?.playTrim();
        }

        // Spawn dust particles on landing
        if (!reducedMotionRef.current) {
          for (let i = 0; i < GAME_CONSTANTS.PARTICLE_COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 20 + Math.random() * 40;
            particlesRef.current.push({
              id: nextEffectIdRef.current++,
              x: proj.px,
              y: proj.py,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd * 0.6,
              size: Math.random() > 0.5 ? 2 : 3,
              alpha: 1.0,
              elapsed: 0,
              duration: GAME_CONSTANTS.PARTICLE_LIFETIME_MS / 1000,
            });
          }
          if (particlesRef.current.length > GAME_CONSTANTS.MAX_PARTICLES) {
            particlesRef.current.splice(0, particlesRef.current.length - GAME_CONSTANTS.MAX_PARTICLES);
          }
        }

        // Milestone notes
        const milestone = getMilestoneNote(dropRes.floors);
        if (milestone) {
          activeMilestoneRef.current = {
            text: milestone,
            targetY: proj.py,
            elapsed: 0,
            duration: GAME_CONSTANTS.MILESTONE_NOTE_DURATION_MS / 1000,
          };
        }
      }
    }
  }, [isPaused]);

  // Keyboard navigation & controls
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      // In inline mode, only handle space if focused or hovered
      if (mode === "inline" && !isHoveredRef.current && document.activeElement !== containerRef.current) {
        return;
      }

      if (e.key === " " || e.key === "Enter" || e.key === "ArrowDown") {
        e.preventDefault();
        handleTrigger();
      } else if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        if (engineRef.current?.state === "playing") {
          setIsPaused((prev) => !prev);
        }
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        if (audioRef.current) {
          const next = audioRef.current.toggleMute();
          setIsMuted(next);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      }
    },
    [handleTrigger, mode, onClose]
  );

  // Auto-pause when window loses focus or page hidden
  React.useEffect(() => {
    const handleBlur = () => {
      if (engineRef.current?.state === "playing") {
        setIsPaused(true);
      }
    };
    const handleVisibility = () => {
      if (document.hidden && engineRef.current?.state === "playing") {
        setIsPaused(true);
      }
    };

    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Main RAF loop
  React.useEffect(() => {
    let rafId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      rafId = requestAnimationFrame(loop);

      const dt = Math.min((currentTime - lastTime) / 1000, 1 / 30);
      lastTime = currentTime;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const engine = engineRef.current;
      const renderer = rendererRef.current;

      if (!canvas || !ctx || !engine || !renderer) return;

      const dpr = window.devicePixelRatio || 1;
      const logicalWidth = canvas.width / dpr;
      const logicalHeight = canvas.height / dpr;
      const scale = renderer.getScale(logicalWidth);

      // Update engine physics if not paused
      if (!isPaused) {
        engine.update(dt, scale, logicalHeight);
      }

      // Check game over transition
      if (engine.state === "over" && gameState !== "over") {
        setGameState("over");
      }
      if (
        engine.state === "over" &&
        !showGameOverCard &&
        currentTime >= gameOverDelayUntilRef.current
      ) {
        setShowGameOverCard(true);
        setIsNewBest(engine.floors > best);
      }

      // Clear frame
      ctx.save();
      ctx.scale(dpr, dpr);

      // Screen shake (disabled under reduced motion)
      let shakeX = 0;
      let shakeY = 0;
      if (currentTime < screenShakeUntilRef.current && !reducedMotionRef.current) {
        shakeX = (Math.random() - 0.5) * GAME_CONSTANTS.SCREEN_SHAKE_AMOUNT;
        shakeY = (Math.random() - 0.5) * GAME_CONSTANTS.SCREEN_SHAKE_AMOUNT;
      }
      ctx.translate(shakeX, shakeY);

      // Background fill
      ctx.fillStyle = renderer.colors.background;
      ctx.fillRect(0, 0, logicalWidth, logicalHeight);

      // Dot grid
      renderer.drawDotGrid(ctx, logicalWidth, logicalHeight, scale, engine.cameraShift);

      // Height gauge
      renderer.drawHeightGauge(ctx, logicalHeight, scale, engine.cameraShift, engine.floors);

      // Tower opacity when game over
      const towerAlpha = engine.state === "over" ? 0.7 : 1.0;

      // Draw all placed slabs from bottom up
      for (let i = 0; i < engine.slabs.length; i++) {
        const slab = engine.slabs[i];
        const isTenth = i > 0 && i % 10 === 0;
        const currentTopY =
          slab.squashScale !== undefined
            ? slab.y0 + (slab.y1 - slab.y0) * slab.squashScale
            : slab.y1;

        renderer.drawBox(
          ctx,
          {
            x0: slab.x - slab.w / 2,
            x1: slab.x + slab.w / 2,
            z0: slab.z - slab.d / 2,
            z1: slab.z + slab.d / 2,
            y0: slab.y0,
            y1: currentTopY,
            accentOutline: isTenth,
            label10F: isTenth ? `${i}F` : undefined,
          },
          logicalWidth,
          logicalHeight,
          scale,
          engine.cameraShift,
          towerAlpha
        );
      }

      // Draw active debris pieces
      for (const d of engine.debrisList) {
        renderer.drawBox(
          ctx,
          {
            x0: d.x - d.w / 2,
            x1: d.x + d.w / 2,
            z0: d.z - d.d / 2,
            z1: d.z + d.d / 2,
            y0: d.y0,
            y1: d.y1,
          },
          logicalWidth,
          logicalHeight,
          scale,
          engine.cameraShift,
          d.alpha
        );
      }

      // Draw falling slab on miss
      if (engine.fallingSlab) {
        const f = engine.fallingSlab;
        renderer.drawBox(
          ctx,
          {
            x0: f.x - f.w / 2,
            x1: f.x + f.w / 2,
            z0: f.z - f.d / 2,
            z1: f.z + f.d / 2,
            y0: f.y0,
            y1: f.y1,
          },
          logicalWidth,
          logicalHeight,
          scale,
          engine.cameraShift,
          1.0
        );
      }

      // Draw moving slab and live CAD dimension line
      if (engine.state === "playing" && engine.movingSlab) {
        renderer.drawBox(
          ctx,
          {
            x0: engine.movingSlab.x - engine.movingSlab.w / 2,
            x1: engine.movingSlab.x + engine.movingSlab.w / 2,
            z0: engine.movingSlab.z - engine.movingSlab.d / 2,
            z1: engine.movingSlab.z + engine.movingSlab.d / 2,
            y0: engine.movingSlab.y0,
            y1: engine.movingSlab.y1,
          },
          logicalWidth,
          logicalHeight,
          scale,
          engine.cameraShift,
          1.0
        );

        const isDimAccent = currentTime < dimensionAccentUntilRef.current;
        renderer.drawDimensionLine(
          ctx,
          engine.movingSlab,
          logicalWidth,
          logicalHeight,
          scale,
          engine.cameraShift,
          isDimAccent
        );
      }

      // Perfect ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const r = ripplesRef.current[i];
        r.elapsed += dt;
        renderer.drawPerfectRipple(ctx, r);
        if (r.elapsed >= r.duration) {
          ripplesRef.current.splice(i, 1);
        }
      }

      // Floating texts
      for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
        const ft = floatingTextsRef.current[i];
        ft.elapsed += dt;
        if (ft.elapsed >= ft.duration) {
          floatingTextsRef.current.splice(i, 1);
        }
      }
      renderer.drawFloatingTexts(ctx, floatingTextsRef.current);

      // Dust particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.elapsed += dt;
        if (p.elapsed >= p.duration) {
          particlesRef.current.splice(i, 1);
        }
      }
      renderer.drawParticles(ctx, particlesRef.current);

      // Active milestone note
      if (activeMilestoneRef.current) {
        const m = activeMilestoneRef.current;
        m.elapsed += dt;
        renderer.drawMilestoneNote(ctx, m, logicalWidth);
        if (m.elapsed >= m.duration) {
          activeMilestoneRef.current = null;
        }
      }

      // Paused badge
      if (isPaused) {
        ctx.fillStyle = renderer.colors.background;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(0, 0, logicalWidth, logicalHeight);

        ctx.globalAlpha = 1.0;
        ctx.font = '14px "Geist Mono", monospace';
        ctx.fillStyle = renderer.colors.foreground;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Paused. Press P to resume", logicalWidth / 2, logicalHeight / 2);
      }

      ctx.restore();
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [best, gameState, isPaused, showGameOverCard]);

  // Handle ResizeObserver
  React.useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const headerH = 40; // header height
      const footerH = 32; // footer height
      const targetW = rect.width;
      const targetH = Math.max(300, rect.height - headerH - footerH);

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(targetW * dpr);
      canvas.height = Math.round(targetH * dpr);
      canvas.style.width = `${targetW}px`;
      canvas.style.height = `${targetH}px`;
    };

    updateSize();

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(updateSize);
      ro.observe(container);
      return () => ro.disconnect();
    }
  }, []);

  const toggleSound = () => {
    if (audioRef.current) {
      const next = audioRef.current.toggleMute();
      setIsMuted(next);
    }
  };

  const restartGame = () => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.reset(engine.best);
    engine.start();
    setGameState("playing");
    setFloors(0);
    setPerfects(0);
    setIsNewBest(false);
    setShowGameOverCard(false);
    setIsPaused(false);
    containerRef.current?.focus();
  };

  const metres = floors * GAME_CONSTANTS.METRES_PER_FLOOR;
  const landmarkText = getLandmarkLine(floors);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role={mode === "overlay" ? "dialog" : "region"}
      aria-modal={mode === "overlay" ? "true" : undefined}
      aria-label="Topping Out game"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
      className={`relative flex flex-col bg-[var(--background)] border border-[var(--line-strong)] rounded-[6px] overflow-hidden select-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
        mode === "overlay"
          ? "w-full max-w-[480px] h-[min(88vh,760px)] shadow-2xl"
          : "w-full max-w-[480px] h-[560px] mx-auto"
      } ${className}`}
    >
      {/* 4 Corner Registration Crosshairs (+ marks) */}
      <div className="absolute top-1.5 left-1.5 text-[var(--dimension)] font-mono text-[10px] leading-none pointer-events-none z-20">
        +
      </div>
      <div className="absolute top-1.5 right-1.5 text-[var(--dimension)] font-mono text-[10px] leading-none pointer-events-none z-20">
        +
      </div>
      <div className="absolute bottom-1.5 left-1.5 text-[var(--dimension)] font-mono text-[10px] leading-none pointer-events-none z-20">
        +
      </div>
      <div className="absolute bottom-1.5 right-1.5 text-[var(--dimension)] font-mono text-[10px] leading-none pointer-events-none z-20">
        +
      </div>

      {/* Card Header Row */}
      <header className="h-10 shrink-0 border-b border-[var(--line)] px-3 flex items-center justify-between z-10 bg-[var(--background)]">
        <div className="flex items-center gap-2">
          <span className="font-serif text-lg font-normal tracking-tight text-foreground">
            Topping Out
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-xs tabular-nums">
            <span className="text-foreground">FLOORS {floors}</span>
            <span className="text-muted-foreground">BEST {best}</span>
          </div>

          <button
            type="button"
            onClick={toggleSound}
            aria-label={isMuted ? "Unmute sound" : "Mute sound"}
            title={isMuted ? "Unmute (M)" : "Mute (M)"}
            className="size-8 rounded-[6px] text-muted-foreground hover:text-foreground hover:bg-[var(--muted)] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
          >
            {isMuted ? (
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>

          {mode === "overlay" && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close game (Esc)"
              title="Close (Esc)"
              className="size-8 rounded-[6px] text-muted-foreground hover:text-foreground hover:bg-[var(--muted)] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Main Interactive Canvas Area */}
      <div
        className="relative flex-1 cursor-pointer overflow-hidden"
        style={{ touchAction: "none" }}
        onPointerDown={(e) => {
          e.preventDefault();
          handleTrigger();
        }}
      >
        <canvas ref={canvasRef} className="block w-full h-full" />

        {/* Ready Screen Overlay */}
        {gameState === "ready" && (
          <div className="absolute inset-0 flex flex-col items-center justify-between py-12 px-4 pointer-events-none">
            <div className="text-center space-y-1">
              <p className="font-mono text-sm text-foreground flex items-center justify-center gap-1">
                <span>Tap, click or press Space to drop the slab</span>
                <span className="inline-block w-1.5 h-3.5 bg-[var(--accent)] animate-pulse" />
              </p>
              <p className="font-caveat text-xl text-[var(--accent)] -rotate-3">
                stack them straight
              </p>
            </div>

            <div className="font-mono text-xs text-muted-foreground">
              1 floor = 3 m
            </div>
          </div>
        )}

        {/* Game Over Card */}
        {showGameOverCard && (
          <div className="absolute inset-0 flex items-center justify-center p-4 bg-background/50 backdrop-blur-[1px] z-30">
            <div
              className="w-full max-w-[340px] bg-[var(--background)] border border-[var(--line-strong)] rounded-[6px] p-5 shadow-2xl space-y-4 text-center cursor-default animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-1">
                <h3 className="font-serif text-2xl font-normal tracking-tight text-foreground">
                  You topped out at {floors} {floors === 1 ? "floor" : "floors"}
                </h3>
                <p className="font-mono text-xs text-muted-foreground">
                  {metres} m. {landmarkText}
                </p>
              </div>

              <div className="py-2 px-3 border border-[var(--line)] rounded-[4px] bg-[var(--muted)] flex items-center justify-around font-mono text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">PERFECTS</span>
                  <span className="text-foreground font-medium text-sm tabular-nums">{perfects}</span>
                </div>
                <div className="w-px h-6 bg-[var(--line)]" />
                <div>
                  <span className="text-muted-foreground block text-[10px]">BEST</span>
                  <span className="text-foreground font-medium text-sm tabular-nums">{best}</span>
                </div>
              </div>

              {isNewBest && (
                <p className="font-caveat text-xl text-[var(--accent)] -rotate-3 font-medium">
                  New best!
                </p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={restartGame}
                  className="flex-1 h-9 rounded-md bg-foreground text-background font-mono text-xs font-medium hover:opacity-90 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  Play again
                </button>
                {mode === "overlay" && onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 h-9 rounded-md border border-[var(--border)] text-muted-foreground hover:text-foreground hover:bg-[var(--muted)] font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Hint Row */}
      <footer className="h-8 shrink-0 border-t border-[var(--line)] px-3 flex items-center justify-center font-mono text-xs text-muted-foreground bg-[var(--background)]">
        <span className="hidden sm:inline">
          Space / click: drop · P: pause · M: sound · Esc: close
        </span>
        <span className="sm:hidden">
          Tap to drop · P: pause · M: sound
        </span>
      </footer>
    </div>
  );
}
