"use client";

import * as React from "react";
import { GAME_CONSTANTS } from "./constants";
import { ToppingOutEngine, type DropResult, type Slab, type MovingSlab } from "./engine";
import {
  ToppingOutRenderer,
  type FloatingText,
  type Particle,
  type ConfettiParticle,
} from "./render";
import { ToppingOutAudio } from "./audio";
import { isSoundMuted, setSoundMuted, SoundToggle, playSound } from "@/components/sound/sound-effects";
import {
  getLandmarkLine,
  getMilestoneNote,
  landmarkCrossed,
} from "./landmarks";
import {
  PALETTES,
  isPaletteUnlocked,
  blockColors,
  type PaletteId,
} from "./palettes";
import {
  type Achievement,
  type AchievementState,
  type AchievementEvent,
  ACHIEVEMENTS,
  reduceAchievements,
  nextGoal,
  progressFor,
} from "./achievements";
import {
  loadInitialState,
  saveAchievements,
  saveLifetimeStats,
  hasSeenAchievementHint,
  markSeenAchievementHint,
} from "./storage";
import { AchievementToastContainer } from "./AchievementToast";
import { TrophyShelf } from "./TrophyShelf";
import { getAchievementGlyph, TrophyGlyph, TierPips } from "./glyphs";

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

  // Visual effects and animations in refs
  const floatingTextsRef = React.useRef<FloatingText[]>([]);
  const particlesRef = React.useRef<Particle[]>([]);
  const confettiRef = React.useRef<ConfettiParticle[]>([]);

  // Animation timers & state in refs
  const streakHaloFloorRef = React.useRef<number | null>(null);
  const streakHaloUntilRef = React.useRef<number>(0);

  const craneDropTimeRef = React.useRef<number>(0);
  const canRestartAtRef = React.useRef<number>(0);
  const screenShakeUntilRef = React.useRef<number>(0);
  const playStartTimeRef = React.useRef<number | null>(null);

  const reducedMotionRef = React.useRef(false);
  const isCoarsePointerRef = React.useRef(false);
  const nextEffectIdRef = React.useRef(1);
  const fontsReadyRef = React.useRef(false);

  // React state for HUD and UI overlays
  const [gameState, setGameState] = React.useState<"ready" | "playing" | "paused" | "over">("ready");
  const [floors, setFloors] = React.useState(0);
  const [perfects, setPerfects] = React.useState(0);
  const [best, setBest] = React.useState(0);
  const [top3, setTop3] = React.useState<number[]>([]);
  const [isNewBest, setIsNewBest] = React.useState(false);
  const [showGameOverCard, setShowGameOverCard] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [palette, setPalette] = React.useState<PaletteId>("rainbow");
  const [shareFeedback, setShareFeedback] = React.useState<string | null>(null);
  const [showHint, setShowHint] = React.useState(true);

  // Achievement system state and refs
  const [achState, setAchState] = React.useState<AchievementState>(loadInitialState);
  const achStateRef = React.useRef<AchievementState>(achState);
  const [showTrophyShelf, setShowTrophyShelf] = React.useState(false);
  const [activeToasts, setActiveToasts] = React.useState<Achievement[]>([]);
  const toastQueueRef = React.useRef<Achievement[]>([]);
  const toastTimerRef = React.useRef<number | null>(null);
  const unlockedThisRunRef = React.useRef<Achievement[]>([]);
  const [showAchHint, setShowAchHint] = React.useState(false);

  // Initialize best score, top 3, palette, audio, and font ready check
  React.useEffect(() => {
    let initialBest = 0;
    try {
      const storedBest = localStorage.getItem(GAME_CONSTANTS.STORAGE_KEY_BEST);
      if (storedBest) initialBest = parseInt(storedBest, 10) || 0;

      const storedTop3 = localStorage.getItem(GAME_CONSTANTS.STORAGE_KEY_TOP3);
      if (storedTop3) {
        const parsed = JSON.parse(storedTop3);
        if (Array.isArray(parsed)) setTop3(parsed);
      }

      const storedPalette = localStorage.getItem(GAME_CONSTANTS.STORAGE_KEY_PALETTE) as PaletteId;
      if (storedPalette && PALETTES.some((p) => p.id === storedPalette)) {
        if (isPaletteUnlocked(storedPalette, initialBest, achStateRef.current.unlocked)) {
          setPalette(storedPalette);
        }
      }
    } catch {
      // ignore storage error
    }
    setBest(initialBest);

    if (!hasSeenAchievementHint()) {
      setShowAchHint(true);
      const hintTimer = setTimeout(() => {
        setShowAchHint(false);
        markSeenAchievementHint();
      }, 5000);
    }

    const audio = new ToppingOutAudio();
    audioRef.current = audio;

    const engine = new ToppingOutEngine();
    engine.reset(initialBest);
    engineRef.current = engine;

    const renderer = new ToppingOutRenderer();
    rendererRef.current = renderer;

    if (typeof window !== "undefined") {
      (window as unknown as { __toppingOut?: unknown }).__toppingOut = {
        getEngine: () => engineRef.current,
        getAudio: () => audioRef.current,
        getRenderer: () => rendererRef.current,
        getCanvas: () => canvasRef.current,
        trigger: () => handleTrigger(),
      };

      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      reducedMotionRef.current = media.matches;
      const listener = (e: MediaQueryListEvent) => {
        reducedMotionRef.current = e.matches;
      };
      media.addEventListener("change", listener);

      const coarse = window.matchMedia("(pointer: coarse)");
      isCoarsePointerRef.current = coarse.matches;

      if (document.fonts) {
        document.fonts.ready.then(() => {
          fontsReadyRef.current = true;
        });
      } else {
        fontsReadyRef.current = true;
      }

      return () => {
        media.removeEventListener("change", listener);
        delete (window as unknown as { __toppingOut?: unknown }).__toppingOut;
      };
    }
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

  // Auto-focus container
  React.useEffect(() => {
    if (autoFocus && containerRef.current) {
      containerRef.current.focus();
    }
  }, [autoFocus]);

  // Hint chip fade-out timer (fades out 6 seconds after play starts)
  React.useEffect(() => {
    if (gameState === "playing" && playStartTimeRef.current === null) {
      playStartTimeRef.current = performance.now();
      const timer = setTimeout(() => {
        setShowHint(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Helper to spawn confetti burst
  const spawnConfetti = React.useCallback(
    (x: number, y: number, currentPalette: PaletteId, countOverride?: number) => {
      if (reducedMotionRef.current) return;
      const count = countOverride ?? GAME_CONSTANTS.CONFETTI_BURST_COUNT;
      const colors = blockColors(floors, currentPalette);
      const paletteColors = [
        colors.top,
        colors.left,
        colors.right,
        colors.windowLit,
        rendererRef.current?.colors.accent || "#ff5a2c",
      ];

      for (let i = 0; i < count; i++) {
        if (confettiRef.current.length >= GAME_CONSTANTS.MAX_CONFETTI) break;
        const color = paletteColors[Math.floor(Math.random() * paletteColors.length)];
        confettiRef.current.push({
          id: nextEffectIdRef.current++,
          x,
          y,
          vx: (Math.random() - 0.5) * 160,
          vy: -Math.random() * 120 - 40,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 8,
          w: 4,
          h: 7,
          color,
          alpha: 1.0,
          elapsed: 0,
          duration: GAME_CONSTANTS.CONFETTI_DURATION_MS / 1000,
        });
      }
    },
    [floors]
  );

  // Toast and achievement dispatch helpers
  const dismissToast = React.useCallback((id: string) => {
    setActiveToasts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const processToastQueue = React.useCallback(() => {
    if (toastTimerRef.current !== null) return;
    if (toastQueueRef.current.length === 0) return;

    const next = toastQueueRef.current.shift()!;
    setActiveToasts((prev) => {
      if (prev.length >= 4) {
        return [...prev.slice(1), next];
      }
      return [...prev, next];
    });

    if (next.tier === 3) {
      playSound("success");
      const canvas = canvasRef.current;
      if (canvas) {
        spawnConfetti(canvas.width / 2, 80, palette, 18);
      }
    } else {
      playSound("notification");
    }

    toastTimerRef.current = window.setTimeout(() => {
      toastTimerRef.current = null;
      processToastQueue();
    }, 250);
  }, [palette, spawnConfetti]);

  const enqueueToast = React.useCallback(
    (ach: Achievement) => {
      toastQueueRef.current.push(ach);
      processToastQueue();
    },
    [processToastQueue]
  );

  const dispatchAchievement = React.useCallback(
    (event: AchievementEvent) => {
      const { state: next, unlockedNow } = reduceAchievements(achStateRef.current, event);
      achStateRef.current = next;
      setAchState(next);

      if (unlockedNow.length > 0) {
        saveAchievements(next.unlocked);
        unlockedThisRunRef.current.push(...unlockedNow);
        const topSlab = engineRef.current?.getTopSlab();
        for (const ach of unlockedNow) {
          if (topSlab) {
            rendererRef.current?.addPlaque(topSlab.id, ach.tier);
          }
          enqueueToast(ach);
        }
      }
      if (event.type === "gameover") {
        saveLifetimeStats(next.lifetime);
      }
    },
    [enqueueToast]
  );

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
        rendererRef.current?.clearPlaques();
        unlockedThisRunRef.current = [];
        engine.start();
        setGameState("playing");
        setFloors(0);
        setPerfects(0);
        setIsNewBest(false);
        setShowGameOverCard(false);
        setShowHint(true);
        playStartTimeRef.current = performance.now();
      }
      return;
    }

    if (engine.state === "playing") {
      const prevMetres = engine.floors * GAME_CONSTANTS.METRES_PER_FLOOR;
      const dropRes: DropResult | null = engine.drop();
      if (!dropRes) return;

      const now = performance.now();
      craneDropTimeRef.current = now;

      if (dropRes.type === "miss") {
        audio?.playGameOver();
        if (isCoarsePointerRef.current && !reducedMotionRef.current) {
          navigator.vibrate?.(GAME_CONSTANTS.HAPTIC_GAMEOVER_MS);
        }
        if (!reducedMotionRef.current) {
          screenShakeUntilRef.current = now + GAME_CONSTANTS.SCREEN_SHAKE_DURATION_MS;
        }
        canRestartAtRef.current = now + GAME_CONSTANTS.MISS_DURATION_MS + GAME_CONSTANTS.RESTART_DELAY_MS;

        // Record top 3 scores
        const finalFloors = engine.floors;
        dispatchAchievement({
          type: "gameover",
          floors: finalFloors,
          hour: new Date().getHours(),
        });
        let nextTop3: number[] = [];
        try {
          const stored = localStorage.getItem(GAME_CONSTANTS.STORAGE_KEY_TOP3);
          if (stored) nextTop3 = JSON.parse(stored);
        } catch {}
        if (!Array.isArray(nextTop3)) nextTop3 = [];
        nextTop3.push(finalFloors);
        nextTop3.sort((a, b) => b - a);
        nextTop3 = Array.from(new Set(nextTop3)).slice(0, 3);
        setTop3(nextTop3);
        try {
          localStorage.setItem(GAME_CONSTANTS.STORAGE_KEY_TOP3, JSON.stringify(nextTop3));
        } catch {}

        setTimeout(() => {
          setShowGameOverCard(true);
          setGameState("over");
        }, GAME_CONSTANTS.MISS_DURATION_MS);
        return;
      }

      const newFloors = dropRes.floors;
      const newMetres = newFloors * GAME_CONSTANTS.METRES_PER_FLOOR;
      setFloors(newFloors);
      setPerfects(engine.perfects);

      // Streak halo for combo >= 2
      if (dropRes.combo >= 2) {
        streakHaloFloorRef.current = newFloors;
        streakHaloUntilRef.current = now + GAME_CONSTANTS.STREAK_HALO_DURATION_MS;
      }

      // Check landmark crossed
      const crossed = landmarkCrossed(prevMetres, newMetres);
      const canvas = canvasRef.current;
      const renderer = rendererRef.current;
      const topSlab = engine.getTopSlab();

      // Dispatch achievement events
      const kind = dropRes.type === "perfect" ? "perfect" : "trim";
      const sign = (Math.sign(dropRes.delta) || 0) as -1 | 0 | 1;
      const axis = newFloors % 2 === 1 ? "x" : "z";
      const widthAfter = dropRes.newSlab ? (axis === "x" ? dropRes.newSlab.w : dropRes.newSlab.d) : 1;
      dispatchAchievement({
        type: "placed",
        kind,
        floor: newFloors,
        widthAfter,
        sign,
      });

      if (dropRes.regrew) {
        dispatchAchievement({ type: "regrow" });
      }

      if (crossed) {
        dispatchAchievement({ type: "landmark", id: crossed.id });
      }

      if (canvas && renderer && topSlab) {
        const scale = renderer.getScale(canvas.width / (window.devicePixelRatio || 1));
        const proj = renderer.project(
          topSlab.x,
          topSlab.y1,
          topSlab.z,
          canvas.width / (window.devicePixelRatio || 1),
          canvas.height / (window.devicePixelRatio || 1),
          scale,
          engine.cameraShift
        );

        if (crossed) {
          audio?.playPerfect(4); // celebration chord
          floatingTextsRef.current.push({
            id: nextEffectIdRef.current++,
            text: `${crossed.name}: cleared!`,
            x: proj.px,
            y: proj.py - 40,
            alpha: 1.0,
            elapsed: 0,
            duration: GAME_CONSTANTS.LANDMARK_NOTE_DURATION_MS / 1000,
            isCaveat: true,
          });
          spawnConfetti(proj.px, proj.py - 20, palette);
        }

        // New best check
        if (newFloors > engine.best) {
          setIsNewBest(true);
          setBest(newFloors);
          try {
            localStorage.setItem(GAME_CONSTANTS.STORAGE_KEY_BEST, String(newFloors));
          } catch {}

          if (!crossed) {
            floatingTextsRef.current.push({
              id: nextEffectIdRef.current++,
              text: "New best!",
              x: proj.px,
              y: proj.py - 35,
              alpha: 1.0,
              elapsed: 0,
              duration: GAME_CONSTANTS.LANDMARK_NOTE_DURATION_MS / 1000,
              isCaveat: true,
            });
            spawnConfetti(proj.px, proj.py - 20, palette);
          }
        }

        // Milestone note
        const milestoneNote = getMilestoneNote(newFloors);
        if (milestoneNote && !crossed) {
          floatingTextsRef.current.push({
            id: nextEffectIdRef.current++,
            text: milestoneNote,
            x: proj.px,
            y: proj.py - 30,
            alpha: 1.0,
            elapsed: 0,
            duration: GAME_CONSTANTS.MILESTONE_NOTE_DURATION_MS / 1000,
            isCaveat: true,
          });
        }
      }

      // Audio & Haptic feedback
      if (dropRes.type === "perfect") {
        audio?.playPerfect(dropRes.combo);
        if (isCoarsePointerRef.current && !reducedMotionRef.current) {
          navigator.vibrate?.(GAME_CONSTANTS.HAPTIC_PERFECT_MS);
        }
      } else {
        audio?.playTrim();
      }
    }
  }, [palette, spawnConfetti, dispatchAchievement]);

  // Keyboard navigation & controls
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter" || e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        handleTrigger();
        return;
      }

      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        e.stopPropagation();
        setShowTrophyShelf((prev) => !prev);
        return;
      }

      if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        e.stopPropagation();
        if (gameState === "playing") {
          setIsPaused((prev) => !prev);
        }
        return;
      }

      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        e.stopPropagation();
        setSoundMuted(!isSoundMuted());
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose?.();
      }
    },
    [gameState, handleTrigger, onClose]
  );

  // Cycle palette through unlocked choices
  const cyclePalette = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const currentBest = best;
    const unlocked = PALETTES.filter((p) =>
      isPaletteUnlocked(p.id, currentBest, achStateRef.current.unlocked)
    );
    const currentIndex = unlocked.findIndex((p) => p.id === palette);
    const nextIndex = (currentIndex + 1) % unlocked.length;
    const nextPalette = unlocked[nextIndex].id;
    setPalette(nextPalette);
    try {
      localStorage.setItem(GAME_CONSTANTS.STORAGE_KEY_PALETTE, nextPalette);
    } catch {}
  }, [best, palette]);

  // Share score handler
  const handleShare = React.useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const metres = floors * GAME_CONSTANTS.METRES_PER_FLOOR;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const text = `I topped out at ${floors} floors (${metres} m) on Chirag Patil's portfolio. Think you can beat me?`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Topping Out",
          text,
          url: origin,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`${text} ${origin}`);
        setShareFeedback("Copied!");
        setTimeout(() => setShareFeedback(null), 1500);
      } catch {
        // ignore
      }
    }
  }, [floors]);

  // Game loop
  React.useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop);

      if (!fontsReadyRef.current) return;

      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 1 / 30); // clamp dt to 1/30s

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const engine = engineRef.current;
      const renderer = rendererRef.current;

      if (!canvas || !ctx || !engine || !renderer) return;

      const dpr = window.devicePixelRatio || 1;
      const displayW = canvas.clientWidth;
      const displayH = canvas.clientHeight;

      if (canvas.width !== Math.round(displayW * dpr) || canvas.height !== Math.round(displayH * dpr)) {
        canvas.width = Math.round(displayW * dpr);
        canvas.height = Math.round(displayH * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, displayW, displayH);

      // Screen shake on miss
      if (now < screenShakeUntilRef.current) {
        const shake = (Math.random() - 0.5) * GAME_CONSTANTS.SCREEN_SHAKE_AMOUNT;
        ctx.translate(shake, shake);
      }

      // Update engine physics
      if (!isPaused) {
        engine.update(dt);
      }

      const scale = renderer.getScale(displayW);
      const cameraShift = engine.cameraShift;

      // 1. Draw solid ground platform
      renderer.drawGroundPlatform(ctx, displayW, displayH, scale, cameraShift);

      // 2. Draw placed slabs in painter's order (bottom to top)
      const currentHaloActive = now < streakHaloUntilRef.current;
      const highestFlagFloor = Math.max(...engine.slabs.map((s) => s.id).filter((id) => id % 10 === 0), 0);

      engine.slabs.forEach((slab, idx) => {
        const slabColors = blockColors(idx, palette);
        const isHalo = currentHaloActive && streakHaloFloorRef.current === slab.id;

        renderer.drawSolidBox(
          ctx,
          {
            x0: slab.x - slab.w / 2,
            x1: slab.x + slab.w / 2,
            z0: slab.z - slab.d / 2,
            z1: slab.z + slab.d / 2,
            y0: slab.y0,
            y1: slab.y1,
            colors: slabColors,
            hasWindows: !slab.isBase,
            floorIndex: idx,
            accentOutline: isHalo,
          },
          displayW,
          displayH,
          scale,
          cameraShift
        );

        // Draw flag on floor 10, 20, 30... (only highest flag after floor 30)
        if (slab.id > 0 && slab.id % 10 === 0) {
          if (slab.id <= 30 || slab.id === highestFlagFloor) {
            renderer.drawFlag(ctx, slab, now / 1000, displayW, displayH, scale, cameraShift, reducedMotionRef.current);
          }
        }

        // Draw engraved achievement plaque if one exists for this slab
        const slabPlaque = renderer.plaques.find((p) => p.slabId === slab.id);
        if (slabPlaque) {
          renderer.drawPlaque(
            ctx,
            slab,
            slabPlaque,
            now,
            displayW,
            displayH,
            scale,
            cameraShift,
            reducedMotionRef.current
          );
        }
      });

      // 3. Draw falling debris pieces (solid while falling, fade during last 300ms)
      engine.debrisList.forEach((d) => {
        let alpha = 1.0;
        if (d.lifetime <= 0.3) {
          alpha = Math.max(0, d.lifetime / 0.3);
        }
        const dColors = blockColors(d.id, palette);

        renderer.drawSolidBox(
          ctx,
          {
            x0: d.x - d.w / 2,
            x1: d.x + d.w / 2,
            z0: d.z - d.d / 2,
            z1: d.z + d.d / 2,
            y0: d.y0,
            y1: d.y1,
            colors: dColors,
            hasWindows: false,
          },
          displayW,
          displayH,
          scale,
          cameraShift,
          alpha
        );
      });

      // 4. Draw moving slab with crane
      if (engine.state === "playing" && engine.movingSlab) {
        const moving = engine.movingSlab;
        const currentFloor = engine.floors + 1;
        const movingColors = blockColors(currentFloor, palette);

        // Calculate crane retraction progress (0 to 1 over 150ms on drop)
        let craneRetract = 0;
        if (craneDropTimeRef.current > 0) {
          const elapsedCrane = now - craneDropTimeRef.current;
          if (elapsedCrane < GAME_CONSTANTS.CRANE_RETRACT_DURATION_MS) {
            craneRetract = elapsedCrane / GAME_CONSTANTS.CRANE_RETRACT_DURATION_MS;
          }
        }

        // Draw crane line & hook
        renderer.drawCrane(
          ctx,
          moving,
          craneRetract,
          now / 1000,
          displayW,
          displayH,
          scale,
          cameraShift,
          reducedMotionRef.current
        );

        // Draw moving slab
        renderer.drawSolidBox(
          ctx,
          {
            x0: moving.x - moving.w / 2,
            x1: moving.x + moving.w / 2,
            z0: moving.z - moving.d / 2,
            z1: moving.z + moving.d / 2,
            y0: moving.y0,
            y1: moving.y1,
            colors: movingColors,
            hasWindows: true,
            floorIndex: currentFloor,
          },
          displayW,
          displayH,
          scale,
          cameraShift
        );
      }

      // 5. Draw landmark dashed comparison lines across viewport
      renderer.drawLandmarks(ctx, engine.floors, displayW, displayH, scale, cameraShift);

      // 6. Update and draw confetti particles
      if (!isPaused && confettiRef.current.length > 0) {
        for (let i = confettiRef.current.length - 1; i >= 0; i--) {
          const c = confettiRef.current[i];
          c.elapsed += dt;
          if (c.elapsed >= c.duration) {
            confettiRef.current.splice(i, 1);
            continue;
          }
          c.vy += 180 * dt; // gravity
          c.vx += Math.sin(now / 300 + c.id) * 20 * dt; // drift
          c.x += c.vx * dt;
          c.y += c.vy * dt;
          c.rot += c.vrot * dt;
          c.alpha = 1 - c.elapsed / c.duration;
        }
        renderer.drawConfetti(ctx, confettiRef.current);
      }

      // 7. Update and draw floating texts
      if (!isPaused && floatingTextsRef.current.length > 0) {
        for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
          const t = floatingTextsRef.current[i];
          t.elapsed += dt;
          if (t.elapsed >= t.duration) {
            floatingTextsRef.current.splice(i, 1);
            continue;
          }
          t.y -= 25 * dt;
          t.alpha = 1 - t.elapsed / t.duration;
        }
        renderer.drawFloatingTexts(ctx, floatingTextsRef.current);
      }

      ctx.restore();
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, palette]);

  const isOverlay = mode === "overlay";
  const nextUnlockMeta = PALETTES.find(
    (p) => !isPaletteUnlocked(p.id, best, achState.unlocked)
  );
  const nextGoalAch = nextGoal(achState);
  const unlockedCount = Object.keys(achState.unlocked).length;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="application"
      aria-label="Topping Out game canvas"
      onKeyDown={handleKeyDown}
      onClick={handleTrigger}
      className={`relative select-none outline-none ${
        isOverlay ? "w-full h-full cursor-pointer" : `w-full h-[400px] border border-[var(--line-strong)] rounded-lg overflow-hidden bg-[var(--background)] cursor-pointer ${className}`
      }`}
    >
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none block"
      />

      {/* ─── HUD: Solid Chips for High Legibility ─── */}

      {/* Top-Left: Floors Counter Chip & Next Goal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute top-4 left-4 z-20 bg-[var(--background)] border border-[var(--line-strong)] rounded-md px-3 py-2 flex flex-col justify-center shadow-xs select-none pointer-events-auto"
      >
        <span
          className="font-serif text-[2rem] leading-none font-normal tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
        >
          {floors}
        </span>
        <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground mt-0.5 tracking-wider">
          <span className="uppercase">FLOORS</span>
          <span>·</span>
          <span>BEST {best}</span>
        </div>

        {/* Next Goal Chip */}
        {nextGoalAch && (
          <button
            type="button"
            data-sound="select"
            onClick={(e) => {
              e.stopPropagation();
              setShowTrophyShelf(true);
            }}
            className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded border border-[var(--line)] bg-[var(--muted)]/40 hover:bg-[var(--muted)]/80 text-[10px] font-mono text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors text-left cursor-pointer"
            title={`Next goal: ${nextGoalAch.name}. Click to view Trophy Shelf`}
          >
            <span className="uppercase text-[9px] text-[var(--accent)] font-semibold">Goal</span>
            <span className="truncate max-w-[110px] text-[var(--foreground)] font-sans font-medium">
              {nextGoalAch.name}
            </span>
            {(() => {
              const p = progressFor(nextGoalAch, achState);
              return p && p.target > 1 ? (
                <span className="text-[9px] text-[var(--muted-foreground)] shrink-0 font-mono">
                  {p.current}/{p.target}
                </span>
              ) : null;
            })()}
          </button>
        )}
      </div>

      {/* Top-Right: Icon Controls Row */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute top-4 right-4 z-20 flex items-center gap-2 select-none pointer-events-auto"
      >
        {/* Trophy Shelf Button */}
        <button
          type="button"
          data-sound="select"
          onClick={(e) => {
            e.stopPropagation();
            setShowTrophyShelf(true);
          }}
          aria-label={`Trophy Shelf: ${unlockedCount} of 16 unlocked. Click or press T`}
          title={`Trophy Shelf (${unlockedCount}/16) — Press T`}
          className="h-9 px-2.5 rounded-md bg-[var(--background)] border border-[var(--line-strong)] text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-ring font-mono text-xs"
        >
          <TrophyGlyph className="size-4 text-[var(--accent)]" />
          <span>{unlockedCount}/16</span>
        </button>

        {/* Palette Selector Button */}
        <button
          type="button"
          data-sound="select"
          onClick={cyclePalette}
          aria-label={`Palette: ${palette}. Click to cycle`}
          title={
            nextUnlockMeta
              ? nextUnlockMeta.unlockHint
                ? `Current: ${palette.toUpperCase()}. ${nextUnlockMeta.unlockHint} to unlock ${nextUnlockMeta.name}`
                : `Current: ${palette.toUpperCase()}. Reach ${nextUnlockMeta.unlockThreshold} floors to unlock ${nextUnlockMeta.name}`
              : `Current: ${palette.toUpperCase()}`
          }
          className="size-9 rounded-md bg-[var(--background)] border border-[var(--line-strong)] text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex items-center gap-0.5">
            <span
              className="size-2 rounded-full"
              style={{
                backgroundColor:
                  palette === "rainbow"
                    ? "#ff5a2c"
                    : palette === "dusk"
                    ? "#c084fc"
                    : palette === "mint"
                    ? "#34d399"
                    : palette === "mono"
                    ? "#a1a1aa"
                    : palette === "gold"
                    ? "#eab308"
                    : "#d97706",
              }}
            />
            {nextUnlockMeta && !isPaletteUnlocked(nextUnlockMeta.id, best, achState.unlocked) && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted-foreground/60 ml-0.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            )}
          </div>
        </button>

        {/* Audio Mute Toggle Button */}
        <SoundToggle
          className="size-9 rounded-md bg-[var(--background)] border border-[var(--line-strong)] text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-ring"
        />

        {/* Close Button (Overlay mode only) */}
        {onClose && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close game"
            title="Close game (Esc)"
            className="size-9 rounded-md bg-[var(--background)] border border-[var(--line-strong)] text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* First-time Achievement Hint */}
      {showAchHint && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowAchHint(false);
            markSeenAchievementHint();
          }}
          className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-[var(--background)] border border-[var(--line-strong)] rounded-md px-3 py-1.5 font-mono text-xs text-muted-foreground shadow-xs pointer-events-auto transition-opacity duration-300 select-none whitespace-nowrap flex items-center gap-2 cursor-pointer hover:text-foreground"
        >
          <TrophyGlyph className="size-3.5 text-[var(--accent)]" />
          <span>Press [T] for Trophy Shelf · 16 achievements to earn</span>
        </div>
      )}

      {/* Bottom-Center: Hint Chip */}
      {showHint && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 bg-[var(--background)] border border-[var(--line-strong)] rounded-md px-3 py-1.5 font-mono text-xs text-muted-foreground shadow-xs pointer-events-none transition-opacity duration-500 select-none whitespace-nowrap"
        >
          <span className="hidden sm:inline">Space / click: drop · T: trophies · P: pause · M: sound · Esc: close</span>
          <span className="sm:hidden">Tap to drop</span>
        </div>
      )}

      {/* ─── Floating Solid Game-Over Panel ─── */}
      {showGameOverCard && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 z-30 flex items-center justify-center p-4 pointer-events-auto"
        >
          <div className="relative bg-[var(--background)] border border-[var(--line-strong)] rounded-lg p-5 max-w-[340px] w-full shadow-lg text-center space-y-4">
            {/* Landmark humorous line */}
            <p className="text-sm font-sans text-foreground leading-snug">
              {getLandmarkLine(floors)}
            </p>

            {/* Score Display */}
            <div>
              <div
                className="font-serif text-3xl font-normal text-foreground leading-none"
                style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
              >
                {floors} floors
              </div>
              <div className="font-mono text-xs text-muted-foreground mt-1">
                {floors * GAME_CONSTANTS.METRES_PER_FLOOR} m · {perfects} perfects
              </div>
            </div>

            {/* New best celebration */}
            {isNewBest && (
              <div
                className="font-serif text-lg text-[var(--accent)] font-semibold"
                style={{ fontFamily: "var(--font-caveat), cursive" }}
              >
                New best!
              </div>
            )}

            {/* Unlocked this run */}
            {unlockedThisRunRef.current.length > 0 && (
              <div className="border-t border-[var(--line)] pt-3 text-left">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)] mb-1.5 flex items-center justify-between">
                  <span>Unlocked this run</span>
                  <span>+{unlockedThisRunRef.current.length}</span>
                </div>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {unlockedThisRunRef.current.map((ach) => {
                    const Glyph = getAchievementGlyph(ach.id);
                    return (
                      <div
                        key={ach.id}
                        className="flex items-center gap-2 p-1.5 rounded bg-[var(--muted)]/40 border border-[var(--line)]"
                      >
                        <Glyph className="size-4 text-[var(--accent)] shrink-0" />
                        <div className="min-w-0 flex-1 text-left">
                          <div className="text-xs font-semibold text-foreground truncate">
                            {ach.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {ach.flavour}
                          </div>
                        </div>
                        <TierPips tier={ach.tier} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Next goal teaser */}
            {nextGoalAch && (
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground bg-[var(--muted)]/20 px-2.5 py-1.5 rounded border border-[var(--line)] text-left">
                <span className="truncate mr-2">
                  Next: <strong className="text-foreground font-sans font-medium">{nextGoalAch.name}</strong>
                </span>
                {(() => {
                  const p = progressFor(nextGoalAch, achState);
                  return p && p.target > 1 ? (
                    <span className="shrink-0">{p.current}/{p.target}</span>
                  ) : null;
                })()}
              </div>
            )}

            {/* Top 3 Scores */}
            {top3.length >= 2 && (
              <div className="font-mono text-xs text-muted-foreground tracking-wide">
                Your top 3: {top3.join(" / ")}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                data-sound="select"
                onClick={handleTrigger}
                className="w-full py-2 px-4 rounded-md font-mono text-xs font-medium bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-95 transition-opacity cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-ring"
              >
                Play again
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-sound="select"
                  onClick={() => setShowTrophyShelf(true)}
                  className="flex-1 py-1.5 px-3 rounded-md font-mono text-xs bg-[var(--muted)] border border-[var(--line-strong)] text-foreground hover:bg-[var(--line)] transition-colors cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-ring flex items-center justify-center gap-1.5"
                >
                  <TrophyGlyph className="size-3.5 text-[var(--accent)]" />
                  <span>Trophies ({unlockedCount}/16)</span>
                </button>

                <button
                  type="button"
                  data-sound="select"
                  onClick={handleShare}
                  className="flex-1 py-1.5 px-3 rounded-md font-mono text-xs bg-[var(--muted)] border border-[var(--line-strong)] text-foreground hover:bg-[var(--line)] transition-colors cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {shareFeedback || "Share score"}
                </button>

                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-1.5 px-3 rounded-md font-mono text-xs bg-[var(--muted)] border border-[var(--line-strong)] text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Overlays: Toasts & Trophy Shelf Modal ─── */}
      <AchievementToastContainer
        toasts={activeToasts}
        onDismiss={dismissToast}
      />

      <TrophyShelf
        isOpen={showTrophyShelf}
        onClose={() => setShowTrophyShelf(false)}
        state={achState}
      />
    </div>
  );
}
