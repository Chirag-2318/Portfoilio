"use client";

import * as React from "react";
import { useMotionValue, useSpring, animate, type AnimationPlaybackControls } from "motion/react";
import { EASE_IN_OUT_QUART, useMotionOK } from "@/components/motion/ease";
import { useDraft } from "@/components/home/DraftContext";

let autoSweepSessionPlayed = false;

export function useLens({
  stageRef,
  draftRef,
  ringRef,
}: {
  stageRef: React.RefObject<HTMLDivElement | null>;
  draftRef: React.RefObject<HTMLDivElement | null>;
  ringRef: React.RefObject<SVGSVGElement | null>;
}) {
  const motionOK = useMotionOK();
  const { draft } = useDraft();

  const userInteractedRef = React.useRef(false);
  const stageRectRef = React.useRef<DOMRect | null>(null);
  const isPointerDownRef = React.useRef(false);
  const activeSweepAnimRef = React.useRef<AnimationPlaybackControls[] | null>(null);

  // Raw target motion values
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rawR = useMotionValue(0);

  // Smooth springs for cursor movement
  const springConfig = motionOK
    ? { stiffness: 420, damping: 38 }
    : { stiffness: 10000, damping: 100 };

  const x = useSpring(rawX, springConfig);
  const y = useSpring(rawY, springConfig);
  const r = useSpring(rawR, springConfig);

  const measureStage = React.useCallback(() => {
    if (stageRef.current) {
      stageRectRef.current = stageRef.current.getBoundingClientRect();
    }
  }, [stageRef]);

  // Cache SVG ring children to eliminate querySelector during animation frames
  const ringElementsRef = React.useRef<{
    circle: Element | null;
    tickN: Element | null;
    tickS: Element | null;
    tickW: Element | null;
    tickE: Element | null;
    label: Element | null;
  } | null>(null);

  const prevRRef = React.useRef<number>(0);

  // Update overlay clipPath and SVG ring on frame
  React.useEffect(() => {
    let animId: number;

    const render = () => {
      const curX = x.get();
      const curY = y.get();
      const curR = r.get();

      // If lens is closed and remained closed, skip DOM operations
      if (curR < 0.5 && prevRRef.current < 0.5 && !draft) {
        animId = requestAnimationFrame(render);
        return;
      }
      prevRRef.current = curR;

      if (stageRectRef.current && draftRef.current) {
        const localX = curX - stageRectRef.current.left;
        const localY = curY - stageRectRef.current.top;
        draftRef.current.style.clipPath = `circle(${Math.max(0, curR)}px at ${localX}px ${localY}px)`;
      }

      if (ringRef.current && stageRectRef.current) {
        const localX = curX - stageRectRef.current.left;
        const localY = curY - stageRectRef.current.top;

        if (curR < 4 || draft) {
          ringRef.current.style.opacity = "0";
        } else {
          ringRef.current.style.opacity = "1";
          ringRef.current.style.transform = `translate3d(${localX}px, ${localY}px, 0)`;

          // Initialize cached child references once
          if (!ringElementsRef.current) {
            ringElementsRef.current = {
              circle: ringRef.current.querySelector(".loupe-circle"),
              tickN: ringRef.current.querySelector(".tick-n"),
              tickS: ringRef.current.querySelector(".tick-s"),
              tickW: ringRef.current.querySelector(".tick-w"),
              tickE: ringRef.current.querySelector(".tick-e"),
              label: ringRef.current.querySelector(".loupe-label"),
            };
          }

          const els = ringElementsRef.current;
          if (els.circle) els.circle.setAttribute("r", `${curR}`);
          if (els.tickN) {
            els.tickN.setAttribute("y1", `${-curR}`);
            els.tickN.setAttribute("y2", `${-curR - 6}`);
          }
          if (els.tickS) {
            els.tickS.setAttribute("y1", `${curR}`);
            els.tickS.setAttribute("y2", `${curR + 6}`);
          }
          if (els.tickW) {
            els.tickW.setAttribute("x1", `${-curR}`);
            els.tickW.setAttribute("x2", `${-curR - 6}`);
          }
          if (els.tickE) {
            els.tickE.setAttribute("x1", `${curR}`);
            els.tickE.setAttribute("x2", `${curR + 6}`);
          }
          if (els.label) {
            els.label.setAttribute("y", `${curR + 15}`);
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [x, y, r, draft, draftRef, ringRef, stageRef]);

  // Draft mode full expansion / collapse animation
  React.useEffect(() => {
    measureStage();

    if (draft) {
      // If lens hasn't moved yet, center on name element
      if (rawX.get() === 0 && rawY.get() === 0) {
        const nameEl = stageRef.current?.querySelector("[data-name]");
        if (nameEl) {
          const rect = nameEl.getBoundingClientRect();
          rawX.set(rect.left + rect.width / 2);
          rawY.set(rect.top + rect.height / 2);
        } else if (stageRectRef.current) {
          rawX.set(stageRectRef.current.left + stageRectRef.current.width / 2);
          rawY.set(stageRectRef.current.top + stageRectRef.current.height / 2);
        }
      }

      if (motionOK) {
        animate(rawR, 2400, {
          duration: 0.6,
          ease: EASE_IN_OUT_QUART,
        });
      } else {
        rawR.set(2400);
      }
    } else {
      if (motionOK) {
        animate(rawR, 0, {
          duration: 0.5,
          ease: EASE_IN_OUT_QUART,
        });
      } else {
        rawR.set(0);
      }
    }
  }, [draft, motionOK, rawR, rawX, rawY, stageRef, measureStage]);

  // Intro Auto-sweep: plays once per session if pointer hasn't moved
  React.useEffect(() => {
    if (autoSweepSessionPlayed || !motionOK) return;

    const timer = setTimeout(() => {
      if (userInteractedRef.current) return;
      autoSweepSessionPlayed = true;

      const nameEl = stageRef.current?.querySelector("[data-name]");
      if (!nameEl) return;

      measureStage();
      const rect = nameEl.getBoundingClientRect();
      const startX = rect.left + 20;
      const endX = rect.right - 20;
      const centerY = rect.top + rect.height / 2;

      const isTouch = window.matchMedia("(hover: none)").matches;
      const peakR = isTouch ? 96 : 110;

      rawX.set(startX);
      rawY.set(centerY);

      const animX = animate(rawX, endX, {
        duration: 0.9,
        ease: EASE_IN_OUT_QUART,
      });

      const animR = animate(rawR, [0, peakR, peakR, 0], {
        times: [0, 0.22, 0.78, 1],
        duration: 0.9,
        ease: "easeInOut",
      });

      activeSweepAnimRef.current = [animX, animR];
    }, 1800);

    return () => clearTimeout(timer);
  }, [motionOK, stageRef, rawX, rawY, rawR, measureStage]);

  const cancelSweep = React.useCallback(() => {
    if (activeSweepAnimRef.current) {
      activeSweepAnimRef.current.forEach((a) => a.stop());
      activeSweepAnimRef.current = null;
    }
  }, []);

  // Event handlers for the stage
  const onPointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      userInteractedRef.current = true;
      cancelSweep();

      if (!stageRectRef.current) measureStage();

      rawX.set(e.clientX);
      rawY.set(e.clientY);

      if (draft) return;

      const target = e.target as HTMLElement | null;
      const isInteractive = Boolean(
        target?.closest('a, button, [role="button"], input, [data-lens-shrink]')
      );

      const isFine = window.matchMedia("(pointer: fine)").matches;

      if (isPointerDownRef.current && !isInteractive) {
        rawR.set(180);
      } else if (isInteractive) {
        rawR.set(36);
      } else {
        rawR.set(isFine ? 120 : 96);
      }
    },
    [cancelSweep, measureStage, draft, rawX, rawY, rawR]
  );

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      userInteractedRef.current = true;
      cancelSweep();
      isPointerDownRef.current = true;

      const target = e.target as HTMLElement | null;
      const isInteractive = Boolean(
        target?.closest('a, button, [role="button"], input, [data-lens-shrink]')
      );

      if (!draft) {
        if (isInteractive) {
          rawR.set(36);
        } else {
          rawR.set(180);
        }
      }
    },
    [cancelSweep, draft, rawR]
  );

  const onPointerUp = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      isPointerDownRef.current = false;
      if (draft) return;

      const target = e.target as HTMLElement | null;
      const isInteractive = Boolean(
        target?.closest('a, button, [role="button"], input, [data-lens-shrink]')
      );
      const isFine = window.matchMedia("(pointer: fine)").matches;

      rawR.set(isInteractive ? 36 : isFine ? 120 : 96);
    },
    [draft, rawR]
  );

  const onPointerLeave = React.useCallback(() => {
    cancelSweep();
    isPointerDownRef.current = false;
    if (!draft) {
      rawR.set(0);
    }
  }, [cancelSweep, draft, rawR]);

  React.useEffect(() => {
    measureStage();
    window.addEventListener("resize", measureStage);
    window.addEventListener("scroll", measureStage, true);
    window.addEventListener("blur", onPointerLeave);

    return () => {
      window.removeEventListener("resize", measureStage);
      window.removeEventListener("scroll", measureStage, true);
      window.removeEventListener("blur", onPointerLeave);
    };
  }, [measureStage, onPointerLeave]);

  return {
    onPointerMove,
    onPointerDown,
    onPointerUp,
    onPointerLeave,
  };
}

