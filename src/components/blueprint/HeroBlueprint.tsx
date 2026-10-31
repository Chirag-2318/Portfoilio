"use client";

import * as React from "react";
import { site } from "@/content/site";
import { AvatarBadge } from "@/components/blueprint/AvatarBadge";
import { Dimension } from "@/components/blueprint/Dimension";
import { HandwrittenNote } from "@/components/blueprint/HandwrittenNote";

interface HeroBlueprintProps {
  hasPhoto: boolean;
}

export function HeroBlueprint({ hasPhoto }: HeroBlueprintProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const spotlightRef = React.useRef<HTMLDivElement>(null);
  const rafId = React.useRef<number | null>(null);

  // Sound toggle (persisted in localStorage, default on)
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [spotlightVisible, setSpotlightVisible] = React.useState(false);
  const [isReducedMotion, setIsReducedMotion] = React.useState(false);
  const [isCoarse, setIsCoarse] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("blueprint_sound");
      if (stored !== null) {
        setSoundEnabled(stored === "true");
      }
    } catch {
      // localStorage unavailable
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(motionQuery.matches);

    const coarseQuery = window.matchMedia("(pointer: coarse)");
    setIsCoarse(coarseQuery.matches);
  }, []);

  const toggleSound = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("blueprint_sound", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Soft tick sound (40ms sine blip around 580Hz, gain 0.04)
  const playTick = React.useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(580, ctx.currentTime);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio not supported
    }
  }, [soundEnabled]);

  // Cursor follow spotlight
  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isCoarse || isReducedMotion || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.style.setProperty("--mx", `${x}px`);
          containerRef.current.style.setProperty("--my", `${y}px`);
        }
        if (!spotlightVisible) {
          setSpotlightVisible(true);
        }
      });
    },
    [isCoarse, isReducedMotion, spotlightVisible]
  );

  const handlePointerLeave = React.useCallback(() => {
    setSpotlightVisible(false);
  }, []);

  return (
    <div
      ref={containerRef}
      id="top"
      onClick={playTick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative mx-auto max-w-3xl w-full border-x border-[var(--line)] screen-line-bottom overflow-y-clip select-none h-[320px] sm:h-[500px] grid grid-cols-[auto_1fr] grid-rows-[1fr_auto] bg-[var(--background)] cursor-pointer"
      style={
        {
          "--mx": "50%",
          "--my": "50%",
        } as React.CSSProperties
      }
    >
      {/* 1. Base Blueprint Drawing (z-0, low contrast) */}
      <div
        className="absolute inset-0 pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        <BlueprintDrawing mode="base" />
      </div>

      {/* 2. Cursor follow copy with radial mask (z-[1]) */}
      {!isCoarse && !isReducedMotion && (
        <div
          ref={spotlightRef}
          className="absolute inset-0 pointer-events-none select-none z-[1] transition-opacity duration-300"
          style={{
            opacity: spotlightVisible ? 1 : 0,
            maskImage: "radial-gradient(180px circle at var(--mx) var(--my), black, transparent)",
            WebkitMaskImage: "radial-gradient(180px circle at var(--mx) var(--my), black, transparent)",
          }}
          aria-hidden="true"
        >
          <BlueprintDrawing mode="highlight" />
        </div>
      )}

      {/* Top spacer grid row */}
      <div className="col-span-2 min-h-0 pointer-events-none" />

      {/* 3. Avatar block (left grid cell, bottom aligned) */}
      <div className="relative z-10 self-end screen-line-top border-r border-[var(--line)] -mx-px flex items-end justify-center p-2 sm:p-3 bg-[var(--background)]">
        {/* Vertical Ø160 dimension to the left (hidden below lg) */}
        <div className="hidden lg:block absolute -left-10 top-0 bottom-0 w-6">
          <Dimension label="Ø160" variant="vertical" className="h-full left-1/2" />
        </div>

        <AvatarBadge hasPhoto={hasPhoto} />
      </div>

      {/* 4. Name block (right grid cell, bottom aligned) */}
      <div className="relative z-10 self-end flex flex-col justify-end min-w-0 bg-[var(--background)]">
        {/* Row 1: border-t, pl-4, name + speaker button */}
        <div className="border-t border-[var(--line)] pl-2.5 sm:pl-4 pr-1 sm:pr-3 py-1.5 sm:py-2 flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2">
          <h1 className="text-[1.625rem] min-[410px]:text-[1.875rem] sm:text-[2rem] leading-none font-medium tracking-tight text-foreground whitespace-nowrap">
            {site.name.full}
          </h1>

          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundEnabled ? "Mute interactive click sound" : "Enable interactive click sound"}
            title={soundEnabled ? "Mute tick sound" : "Enable tick sound"}
            className="size-7 sm:size-8 rounded-[10px] shrink-0 inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[var(--muted)] active:scale-[0.98] transition-all"
          >
            {soundEnabled ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
          </button>
        </div>

        {/* Row 2: border-t, h-12.5 on mobile and h-9 on sm+, py-1 pl-4: tagline with blur-in */}
        <div className="border-t border-[var(--line)] h-[50px] sm:h-9 py-1 pl-2.5 sm:pl-4 pr-2 sm:pr-3 flex items-center">
          <p className="font-mono text-xs sm:text-sm text-balance text-muted-foreground leading-tight hero-entrance">
            {site.home.tagline}
          </p>
        </div>
      </div>

      {/* Handwritten note (right side, outside column, bottom-20): "follows your cursor" / "click for a sound" */}
      <HandwrittenNote
        side="right"
        arrow="curved-down-left"
        className="bottom-20"
      >
        follows your cursor · click for a sound
      </HandwrittenNote>
    </div>
  );
}

