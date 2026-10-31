"use client";

import * as React from "react";
import { site } from "@/content/site";
import { AvatarBadge } from "@/components/blueprint/AvatarBadge";
import { HandwrittenNote } from "@/components/blueprint/HandwrittenNote";

interface HeroBlueprintProps {
  hasPhoto: boolean;
}

interface CalloutPin {
  id: number;
  num: number;
  x: number;
  y: number;
}

export function HeroBlueprint({ hasPhoto }: HeroBlueprintProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const crosshairXRef = React.useRef<HTMLDivElement>(null);
  const crosshairYRef = React.useRef<HTMLDivElement>(null);
  const readoutRef = React.useRef<HTMLDivElement>(null);

  const [pins, setPins] = React.useState<CalloutPin[]>([]);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [isCrosshairActive, setIsCrosshairActive] = React.useState(false);
  const [isReducedMotion, setIsReducedMotion] = React.useState(false);
  const [isFinePointer, setIsFinePointer] = React.useState(false);

  // Easing coordinates for crosshair lag (~80ms)
  const targetPos = React.useRef({ x: 0, y: 0 });
  const currentPos = React.useRef({ x: 0, y: 0 });
  const rafId = React.useRef<number | null>(null);

  const currentYear = new Date().getFullYear();

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("hero_muted");
      if (stored !== null) {
        setSoundEnabled(stored !== "true");
      }
    } catch {
      // localStorage unavailable
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(motionQuery.matches);

    const fineQuery = window.matchMedia("(pointer: fine)");
    setIsFinePointer(fineQuery.matches);
  }, []);

  const toggleMute = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("hero_muted", String(!next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Web Audio soft tick sound (40ms sine blip, 520-640Hz rising step per pin, gain 0.03)
  const playPinTick = React.useCallback(
    (pinNum: number) => {
      if (!soundEnabled) return;
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        if (ctx.state === "suspended") {
          ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // 520Hz to 640Hz rising per pin
        const freq = 520 + (pinNum - 1) * 30;
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.04);
      } catch {
        // Audio unavailable
      }
    },
    [soundEnabled]
  );

  // RAF loop for CAD crosshair with 80ms easing lag
  const animateCrosshair = React.useCallback(() => {
    // Easing factor ~0.35 gives ~80ms 2-frame response
    const ease = 0.35;
    currentPos.current.x += (targetPos.current.x - currentPos.current.x) * ease;
    currentPos.current.y += (targetPos.current.y - currentPos.current.y) * ease;

    const x = Math.round(currentPos.current.x);
    const y = Math.round(currentPos.current.y);

    if (crosshairXRef.current) {
      crosshairXRef.current.style.transform = `translate3d(${x}px, 0, 0)`;
    }
    if (crosshairYRef.current) {
      crosshairYRef.current.style.transform = `translate3d(0, ${y}px, 0)`;
    }
    if (readoutRef.current) {
      readoutRef.current.style.transform = `translate3d(${x + 12}px, ${y + 12}px, 0)`;
      readoutRef.current.textContent = `x ${x}  y ${y}`;
    }

    rafId.current = requestAnimationFrame(animateCrosshair);
  }, []);

  const handlePointerEnter = React.useCallback(() => {
    if (!isFinePointer || isReducedMotion) return;
    setIsCrosshairActive(true);
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(animateCrosshair);
    }
  }, [animateCrosshair, isFinePointer, isReducedMotion]);

  const handlePointerLeave = React.useCallback(() => {
    setIsCrosshairActive(false);
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isFinePointer || isReducedMotion || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      targetPos.current.x = e.clientX - rect.left;
      targetPos.current.y = e.clientY - rect.top;

      if (!isCrosshairActive) {
        currentPos.current = { ...targetPos.current };
        setIsCrosshairActive(true);
        if (!rafId.current) {
          rafId.current = requestAnimationFrame(animateCrosshair);
        }
      }
    },
    [animateCrosshair, isCrosshairActive, isFinePointer, isReducedMotion]
  );

  // Click drops a numbered callout balloon; 6th click clears and restarts at 1
  const handleHeroClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = Math.round(e.clientX - rect.left);
      const clickY = Math.round(e.clientY - rect.top);

      setPins((prev) => {
        if (prev.length >= 5) {
          // 6th click clears and restarts
          return [];
        }
        const nextNum = prev.length + 1;
        playPinTick(nextNum);
        return [
          ...prev,
          {
            id: Date.now(),
            num: nextNum,
            x: clickX,
            y: clickY,
          },
        ];
      });
    },
    [playPinTick]
  );

  return (
    <div
      ref={containerRef}
      id="top"
      onClick={handleHeroClick}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative mx-auto max-w-3xl w-full border-x border-[var(--line)] screen-line-bottom overflow-y-clip select-none h-[340px] sm:h-[500px] grid grid-cols-[auto_1fr] grid-rows-[1fr_auto] bg-[var(--background)] cursor-crosshair"
    >
      {/* 1. Static Isometric Blueprint Drawing background */}
      <div
        className="absolute inset-0 pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        <BlueprintDrawing />
      </div>

      {/* 2. CAD Crosshair: 1px vertical & 1px horizontal line in var(--accent) at 55% opacity */}
      {isFinePointer && !isReducedMotion && isCrosshairActive && (
        <div
          className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
          aria-hidden="true"
        >
          {/* Vertical 1px line */}
          <div
            ref={crosshairXRef}
            className="absolute top-0 bottom-0 left-0 w-px bg-[var(--accent)] opacity-55 will-change-transform"
          />

          {/* Horizontal 1px line */}
          <div
            ref={crosshairYRef}
            className="absolute left-0 right-0 top-0 h-px bg-[var(--accent)] opacity-55 will-change-transform"
          />

          {/* Coordinates readout */}
          <div
            ref={readoutRef}
            className="absolute top-0 left-0 font-mono text-[11px] text-[var(--accent)] font-medium bg-[var(--background)]/85 px-1 py-0.5 rounded border border-[var(--accent)]/30 will-change-transform shadow-xs"
          >
            x 0  y 0
          </div>
        </div>
      )}

      {/* 3. Numbered Callout Pins (up to 5) */}
      <div
        className="absolute inset-0 pointer-events-none z-30 overflow-hidden"
        aria-hidden="true"
      >
        {pins.map((pin) => (
          <div
            key={pin.id}
            style={{ left: pin.x, top: pin.y }}
            className={`absolute ${
              isReducedMotion ? "" : "animate-pop-in"
            } -translate-x-1.5 translate-y-1.5`}
          >
            {/* SVG Leader line and tick */}
            <svg
              width="36"
              height="28"
              viewBox="0 0 36 28"
              fill="none"
              className="overflow-visible absolute -top-5 -left-1"
            >
              {/* Leader from click origin (4,24) to (18,8) then horizontal to (34,8) */}
              <line
                x1="4"
                y1="24"
                x2="18"
                y2="8"
                stroke="var(--accent)"
                strokeWidth="1.25"
              />
              <line
                x1="18"
                y1="8"
                x2="34"
                y2="8"
                stroke="var(--accent)"
                strokeWidth="1.25"
              />
              {/* Dot at target point */}
              <circle cx="4" cy="24" r="2" fill="var(--accent)" />
            </svg>

            {/* 18px circle with accent outline and number inside */}
            <div className="absolute left-7 -top-5 size-[18px] rounded-full border border-[var(--accent)] bg-[var(--background)] flex items-center justify-center shadow-xs">
              <span className="font-mono text-[10px] font-bold text-[var(--accent)] leading-none tabular-nums">
                {pin.num}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Desktop Title Block (bottom-right corner, 2 cols x 3 rows table) */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute right-3 bottom-24 z-15 pointer-events-none select-none font-mono text-[10px] bg-[var(--background)] border border-[var(--line-strong)]"
      >
        <div className="grid grid-cols-2 divide-x divide-[var(--line-strong)] border-b border-[var(--line-strong)]">
          <div className="px-2 py-1 text-muted-foreground">DRAWN BY</div>
          <div className="px-2 py-1 font-medium text-foreground">C.P.</div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-[var(--line-strong)] border-b border-[var(--line-strong)]">
          <div className="px-2 py-1 text-muted-foreground">SHEET</div>
          <div className="px-2 py-1 font-medium text-foreground">01 OF 01</div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-[var(--line-strong)]">
          <div className="px-2 py-1 text-muted-foreground">REV / {currentYear}</div>
          <div className="px-2 py-1 font-medium text-foreground">SCALE 1:1</div>
        </div>
      </div>

      {/* Spacer grid row */}
      <div className="col-span-2 min-h-0 pointer-events-none" />

      {/* 5. Avatar Block: Square ID-Frame Avatar with Crop Marks (left cell, bottom aligned) */}
      <div className="relative z-10 self-end screen-line-top border-r border-[var(--line)] -mx-px flex items-end justify-center p-2.5 sm:p-3 bg-[var(--background)]">
        <AvatarBadge hasPhoto={hasPhoto} />
      </div>

      {/* 6. Name Block: Serif display type + Mono Tagline + Mute Button */}
      <div className="relative z-10 self-end flex flex-col justify-end min-w-0 bg-[var(--background)]">
        {/* Row 1: Serif H1 name (2.5rem mobile, 3.25rem desktop) + Mute toggle */}
        <div className="border-t border-[var(--line)] pl-3 sm:pl-5 pr-2 sm:pr-4 py-2 flex items-center justify-between sm:justify-start gap-3">
          <h1
            className="font-serif text-[2.25rem] sm:text-[3.25rem] leading-none font-normal tracking-[-0.01em] text-foreground whitespace-nowrap"
            style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
          >
            {site.name.full}
          </h1>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={
              soundEnabled
                ? "Mute interactive click tick"
                : "Enable interactive click tick"
            }
            title={soundEnabled ? "Mute click sound" : "Enable click sound"}
            className="size-7 sm:size-8 rounded-[8px] shrink-0 inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[var(--muted)] active:scale-[0.98] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
          >
            {soundEnabled ? (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            ) : (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
          </button>
        </div>

        {/* Row 2: Tagline mono */}
        <div className="border-t border-[var(--line)] h-[44px] sm:h-10 py-1 pl-3 sm:pl-5 pr-3 flex items-center">
          <p className="font-mono text-xs sm:text-sm text-balance text-muted-foreground leading-tight">
            {site.home.tagline}
          </p>
        </div>
      </div>

      {/* 7. Handwritten Redline Note: "measure me, click to pin" in accent colour */}
      <HandwrittenNote
        side="right"
        arrow="curved-down-left"
        className="bottom-24"
      >
        measure me, click to pin
      </HandwrittenNote>
    </div>
  );
}

/** Static Isometric Blueprint Drawing with Monogram CP on 30-degree axes */
function BlueprintDrawing() {
  return (
    <svg
      viewBox="0 0 768 500"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full overflow-visible"
    >
      <defs>
        <pattern
          id="blueprint-hatch-hero"
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
            stroke="var(--line-strong)"
            strokeWidth="1"
            strokeOpacity="0.5"
          />
        </pattern>
      </defs>

      {/* Two faint construction diagonals */}
      <line
        x1="-600"
        y1="-390"
        x2="1368"
        y2="890"
        stroke="var(--line-strong)"
        strokeWidth="1"
        strokeOpacity="0.25"
        strokeDasharray="6 4"
      />
      <line
        x1="-600"
        y1="890"
        x2="1368"
        y2="-390"
        stroke="var(--line-strong)"
        strokeWidth="1"
        strokeOpacity="0.25"
        strokeDasharray="6 4"
      />

      {/* Isometric Monogram "CP" */}
      <g
        stroke="var(--line-strong)"
        strokeWidth="1"
        strokeOpacity="0.6"
        fill="none"
      >
        {/* Letter 'C' */}
        <g>
          <polygon
            points="280,120 310,137 280,154 250,137"
            fill="url(#blueprint-hatch-hero)"
          />
          <polygon points="250,137 280,154 280,254 250,237" />
          <polygon points="280,154 310,137 310,237 280,254" />
        </g>
        <g>
          <polygon
            points="310,137 390,183 360,200 280,154"
            fill="url(#blueprint-hatch-hero)"
          />
          <polygon points="280,154 360,200 360,230 280,184" />
          <polygon points="360,200 390,183 390,213 360,230" />
        </g>
        <g>
          <polygon
            points="310,237 390,283 360,300 280,254"
            fill="url(#blueprint-hatch-hero)"
          />
          <polygon points="280,254 360,300 360,330 280,284" />
          <polygon points="360,300 390,283 390,313 360,330" />
        </g>

        {/* Letter 'P' */}
        <g>
          <polygon
            points="440,120 470,137 440,154 410,137"
            fill="url(#blueprint-hatch-hero)"
          />
          <polygon points="410,137 440,154 440,320 410,303" />
          <polygon points="440,154 470,137 470,303 440,320" />
        </g>
        <g>
          <polygon
            points="470,137 540,177 510,194 440,154"
            fill="url(#blueprint-hatch-hero)"
          />
          <polygon points="440,154 510,194 510,224 440,184" />
          <polygon points="510,194 540,177 540,207 510,224" />
        </g>
        <g>
          <polygon
            points="540,177 570,194 540,211 510,194"
            fill="url(#blueprint-hatch-hero)"
          />
          <polygon points="510,194 540,211 540,261 510,244" />
          <polygon points="540,211 570,194 570,244 540,261" />
        </g>
        <g>
          <polygon
            points="470,207 540,247 510,264 440,224"
            fill="url(#blueprint-hatch-hero)"
          />
          <polygon points="440,224 510,264 510,294 440,254" />
          <polygon points="510,264 540,247 540,277 510,294" />
        </g>

        {/* 30° angle label */}
        <g transform="translate(570, 194)">
          <path
            d="M 0 0 L 50 0"
            stroke="var(--line-strong)"
            strokeWidth="0.75"
            strokeDasharray="2 2"
          />
          <path
            d="M 0 0 L 43.3 25"
            stroke="var(--line-strong)"
            strokeWidth="0.75"
          />
          <path
            d="M 28 0 A 28 28 0 0 1 24.2 14"
            stroke="var(--accent)"
            strokeWidth="1.25"
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
      </g>
    </svg>
  );
}
