"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import DitherWaveBackground from "@/components/patterns/DitherWaveBackground";
import BrailleTerrainBackground from "@/components/patterns/BrailleTerrainBackground";
import ContourMapBackground from "@/components/patterns/ContourMapBackground";

export type ProjectPatternKind = "dither" | "braille" | "contour";

export interface ProjectPatternProps {
  kind: ProjectPatternKind;
  className?: string;
}

export const PATTERN_PALETTES = {
  dark: {
    dither: {
      color: "#2a2a30",
      paperColor: "#0f0f12",
      pixelSize: 2.5,
      density: 0.7,
      speed: 0.8,
      interactive: true,
    },
    braille: {
      color: "#9a9aa6",
      background: "#0c0c0f",
      cellSize: 9,
      scale: 0.06,
      speed: 0.8,
      opacity: 0.7,
    },
    contour: {
      color: "#6f6f7a",
      background: "#0e0e11",
      levels: 14,
      lineWidth: 1,
      speed: 0.8,
    },
  },
  light: {
    dither: {
      color: "#d3d3da",
      paperColor: "#f6f6f8",
      pixelSize: 2.5,
      density: 0.7,
      speed: 0.8,
      interactive: true,
    },
    braille: {
      color: "#6e6e7a",
      background: "#f6f6f8",
      cellSize: 9,
      scale: 0.06,
      speed: 0.8,
      opacity: 0.55,
    },
    contour: {
      color: "#a9a9b4",
      background: "#f6f6f8",
      levels: 14,
      lineWidth: 1,
      speed: 0.8,
    },
  },
} as const;

export function ProjectPattern({ kind, className = "" }: ProjectPatternProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    setIsTouch(window.matchMedia("(hover: none)").matches);

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const themeKey = mounted && resolvedTheme === "light" ? "light" : "dark";
  const palette = PATTERN_PALETTES[themeKey];
  const speedMultiplier = isTouch ? 0.5 : 1.0;

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full bg-[var(--muted)] transition-opacity duration-200 ${className}`}
      aria-hidden="true"
    >
      {mounted && inView && (
        <>
          {kind === "dither" && (
            <DitherWaveBackground
              color={palette.dither.color}
              paperColor={palette.dither.paperColor}
              pixelSize={palette.dither.pixelSize}
              density={palette.dither.density}
              speed={palette.dither.speed * speedMultiplier}
              interactive={palette.dither.interactive && !isTouch}
            />
          )}
          {kind === "braille" && (
            <BrailleTerrainBackground
              color={palette.braille.color}
              background={palette.braille.background}
              cellSize={palette.braille.cellSize}
              scale={palette.braille.scale}
              speed={palette.braille.speed * speedMultiplier}
              opacity={palette.braille.opacity}
            />
          )}
          {kind === "contour" && (
            <ContourMapBackground
              color={palette.contour.color}
              background={palette.contour.background}
              levels={palette.contour.levels}
              lineWidth={palette.contour.lineWidth}
              speed={palette.contour.speed * speedMultiplier}
            />
          )}
        </>
      )}
    </div>
  );
}
export default ProjectPattern;

