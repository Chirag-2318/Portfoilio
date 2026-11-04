"use client";

import * as React from "react";
import { MOTION_DURATIONS, MOTION_EASINGS } from "../motion-tokens";

interface GhostEchoHeadlineProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  targetId?: string;
  cloneCount?: number;
}

export function GhostEchoHeadline({
  text,
  className = "",
  style,
  targetId,
  cloneCount = 5,
}: GhostEchoHeadlineProps) {
  const containerRef = React.useRef<HTMLSpanElement | null>(null);
  const [phase, setPhase] = React.useState<"idle" | "animating" | "settled">("idle");
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      setPrefersReducedMotion(true);
      setPhase("settled");
      return;
    }

    // Monitor parent element for data-build-state transitions
    const element = containerRef.current?.closest("[data-build-id]") || containerRef.current;
    if (!element) return;

    const checkState = () => {
      const state = element.getAttribute("data-build-state");
      if (state === "filling" && phase === "idle") {
        setPhase("animating");
      } else if (state === "done") {
        setPhase("settled");
      }
    };

    checkState();

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "data-build-state") {
          checkState();
        }
      }
    });

    observer.observe(element, { attributes: true, attributeFilter: ["data-build-state"] });

    return () => observer.disconnect();
  }, [phase]);

  // Clean up clone layers after animation duration
  React.useEffect(() => {
    if (phase === "animating") {
      const timer = setTimeout(() => {
        setPhase("settled");
      }, MOTION_DURATIONS.slow + 60);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const isAnimating = phase === "animating" && !prefersReducedMotion;

  // Clone configurations: offset decaying in Y and slight X
  const clones = React.useMemo(() => {
    return Array.from({ length: cloneCount }, (_, i) => {
      const step = cloneCount - i;
      const offsetY = -(step * 7.5);
      const offsetX = (i % 2 === 0 ? 1 : -1) * (step * 1.2);
      const opacity = 0.38 * Math.pow(0.62, i);
      return { id: i, offsetY, offsetX, opacity };
    });
  }, [cloneCount]);

  return (
    <span
      ref={containerRef}
      className={`relative inline-block ${className}`}
      style={style}
    >
      {/* 1. Real Text: permanently selectable, screen-reader readable */}
      <span className="relative z-10 block select-text">
        {text}
      </span>

      {/* 2. Ghost Echo Layers: aria-hidden clones collapsing onto real text */}
      {isAnimating && (
        <span
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none select-none z-0 overflow-visible"
        >
          {clones.map((c) => (
            <span
              key={c.id}
              className="absolute inset-0 block text-foreground pointer-events-none"
              style={{
                opacity: c.opacity,
                transform: `translate3d(${c.offsetX}px, ${c.offsetY}px, 0)`,
                animation: `ghostEchoCollapse ${MOTION_DURATIONS.slow}ms ${MOTION_EASINGS.expoOut} forwards`,
                willChange: "transform, opacity",
              }}
            >
              {text}
            </span>
          ))}

          {/* 3. Horizontal Slice Bands (with subtle X displacement settling to zero) */}
          <span
            className="absolute inset-0 block text-foreground pointer-events-none opacity-40"
            style={{
              clipPath: "polygon(0% 18%, 100% 18%, 100% 36%, 0% 36%)",
              transform: "translate3d(3px, 0, 0)",
              animation: `sliceSettle 220ms ${MOTION_EASINGS.snap} forwards`,
            }}
          >
            {text}
          </span>
          <span
            className="absolute inset-0 block text-foreground pointer-events-none opacity-40"
            style={{
              clipPath: "polygon(0% 50%, 100% 50%, 100% 68%, 0% 68%)",
              transform: "translate3d(-4px, 0, 0)",
              animation: `sliceSettle 220ms ${MOTION_EASINGS.snap} forwards`,
            }}
          >
            {text}
          </span>
        </span>
      )}

      {/* Dynamic Keyframes for Ghost Echo Collapse */}
      <style jsx global>{`
        @keyframes ghostEchoCollapse {
          0% {
            opacity: inherit;
            transform: inherit;
          }
          100% {
            opacity: 0;
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes sliceSettle {
          0% {
            transform: inherit;
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </span>
  );
}
