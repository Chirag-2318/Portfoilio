"use client";

import * as React from "react";
import { site } from "@/content/site";
import { AvatarBadge } from "@/components/blueprint/AvatarBadge";
import { HandwrittenNote } from "@/components/blueprint/HandwrittenNote";
import { ConstructionMonogram } from "@/components/hero/ConstructionMonogram";
import { RotatingTagline } from "@/components/hero/RotatingTagline";

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
  const [isHeroHovered, setIsHeroHovered] = React.useState(false);
  const [isReducedMotion, setIsReducedMotion] = React.useState(false);
  const [isFinePointer, setIsFinePointer] = React.useState(false);

  // Easing coordinates for crosshair lag (~80ms)
  const targetPos = React.useRef({ x: 0, y: 0 });
  const currentPos = React.useRef({ x: 0, y: 0 });
  const rafId = React.useRef<number | null>(null);

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

  // Smooth crosshair animation loop with ~80ms lag
  const animateCrosshair = React.useCallback(() => {
    const lagFactor = 0.16; // gives ~80ms response at 60fps
    currentPos.current.x += (targetPos.current.x - currentPos.current.x) * lagFactor;
    currentPos.current.y += (targetPos.current.y - currentPos.current.y) * lagFactor;

    if (crosshairXRef.current) {
      crosshairXRef.current.style.transform = `translateX(${currentPos.current.x}px)`;
    }
    if (crosshairYRef.current) {
      crosshairYRef.current.style.transform = `translateY(${currentPos.current.y}px)`;
    }
    if (readoutRef.current) {
      // Keep readout slightly offset from intersection so it's not obscured
      const offsetX = currentPos.current.x + 10;
      const offsetY = currentPos.current.y + 10;
      readoutRef.current.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      readoutRef.current.textContent = `x ${Math.round(currentPos.current.x)}  y ${Math.round(currentPos.current.y)}`;
    }

    rafId.current = requestAnimationFrame(animateCrosshair);
  }, []);

  const handlePointerEnter = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      setIsHeroHovered(true);
      if (!isFinePointer || isReducedMotion) return;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      targetPos.current.x = e.clientX - rect.left;
      targetPos.current.y = e.clientY - rect.top;
      currentPos.current = { ...targetPos.current };
      setIsCrosshairActive(true);
      if (!rafId.current) {
        rafId.current = requestAnimationFrame(animateCrosshair);
      }
    },
    [animateCrosshair, isFinePointer, isReducedMotion]
  );

  const handlePointerLeave = React.useCallback(() => {
    setIsHeroHovered(false);
    setIsCrosshairActive(false);
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isFinePointer || isReducedMotion) return;
      if (!containerRef.current) return;
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
      className="relative mx-auto max-w-3xl w-full border-x border-[var(--line-soft)] screen-line-bottom overflow-hidden select-none h-[340px] sm:h-[440px] grid grid-cols-[auto_1fr] grid-rows-[1fr_auto] bg-[var(--background)] cursor-crosshair"
    >
      {/* 1. New Hero Artwork: Construction Sheet Monogram CP (upper hero area above name/avatar) */}
      <div
        className="absolute top-0 left-0 right-0 bottom-[148px] sm:bottom-[160px] flex items-center justify-center pointer-events-none select-none z-0 px-4"
        aria-hidden="true"
      >
        <ConstructionMonogram isHeroHovered={isHeroHovered} />
      </div>

      {/* 2. CAD Crosshair: 1px vertical & 1px horizontal line in var(--accent) at 55% opacity (inside hero bounds) */}
      {isFinePointer && !isReducedMotion && isCrosshairActive && (
        <div
          className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
          aria-hidden="true"
        >
          {/* Vertical 1px line */}
          <div
            ref={crosshairXRef}
            className="absolute top-0 bottom-0 left-0 w-px bg-[var(--accent)] opacity-55 will-change-transform pointer-events-none"
          />

          {/* Horizontal 1px line */}
          <div
            ref={crosshairYRef}
            className="absolute left-0 right-0 top-0 h-px bg-[var(--accent)] opacity-55 will-change-transform pointer-events-none"
          />

          {/* Coordinates readout */}
          <div
            ref={readoutRef}
            className="absolute top-0 left-0 font-mono text-[11px] text-[var(--accent)] font-medium bg-[var(--background)]/85 px-1 py-0.5 rounded border border-[var(--accent)]/30 will-change-transform shadow-xs pointer-events-none"
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
            } -translate-x-1.5 translate-y-1.5 pointer-events-none`}
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

      {/* Spacer grid row */}
      <div className="col-span-2 min-h-0 pointer-events-none" />

      {/* 4. Avatar Block: Square ID-Frame Avatar with Crop Marks (left cell, bottom aligned) */}
      <div className="relative z-10 self-end screen-line-top border-r border-[var(--line)] -mx-px flex items-end justify-center p-2.5 sm:p-3 bg-[var(--background)]">
        <AvatarBadge hasPhoto={hasPhoto} />
      </div>

      {/* 5. Name Block: Serif display type + Rotating Humour Tagline + Mute Button */}
      <div className="relative z-10 self-end flex flex-col justify-end min-w-0 bg-[var(--background)]">
        {/* Row 1: Serif H1 name (2.5rem mobile, 3.25rem desktop) + Mute toggle */}
        <div className="border-t border-[var(--line)] pl-3 sm:pl-5 pr-2 sm:pr-4 py-2 flex items-center justify-between sm:justify-start gap-3">
          <h1
            className="font-serif text-[2rem] sm:text-[3.25rem] leading-none font-normal tracking-[-0.01em] text-foreground whitespace-nowrap"
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

        {/* Row 2: Rotating Humour Tagline */}
        <div className="border-t border-[var(--line)] h-[44px] sm:h-10 py-1 pl-3 sm:pl-5 pr-3 flex items-center">
          <RotatingTagline className="w-full" />
        </div>
      </div>

      {/* 6. Handwritten Redline Note: "measure me, click to pin" in accent colour */}
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
