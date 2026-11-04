"use client";

import * as React from "react";
import { INTRO_CONFIG } from "./intro-config";
import { introController, type IntroState } from "./intro-controller";
import { isSoundMuted, playSound } from "@/components/sound/sound-effects";

interface IntroGateProps {
  portfolioRef: React.RefObject<HTMLDivElement | null>;
}

export function IntroGate({ portfolioRef }: IntroGateProps) {
  const [introState, setIntroState] = React.useState<IntroState>("loading");
  const [progress, setProgress] = React.useState<number>(0);
  const [isReducedMotion, setIsReducedMotion] = React.useState<boolean>(false);
  const [isMounted, setIsMounted] = React.useState<boolean>(true);

  // Magnetic & border highlight tracking on Enter button
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [magneticOffset, setMagneticOffset] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [pointerLocal, setPointerLocal] = React.useState<{ x: number; y: number } | null>(null);
  const [isPressed, setIsPressed] = React.useState<boolean>(false);

  // Monogram animation state
  const [monogramDrawn, setMonogramDrawn] = React.useState<boolean>(false);

  // Detect skipintro query parameter or session setting
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const skipQuery = params.has(INTRO_CONFIG.skipParam);
    const skipStorage = window.sessionStorage.getItem(INTRO_CONFIG.skipParam) === "true";

    if (skipQuery || skipStorage) {
      introController.emitEntered();
      setIntroState("entered");
      setIsMounted(false);
      return;
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(motionQuery.matches);
    const motionListener = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    motionQuery.addEventListener("change", motionListener);

    return () => motionQuery.removeEventListener("change", motionListener);
  }, []);

  // Lock scroll and mark portfolio inert while gate is active
  React.useEffect(() => {
    if (!isMounted || introState === "entered") return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const targetEl = portfolioRef.current;
    if (targetEl) {
      targetEl.setAttribute("aria-hidden", "true");
      targetEl.inert = true;
      targetEl.style.visibility = "hidden";
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      if (targetEl) {
        targetEl.removeAttribute("aria-hidden");
        targetEl.inert = false;
        targetEl.style.visibility = "visible";
      }
    };
  }, [isMounted, introState, portfolioRef]);

  // Asset preloader & progress synchronization loop
  React.useEffect(() => {
    if (introState !== "loading") return;

    let isCancelled = false;
    const startTime = performance.now();
    let realProgress = 10;

    // Trigger monogram stroke draw-in on mount
    const drawTimer = setTimeout(() => {
      if (!isCancelled) setMonogramDrawn(true);
    }, 60);

    // Run real asset loading checks
    const runChecks = async () => {
      try {
        if (typeof document !== "undefined" && document.fonts) {
          await document.fonts.ready;
        }
      } catch {}
      if (isCancelled) return;
      realProgress = 55;

      try {
        if (typeof Image !== "undefined") {
          const img = new Image();
          img.src = "/images/chirag.jpg";
          await img.decode().catch(() => {});
        }
      } catch {}
      if (isCancelled) return;
      realProgress = 90;

      if (typeof document !== "undefined" && document.readyState !== "complete") {
        await new Promise((resolve) => window.addEventListener("load", resolve, { once: true }));
      }
      if (isCancelled) return;
      realProgress = 100;
    };

    runChecks();

    // Smooth counter interpolation loop respecting minDisplayMs
    let animFrame: number;
    const updateCounter = (now: number) => {
      if (isCancelled) return;
      const elapsed = now - startTime;
      const timeRatio = Math.min(1, elapsed / INTRO_CONFIG.minDisplayMs);
      const simulatedCap = Math.round(timeRatio * 100);
      const currentTarget = Math.min(realProgress, simulatedCap);

      setProgress((prev) => {
        const next = Math.max(prev, Math.min(100, currentTarget));
        if (next >= 100 && elapsed >= INTRO_CONFIG.minDisplayMs) {
          introController.setState("ready");
          setIntroState("ready");
          return 100;
        }
        return next;
      });

      if (introState === "loading") {
        animFrame = requestAnimationFrame(updateCounter);
      }
    };

    animFrame = requestAnimationFrame(updateCounter);

    // 8-second failsafe to force ready state regardless of network hangs
    const failsafe = setTimeout(() => {
      if (!isCancelled && introState === "loading") {
        setProgress(100);
        introController.setState("ready");
        setIntroState("ready");
      }
    }, INTRO_CONFIG.failsafeTimeoutMs);

    return () => {
      isCancelled = true;
      clearTimeout(drawTimer);
      clearTimeout(failsafe);
      cancelAnimationFrame(animFrame);
    };
  }, [introState]);

  // Handle magnetic pull and border highlight
  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (isReducedMotion || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const pullX = Math.max(-INTRO_CONFIG.magneticPullMaxPx, Math.min(INTRO_CONFIG.magneticPullMaxPx, (e.clientX - centerX) * 0.22));
    const pullY = Math.max(-INTRO_CONFIG.magneticPullMaxPx, Math.min(INTRO_CONFIG.magneticPullMaxPx, (e.clientY - centerY) * 0.22));

    setMagneticOffset({ x: pullX, y: pullY });
    setPointerLocal({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handlePointerLeave = () => {
    setMagneticOffset({ x: 0, y: 0 });
    setPointerLocal(null);
  };

  // Trigger the click transition sequence
  const handleEnterClick = React.useCallback(() => {
    if (introState !== "ready") return;

    // Play subtle interface audio feedback if unmuted
    if (!isSoundMuted()) {
      playSound("select");
    }

    setIsPressed(true);

    if (!buttonRef.current || !portfolioRef.current) {
      introController.emitEntered();
      setIntroState("entered");
      setIsMounted(false);
      return;
    }

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const originX = Math.round(buttonRect.left + buttonRect.width / 2);
    const originY = Math.round(buttonRect.top + buttonRect.height / 2);

    const vpWidth = window.innerWidth;
    const vpHeight = window.innerHeight;

    setIntroState("entering");

    // Reduced motion fast-path: 300ms simple crossfade
    if (isReducedMotion) {
      const targetEl = portfolioRef.current;
      targetEl.style.visibility = "visible";
      targetEl.style.opacity = "0";
      targetEl.style.transition = `opacity ${INTRO_CONFIG.reducedMotionDurationMs}ms ease-out`;

      requestAnimationFrame(() => {
        targetEl.style.opacity = "1";
      });

      setTimeout(() => {
        introController.emitEntering(originX, originY);
        introController.emitEntered();
        setIntroState("entered");
        setIsMounted(false);
      }, INTRO_CONFIG.reducedMotionDurationMs);
      return;
    }

    // 1. 0 - 90ms: Press feedback scale
    setTimeout(() => {
      setIsPressed(false);
    }, INTRO_CONFIG.pressFeedbackMs);

    // 2. 150ms - 1100ms: Expanding mask clip-path + focus pull
    const portfolioEl = portfolioRef.current;

    setTimeout(() => {
      if (!portfolioEl) return;

      // Initial pill inset mask geometry
      const top = Math.round(buttonRect.top);
      const right = Math.round(vpWidth - buttonRect.right);
      const bottom = Math.round(vpHeight - buttonRect.bottom);
      const left = Math.round(buttonRect.left);
      const radius = Math.round(buttonRect.height / 2);

      portfolioEl.style.visibility = "visible";
      portfolioEl.style.transformOrigin = `${originX}px ${originY}px`;
      portfolioEl.style.transform = `scale(${INTRO_CONFIG.portfolioEnterScaleStart})`;
      portfolioEl.style.filter = `blur(${INTRO_CONFIG.portfolioEnterBlurStartPx}px)`;
      portfolioEl.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius}px)`;
      portfolioEl.style.willChange = "clip-path, transform, filter";

      // Force layout recalculation before triggering transition
      void portfolioEl.offsetWidth;

      portfolioEl.style.transition = `clip-path ${INTRO_CONFIG.revealDurationMs}ms ${INTRO_CONFIG.easeExpoOut}, transform ${INTRO_CONFIG.revealDurationMs}ms ${INTRO_CONFIG.easeExpoOut}, filter ${INTRO_CONFIG.revealDurationMs}ms ${INTRO_CONFIG.easeExpoOut}`;

      requestAnimationFrame(() => {
        portfolioEl.style.clipPath = "inset(0px 0px 0px 0px round 0px)";
        portfolioEl.style.transform = "scale(1)";
        portfolioEl.style.filter = "blur(0px)";
      });
    }, INTRO_CONFIG.revealStartDelayMs);

    // 3. 700ms: Emit hand-off event for cursor spawn choreography
    setTimeout(() => {
      introController.emitEntering(originX, originY);
    }, INTRO_CONFIG.handoffEmitMs);

    // 4. 1100ms: Complete transition, cleanup DOM, restore normal rendering
    setTimeout(() => {
      introController.emitEntered();
      setIntroState("entered");
      setIsMounted(false);

      if (portfolioEl) {
        portfolioEl.style.clipPath = "";
        portfolioEl.style.transform = "";
        portfolioEl.style.filter = "";
        portfolioEl.style.transition = "";
        portfolioEl.style.willChange = "";
      }
    }, INTRO_CONFIG.totalTransitionMs);
  }, [introState, isReducedMotion, portfolioRef]);

  if (!isMounted) return null;

  const formattedProgress = String(progress).padStart(2, "0");

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-label="Welcome gate"
      className={`fixed inset-0 z-[9999] bg-[var(--background)] flex flex-col items-center justify-center select-none overflow-hidden transition-opacity duration-300 ${
        introState === "entering" ? "pointer-events-none" : ""
      }`}
      style={{
        opacity: introState === "entering" && isReducedMotion ? 0 : 1,
      }}
    >
      {/* ─── Center Monogram with Construction Guides ─── */}
      <div
        className="relative flex items-center justify-center transition-all duration-300"
        style={{
          transform:
            introState === "entering"
              ? `scale(${INTRO_CONFIG.monogramExitScale})`
              : "scale(1)",
          opacity: introState === "entering" ? 0 : 1,
          transition: `transform ${INTRO_CONFIG.fadeExitMs}ms ${INTRO_CONFIG.easeExpoOut}, opacity ${INTRO_CONFIG.fadeExitMs}ms ease-out`,
        }}
      >
        <svg
          viewBox="0 0 768 400"
          preserveAspectRatio="xMidYMid meet"
          className="w-[280px] sm:w-[380px] h-[145px] sm:h-[195px] overflow-visible block"
          aria-hidden="true"
        >
          <g transform="translate(4, 0)">
            {/* ── 1. Faint Construction Layer (1px lines + annotations) ── */}
            <g
              className="transition-opacity duration-700 ease-out"
              style={{
                opacity: monogramDrawn || isReducedMotion ? 0.38 : 0,
              }}
            >
              {/* Horizontal guide tangents */}
              <line x1="184" y1="90" x2="576" y2="90" stroke="var(--line-strong)" strokeWidth="1" />
              <line x1="184" y1="190" x2="576" y2="190" stroke="var(--line-strong)" strokeWidth="1" />
              <line x1="184" y1="290" x2="576" y2="290" stroke="var(--line-strong)" strokeWidth="1" />

              {/* Vertical guide tangents */}
              <line x1="236" y1="48" x2="236" y2="332" stroke="var(--line-strong)" strokeWidth="1" />
              <line x1="384" y1="48" x2="384" y2="332" stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="436" y1="48" x2="436" y2="332" stroke="var(--line-strong)" strokeWidth="1" />
              <line x1="468" y1="48" x2="468" y2="332" stroke="var(--line-strong)" strokeWidth="1" />
              <line x1="524" y1="48" x2="524" y2="332" stroke="var(--line-strong)" strokeWidth="1" />

              {/* Reference circle for letter C */}
              <circle
                cx="384"
                cy="190"
                r="100"
                stroke="var(--line-strong)"
                strokeWidth="1"
                fill="none"
                strokeDasharray="4 4"
              />

              {/* Reference semicircle for letter P */}
              <path
                d="M468 90 A56 56 0 0 1 468 202"
                stroke="var(--line-strong)"
                strokeWidth="1"
                fill="none"
                strokeDasharray="4 4"
              />

              {/* Center crosshair tick marks */}
              <line x1="376" y1="190" x2="392" y2="190" stroke="var(--foreground)" strokeWidth="1" opacity="0.6" />
              <line x1="384" y1="182" x2="384" y2="198" stroke="var(--foreground)" strokeWidth="1" opacity="0.6" />

              {/* Blueprint Dimension Annotations */}
              <text
                x="384"
                y="186"
                fill="var(--muted-foreground)"
                fontFamily="var(--font-geist-mono), monospace"
                fontSize="9"
                textAnchor="middle"
                opacity="0.8"
              >
                R = 100
              </text>
              <text
                x="496"
                y="146"
                fill="var(--muted-foreground)"
                fontFamily="var(--font-geist-mono), monospace"
                fontSize="9"
                textAnchor="middle"
                opacity="0.8"
              >
                r = 56
              </text>
            </g>

            {/* ── 2. Vector Monogram Stroke ("CP") ── */}
            {/* Letter C */}
            <path
              d="M414.8 128.4 A100 100 0 1 0 414.8 251.6"
              fill="none"
              stroke="var(--foreground)"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeDasharray="560"
              strokeDashoffset={monogramDrawn || isReducedMotion ? "0" : "560"}
              style={{
                transition: isReducedMotion
                  ? "none"
                  : `stroke-dashoffset 1400ms ${INTRO_CONFIG.easeExpoOut}`,
              }}
            />

            {/* Letter P Stem */}
            <path
              d="M468 90 V290"
              fill="none"
              stroke="var(--foreground)"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeDasharray="210"
              strokeDashoffset={monogramDrawn || isReducedMotion ? "0" : "210"}
              style={{
                transition: isReducedMotion
                  ? "none"
                  : `stroke-dashoffset 1300ms ${INTRO_CONFIG.easeExpoOut} 120ms`,
              }}
            />

            {/* Letter P Bowl */}
            <path
              d="M468 90 A56 56 0 0 1 468 202"
              fill="none"
              stroke="var(--foreground)"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeDasharray="220"
              strokeDashoffset={monogramDrawn || isReducedMotion ? "0" : "220"}
              style={{
                transition: isReducedMotion
                  ? "none"
                  : `stroke-dashoffset 1300ms ${INTRO_CONFIG.easeExpoOut} 180ms`,
              }}
            />
          </g>
        </svg>
      </div>

      {/* ─── Bottom Interactive Zone (Progress readout or Enter button) ─── */}
      <div className="mt-8 h-12 flex items-center justify-center relative">
        {/* Monospace progress readout (fades out when ready) */}
        <div
          className={`font-mono text-xs tabular-nums tracking-widest text-[var(--muted-foreground)] transition-opacity duration-300 ${
            introState === "loading" ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-live="polite"
        >
          <span>{formattedProgress}</span>
          <span className="text-muted-foreground/40 text-[10px] ml-1">%</span>
        </div>

        {/* Enter Pill Button (appears when ready) */}
        {introState !== "loading" && (
          <button
            ref={buttonRef}
            type="button"
            onClick={handleEnterClick}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            className={`group relative rounded-full px-7 py-2.5 font-mono text-sm tracking-wide text-foreground border border-[var(--line-strong)] bg-[var(--background)] cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] transition-all duration-150 ${
              introState === "ready" ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
            }`}
            style={{
              transform: `translate(${magneticOffset.x}px, ${magneticOffset.y}px) scale(${
                isPressed ? INTRO_CONFIG.buttonPressScale : 1
              })`,
              transition: isPressed
                ? `transform ${INTRO_CONFIG.pressFeedbackMs}ms ease-out`
                : "transform 140ms ease-out, opacity 300ms ease-out",
            }}
          >
            {/* Hairline highlight following pointer along 1px border */}
            {pointerLocal && !isReducedMotion && (
              <span
                aria-hidden="true"
                className="absolute inset-[-1px] rounded-full pointer-events-none transition-opacity duration-200"
                style={{
                  background: `radial-gradient(75px circle at ${pointerLocal.x}px ${pointerLocal.y}px, rgba(255, 255, 255, 0.4), transparent 75%)`,
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "exclude",
                  WebkitMaskComposite: "xor",
                  padding: "1px",
                }}
              />
            )}

            {/* Label and Arrow */}
            <span
              className="relative z-10 inline-flex items-center gap-2 transition-opacity duration-200"
              style={{
                opacity: introState === "entering" ? 0 : 1,
              }}
            >
              <span>Enter</span>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
