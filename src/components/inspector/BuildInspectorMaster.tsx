"use client";

import * as React from "react";
import { introController } from "@/components/intro/intro-controller";
import { targetRegistry } from "./target-registry";
import { CursorCanvas } from "./CursorCanvas";
import { InspectorOverlay } from "./InspectorOverlay";
import { HERO_STEPS, INSPECTOR_CONFIG } from "./timeline-config";
import type { ActiveSkeletonBox, CursorRole, InspectorGuide } from "./inspector-types";
import { playSound } from "@/components/sound/sound-effects";

export function BuildInspectorMaster() {
  const [active, setActive] = React.useState(false);
  const [origin, setOrigin] = React.useState<{ x: number; y: number } | null>(null);
  const [isSequenceComplete, setIsSequenceComplete] = React.useState(false);
  const [showSkipButton, setShowSkipButton] = React.useState(false);

  // Active state maps passed down to overlays
  const [boxes, setBoxes] = React.useState<Map<string, ActiveSkeletonBox>>(new Map());
  const [guides, setGuides] = React.useState<InspectorGuide[]>([]);
  const [cursorTargets, setCursorTargets] = React.useState<
    Map<number, { x: number; y: number; role: CursorRole; isActionActive: boolean }>
  >(new Map());

  // Master timeline state refs (for 60fps rAF loop without React state churn)
  const animFrameRef = React.useRef<number | null>(null);
  const startTimeRef = React.useRef<number>(0);
  const speedRef = React.useRef<number>(1.0);
  const completedTargetsRef = React.useRef<Set<string>>(new Set());
  const guideTimersRef = React.useRef<Map<string, number>>(new Map());

  // Complete and restore all elements
  const finishSequence = React.useCallback(() => {
    targetRegistry.setAllDone();
    completedTargetsRef.current = new Set(HERO_STEPS.map((s) => s.targetId));
    setBoxes(new Map());
    setGuides([]);
    setIsSequenceComplete(true);
    setShowSkipButton(false);
    if (typeof document !== "undefined") {
      document.documentElement.removeAttribute("data-build-active");
    }
  }, []);

  // Subscribe to introController "intro:entering"
  React.useEffect(() => {
    const unsubscribe = introController.on("intro:entering", ({ originX, originY }) => {
      // Reduced motion fallback: complete immediately
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) {
        targetRegistry.init();
        targetRegistry.setAllDone();
        setIsSequenceComplete(true);
        return;
      }

      setOrigin({ x: originX, y: originY });
      setActive(true);
      setShowSkipButton(true);
      setIsSequenceComplete(false);
      completedTargetsRef.current.clear();
      speedRef.current = 1.0;

      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-build-active", "true");
      }

      // Initialize targets registry and batch measure
      targetRegistry.init();

      // Start master animation clock
      startTimeRef.current = performance.now();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // User input listeners: Fast-forward on scroll/touch, skip on Esc
  React.useEffect(() => {
    if (!active || isSequenceComplete) return;

    const handleFastForward = () => {
      speedRef.current = 4.0; // Snappy 4x fast-forward on user intent
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        finishSequence();
      }
    };

    window.addEventListener("wheel", handleFastForward, { passive: true });
    window.addEventListener("touchmove", handleFastForward, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    // Absolute failsafe timeout
    const failsafeTimer = setTimeout(() => {
      finishSequence();
    }, INSPECTOR_CONFIG.failsafeTimeoutMs);

    return () => {
      window.removeEventListener("wheel", handleFastForward);
      window.removeEventListener("touchmove", handleFastForward);
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(failsafeTimer);
    };
  }, [active, isSequenceComplete, finishSequence]);

  // Master rAF Timeline Loop
  React.useEffect(() => {
    if (!active || isSequenceComplete) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let virtualElapsed = 0;
    let prevTimestamp = performance.now();

    const tick = (now: number) => {
      const delta = (now - prevTimestamp) * speedRef.current;
      prevTimestamp = now;
      virtualElapsed += delta;

      const newBoxes = new Map<string, ActiveSkeletonBox>();
      const newCursorTargets = new Map<
        number,
        { x: number; y: number; role: CursorRole; isActionActive: boolean }
      >();
      const activeGuides: InspectorGuide[] = [];

      let allHeroDone = true;

      for (let i = 0; i < HERO_STEPS.length; i++) {
        const step = HERO_STEPS[i];
        const target = targetRegistry.getTarget(step.targetId);

        if (!target) {
          continue;
        }

        const stepEnd = step.startMs + step.durationMs;

        if (virtualElapsed < step.startMs) {
          allHeroDone = false;
          // Target still pending
          targetRegistry.setTargetState(step.targetId, "pending");
        } else if (virtualElapsed >= step.startMs && virtualElapsed < stepEnd) {
          allHeroDone = false;
          const progress = Math.max(0, Math.min(1, (virtualElapsed - step.startMs) / step.durationMs));

          // State transition: skeleton -> filling
          const buildState = progress > 0.65 ? "filling" : "skeleton";
          targetRegistry.setTargetState(step.targetId, buildState);

          const rect = target.rect;
          const currentW = Math.max(1, rect.width * progress);
          const currentH = Math.max(1, rect.height * progress);

          newBoxes.set(step.targetId, {
            targetId: step.targetId,
            type: target.type,
            rect,
            lineRects: target.lineRects,
            progress,
            currentW,
            currentH,
            alpha: 1.0,
            state: buildState,
          });

          // Compute cursor motion along target
          let cx = rect.left;
          let cy = rect.top;

          if (step.cursorRole === "drawer") {
            // Drag from top-left to bottom-right
            cx = rect.left + rect.width * progress;
            cy = rect.top + rect.height * progress;
          } else if (step.cursorRole === "typer") {
            // Move horizontally across the line
            cx = rect.left + rect.width * progress;
            cy = rect.top + rect.height / 2;
          } else if (step.cursorRole === "placer") {
            // Drop in center
            cx = rect.left + rect.width / 2;
            cy = rect.top + rect.height / 2;
          }

          newCursorTargets.set(step.cursorIndex, {
            x: cx,
            y: cy,
            role: step.cursorRole,
            isActionActive: true,
          });

          // Alignment Guides
          if (step.guideAxis === "x" || step.guideAxis === "both") {
            activeGuides.push({
              id: `${step.targetId}-guide-x`,
              axis: "x",
              pos: rect.left,
              color: "red",
              alpha: 0.85,
            });
          }
          if (step.guideAxis === "y" || step.guideAxis === "both") {
            activeGuides.push({
              id: `${step.targetId}-guide-y`,
              axis: "y",
              pos: rect.top,
              color: "red",
              alpha: 0.85,
            });
          }
        } else {
          // Completed step
          if (!completedTargetsRef.current.has(step.targetId)) {
            completedTargetsRef.current.add(step.targetId);
            targetRegistry.setTargetState(step.targetId, "done");
            try {
              playSound("tick", { velocity: 0.28 });
            } catch {
              // ignore audio failure
            }
          }
        }
      }

      setBoxes(newBoxes);
      setCursorTargets(newCursorTargets);
      setGuides(activeGuides);

      if (allHeroDone && virtualElapsed >= INSPECTOR_CONFIG.heroTotalDurationMs) {
        finishSequence();
        return;
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [active, isSequenceComplete, finishSequence]);

  // Below-the-fold sections: IntersectionObserver for brisk build
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const builtSections = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute("data-build-section");
            if (sectionId && !builtSections.has(sectionId)) {
              builtSections.add(sectionId);

              // Find targets in this section and reveal briskly
              const targets = entry.target.querySelectorAll<HTMLElement>("[data-build-id]");
              targets.forEach((el, index) => {
                setTimeout(() => {
                  el.setAttribute("data-build-state", "done");
                }, index * 40);
              });
            }
          }
        });
      },
      { threshold: 0.15 }
    );

    const sections = document.querySelectorAll("[data-build-section]");
    sections.forEach((sec) => observer.observe(sec));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <InspectorOverlay
        active={active && !isSequenceComplete}
        boxes={boxes}
        guides={guides}
      />

      <CursorCanvas
        active={active}
        origin={origin}
        cursorTargets={cursorTargets}
        isSequenceComplete={isSequenceComplete}
      />

      {/* Accessible Skip Button / Pill */}
      {showSkipButton && !isSequenceComplete && (
        <button
          type="button"
          onClick={finishSequence}
          aria-label="Skip inspector animation (or press Escape)"
          className="fixed bottom-4 right-4 z-[9995] px-2.5 py-1 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-muted-foreground hover:text-foreground text-xs font-mono shadow-md backdrop-blur-sm transition-all hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
        >
          Skip build <span className="opacity-60 text-[10px] ml-1">[Esc]</span>
        </button>
      )}
    </>
  );
}
