"use client";

import * as React from "react";
import { animate } from "motion/react";
import { EASE_IN_OUT_QUART } from "@/components/motion/ease";
import { useViewTransition } from "@/components/transition/ViewTransitionProvider";

export function Curtain() {
  const { registerCurtain, phase, curtainLabel } = useViewTransition();

  const panelRef = React.useRef<HTMLDivElement>(null);
  const edgeLineRef = React.useRef<HTMLDivElement>(null);
  const labelRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const unregister = registerCurtain({
      cover: async (nextLabel: string) => {
        if (labelRef.current) {
          labelRef.current.textContent = nextLabel;
        }
        const panel = panelRef.current;
        const line = edgeLineRef.current;
        if (!panel || !line) return;

        // Position line for cover wipe (moving upwards from bottom)
        line.style.bottom = "auto";

        await animate(
          (progress: number) => {
            // progress goes 0 -> 1
            const topPercent = (1 - progress) * 100;
            panel.style.clipPath = `inset(${topPercent}% 0 0 0)`;
            line.style.top = `${topPercent}%`;
          },
          {
            duration: 0.36,
            ease: EASE_IN_OUT_QUART,
          }
        );
      },
      uncover: async () => {
        const panel = panelRef.current;
        const line = edgeLineRef.current;
        if (!panel || !line) return;

        // Position line for uncover wipe (bottom moves upwards from bottom to top)
        line.style.top = "auto";

        await animate(
          (progress: number) => {
            // progress goes 0 -> 1
            const bottomPercent = progress * 100;
            panel.style.clipPath = `inset(0 0 ${bottomPercent}% 0)`;
            line.style.bottom = `${bottomPercent}%`;
          },
          {
            duration: 0.38,
            ease: EASE_IN_OUT_QUART,
          }
        );

        // Reset to initial state once uncover is finished
        panel.style.clipPath = "inset(100% 0 0 0)";
        line.style.bottom = "auto";
        line.style.top = "100%";
      },
    });

    return unregister;
  }, [registerCurtain]);

  const isInteractive = phase === "covering" || phase === "revealing";

  return (
    <div
      ref={panelRef}
      aria-hidden="true"
      style={{ clipPath: "inset(100% 0 0 0)" }}
      className={`fixed inset-0 z-60 bg-paper-2 ${
        isInteractive ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* 2px accent leading edge line */}
      <div
        ref={edgeLineRef}
        className="absolute left-0 right-0 h-[2px] bg-accent z-10"
        style={{ top: "100%" }}
      />

      {/* Destination label centre-left */}
      <div className="w-full h-full max-w-[1760px] mx-auto px-[var(--page-x)] flex items-center">
        <span
          ref={labelRef}
          className="label text-ink text-sm md:text-base tracking-widest font-mono select-none"
        >
          {curtainLabel}
        </span>
      </div>
    </div>
  );
}
