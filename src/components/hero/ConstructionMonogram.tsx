"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface ConstructionMonogramProps {
  isHeroHovered?: boolean;
}

export function ConstructionMonogram({ isHeroHovered = false }: ConstructionMonogramProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [introFinished, setIntroFinished] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);

    const listener = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    media.addEventListener("change", listener);

    const timer = setTimeout(() => {
      setIntroFinished(true);
    }, 1800);

    return () => {
      clearTimeout(timer);
      media.removeEventListener("change", listener);
    };
  }, []);

  // Geometry paths (before +4 shift)
  const pathC = "M414.8 128.4 A100 100 0 1 0 414.8 251.6";
  const pathPStem = "M468 90 V290";
  const pathPBowl = "M468 90 A56 56 0 0 1 468 202";

  const showAnimation = isMounted && !reducedMotion;

  return (
    <div className="w-full h-full flex items-center justify-center select-none pointer-events-none">
      <svg
        viewBox="0 0 768 400"
        preserveAspectRatio="xMidYMid meet"
        className="w-[268.8px] sm:w-[403.2px] h-[140px] sm:h-[210px] overflow-visible block"
      >
        {/* Whole composition shifted by +4 to center 312px bounding box at x = 384 */}
        <g transform="translate(4, 0)">
          {/* ─── 1. Construction Layer (thin 1px, var(--line-strong)) ─── */}
          <g
            className="transition-opacity duration-250 ease-out"
            style={{
              opacity: isHeroHovered ? 0.8 : introFinished || reducedMotion ? 0.45 : 0.7,
            }}
          >
            {/* Horizontal construction lines at y = 90, 190, 290 extending 40 units beyond letters (184 to 576) */}
            <motion.line
              x1="184"
              y1="90"
              x2="576"
              y2="90"
              stroke="var(--line-strong)"
              strokeWidth="1"
              initial={{ pathLength: showAnimation ? 0 : 1 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0 }}
            />
            <motion.line
              x1="184"
              y1="190"
              x2="576"
              y2="190"
              stroke="var(--line-strong)"
              strokeWidth="1"
              initial={{ pathLength: showAnimation ? 0 : 1 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            />
            <motion.line
              x1="184"
              y1="290"
              x2="576"
              y2="290"
              stroke="var(--line-strong)"
              strokeWidth="1"
              initial={{ pathLength: showAnimation ? 0 : 1 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            />

            {/* Vertical tangent lines at x = 236, 436, 468 extending 30 units beyond top & bottom (48 to 332) */}
            <motion.line
              x1="236"
              y1="48"
              x2="236"
              y2="332"
              stroke="var(--line-strong)"
              strokeWidth="1"
              initial={{ pathLength: showAnimation ? 0 : 1 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            />
            <motion.line
              x1="436"
              y1="48"
              x2="436"
              y2="332"
              stroke="var(--line-strong)"
              strokeWidth="1"
              initial={{ pathLength: showAnimation ? 0 : 1 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.25 }}
            />
            <motion.line
              x1="468"
              y1="48"
              x2="468"
              y2="332"
              stroke="var(--line-strong)"
              strokeWidth="1"
              initial={{ pathLength: showAnimation ? 0 : 1 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
            />

            {/* Concentric construction circles at (336, 190): r = 88, 100, 112 */}
            <motion.circle
              cx="336"
              cy="190"
              r="88"
              fill="none"
              stroke="var(--line-strong)"
              strokeWidth="1"
              initial={{ pathLength: showAnimation ? 0 : 1 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            />
            <motion.circle
              cx="336"
              cy="190"
              r="100"
              fill="none"
              stroke="var(--line-strong)"
              strokeWidth="1"
              initial={{ pathLength: showAnimation ? 0 : 1 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.25 }}
            />
            <motion.circle
              cx="336"
              cy="190"
              r="112"
              fill="none"
              stroke="var(--line-strong)"
              strokeWidth="1"
              initial={{ pathLength: showAnimation ? 0 : 1 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            />

            {/* Bowl construction circle at (468, 146): r = 56 */}
            <motion.circle
              cx="468"
              cy="146"
              r="56"
              fill="none"
              stroke="var(--line-strong)"
              strokeWidth="1"
              initial={{ pathLength: showAnimation ? 0 : 1 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.35 }}
            />

            {/* Center '+' marks at (336, 190) and (468, 146) */}
            <line x1="331" y1="190" x2="341" y2="190" stroke="var(--line-strong)" strokeWidth="1" />
            <line x1="336" y1="185" x2="336" y2="195" stroke="var(--line-strong)" strokeWidth="1" />

            <line x1="463" y1="146" x2="473" y2="146" stroke="var(--line-strong)" strokeWidth="1" />
            <line x1="468" y1="141" x2="468" y2="151" stroke="var(--line-strong)" strokeWidth="1" />

            {/* Dashed radius line from (336, 190) to (414.8, 128.4) */}
            <line
              x1="336"
              y1="190"
              x2="414.8"
              y2="128.4"
              stroke="var(--line-strong)"
              strokeWidth="1"
              strokeDasharray="4 3"
            />

            {/* Exactly two mono labels in var(--dimension-foreground) */}
            <text
              x="365"
              y="152"
              fill="var(--dimension-foreground)"
              className="font-mono text-[11px]"
              textAnchor="middle"
            >
              R = 100
            </text>
            <text
              x="538"
              y="146"
              fill="var(--dimension-foreground)"
              className="font-mono text-[11px]"
              textAnchor="start"
              dominantBaseline="middle"
            >
              r = 56
            </text>
          </g>

          {/* ─── 2. Letter Layer (stroke-width 24, butt caps, var(--foreground)) ─── */}
          {/* Letter C arc */}
          <motion.path
            d={pathC}
            fill="none"
            stroke="var(--foreground)"
            strokeWidth="24"
            strokeLinecap="butt"
            strokeLinejoin="miter"
            initial={{ pathLength: showAnimation ? 0 : 1 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 0.55,
              ease: "easeOut",
              delay: showAnimation ? 0.8 : 0,
            }}
          />

          {/* Letter P Stem */}
          <motion.path
            d={pathPStem}
            fill="none"
            stroke="var(--foreground)"
            strokeWidth="24"
            strokeLinecap="butt"
            strokeLinejoin="miter"
            initial={{ pathLength: showAnimation ? 0 : 1 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
              delay: showAnimation ? 1.1 : 0,
            }}
          />

          {/* Letter P Bowl */}
          <motion.path
            d={pathPBowl}
            fill="none"
            stroke="var(--foreground)"
            strokeWidth="24"
            strokeLinecap="butt"
            strokeLinejoin="miter"
            initial={{ pathLength: showAnimation ? 0 : 1 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 0.55,
              ease: "easeOut",
              delay: showAnimation ? 1.15 : 0,
            }}
          />

          {/* ─── 3. Traveling 4px Pen Tip Dots (active during intro only) ─── */}
          {showAnimation && !introFinished && (
            <motion.circle
              cx="414.8"
              cy="251.6"
              r="2"
              fill="var(--accent)"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 1.8,
                times: [0, 0.45, 0.85, 1],
                ease: "easeOut",
              }}
            />
          )}
        </g>
      </svg>
    </div>
  );
}