/** Original Isometric Blueprint Drawing with Monogram CP on 30-degree axes */
function BlueprintDrawing({ mode }: { mode: "base" | "highlight" }) {
  const isBase = mode === "base";
  const strokeColor = isBase ? "var(--line-strong)" : "var(--foreground)";
  const strokeOpacity = isBase ? "0.6" : "0.55";

  return (
    <svg
      viewBox="0 0 768 500"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full overflow-visible"
    >
      <defs>
        {/* Fine 45-degree hatching SVG pattern (1px lines every 4px, opacity 0.55) */}
        <pattern
          id={`blueprint-hatch-${mode}`}
          width="4"
          height="4"
          patternTransform="rotate(45)"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="4"
            stroke={strokeColor}
            strokeWidth="1"
            strokeOpacity="0.55"
          />
        </pattern>
      </defs>

      {/* Two very long faint construction diagonals crossing hero corner to corner and running beyond */}
      <line
        x1="-600"
        y1="-390"
        x2="1368"
        y2="890"
        stroke={strokeColor}
        strokeWidth="1"
        strokeOpacity={isBase ? "0.25" : "0.4"}
        strokeDasharray="6 4"
      />
      <line
        x1="-600"
        y1="890"
        x2="1368"
        y2="-390"
        stroke={strokeColor}
        strokeWidth="1"
        strokeOpacity={isBase ? "0.25" : "0.4"}
        strokeDasharray="6 4"
      />

      {/* Isometric Monogram "CP" built from extruded isometric slabs on 30-degree axes
          In 30-degree isometric:
          Vector X (down-right): dx = cos(30)*L = 0.866*L, dy = sin(30)*L = 0.5*L
          Vector Y (down-left):  dx = -cos(30)*L = -0.866*L, dy = sin(30)*L = 0.5*L
          Vector Z (vertical):   dx = 0, dy = -H
      */}
      <g
        stroke={strokeColor}
        strokeWidth="1"
        strokeOpacity={strokeOpacity}
        fill="none"
      >
        {/* ─── Letter 'C' Slabs (Centered around x=330, y=170) ─── */}
        {/* C - Back vertical spine */}
        <g>
          {/* Top Face */}
          <polygon
            points="280,120 310,137 280,154 250,137"
            fill={`url(#blueprint-hatch-${mode})`}
          />
          {/* Left Face */}
          <polygon points="250,137 280,154 280,254 250,237" />
          {/* Right Face */}
          <polygon points="280,154 310,137 310,237 280,254" />
        </g>

        {/* C - Top horizontal arm */}
        <g>
          {/* Top Face */}
          <polygon
            points="310,137 390,183 360,200 280,154"
            fill={`url(#blueprint-hatch-${mode})`}
          />
          {/* Front / Left Edge */}
          <polygon points="280,154 360,200 360,230 280,184" />
          {/* Right Edge */}
          <polygon points="360,200 390,183 390,213 360,230" />
        </g>

        {/* C - Bottom horizontal arm */}
        <g>
          {/* Top Face */}
          <polygon
            points="310,237 390,283 360,300 280,254"
            fill={`url(#blueprint-hatch-${mode})`}
          />
          {/* Front / Left Edge */}
          <polygon points="280,254 360,300 360,330 280,284" />
          {/* Right Edge */}
          <polygon points="360,300 390,283 390,313 360,330" />
        </g>

        {/* ─── Letter 'P' Slabs (Centered around x=470, y=170) ─── */}
        {/* P - Main vertical stem */}
        <g>
          {/* Top Face */}
          <polygon
            points="440,120 470,137 440,154 410,137"
            fill={`url(#blueprint-hatch-${mode})`}
          />
          {/* Left Face */}
          <polygon points="410,137 440,154 440,320 410,303" />
          {/* Right Face */}
          <polygon points="440,154 470,137 470,303 440,320" />
        </g>

        {/* P - Top arm */}
        <g>
          {/* Top Face */}
          <polygon
            points="470,137 540,177 510,194 440,154"
            fill={`url(#blueprint-hatch-${mode})`}
          />
          {/* Front Face */}
          <polygon points="440,154 510,194 510,224 440,184" />
          {/* Right Face */}
          <polygon points="510,194 540,177 540,207 510,224" />
        </g>

        {/* P - Outer vertical loop edge */}
        <g>
          {/* Top Face */}
          <polygon
            points="540,177 570,194 540,211 510,194"
            fill={`url(#blueprint-hatch-${mode})`}
          />
          {/* Left Face */}
          <polygon points="510,194 540,211 540,261 510,244" />
          {/* Right Face */}
          <polygon points="540,211 570,194 570,244 540,261" />
        </g>

        {/* P - Middle return arm */}
        <g>
          {/* Top Face */}
          <polygon
            points="470,207 540,247 510,264 440,224"
            fill={`url(#blueprint-hatch-${mode})`}
          />
          {/* Front Face */}
          <polygon points="440,224 510,264 510,294 440,254" />
          {/* Right Face */}
          <polygon points="510,264 540,247 540,277 510,294" />
        </g>

        {/* 30° angle label with a small arc at one slab corner */}
        <g transform="translate(570, 194)">
          <path
            d="M 0 0 L 50 0"
            stroke={strokeColor}
            strokeWidth="0.75"
            strokeDasharray="2 2"
          />
          <path
            d="M 0 0 L 43.3 25"
            stroke={strokeColor}
            strokeWidth="0.75"
          />
          {/* Arc */}
          <path
            d="M 28 0 A 28 28 0 0 1 24.2 14"
            stroke="var(--info)"
            strokeWidth="1"
          />
          <text
            x="34"
            y="12"
            fill="var(--dimension-foreground)"
            fontSize="10"
            fontFamily="monospace"
            textAnchor="start"
            stroke="none"
          >
            30°
          </text>
        </g>

        {/* Technical reference hairline marks */}
        <circle cx="280" cy="120" r="1.5" fill={strokeColor} />
        <circle cx="440" cy="120" r="1.5" fill={strokeColor} />
        <circle cx="570" cy="194" r="1.5" fill={strokeColor} />
        <line x1="280" y1="120" x2="440" y2="120" stroke={strokeColor} strokeWidth="0.5" strokeDasharray="3 3" />
      </g>
    </svg>
  );
}
