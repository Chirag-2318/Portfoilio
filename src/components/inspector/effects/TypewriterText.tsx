"use client";

import * as React from "react";

interface TypewriterTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  targetId?: string;
  minCps?: number;
  maxCps?: number;
  onComplete?: () => void;
}

export function TypewriterText({
  text,
  className = "",
  style,
  targetId,
  minCps = 45,
  maxCps = 70,
  onComplete,
}: TypewriterTextProps) {
  const containerRef = React.useRef<HTMLSpanElement | null>(null);
  const [typedLength, setTypedLength] = React.useState<number>(0);
  const [isTyping, setIsTyping] = React.useState(false);
  const [isComplete, setIsComplete] = React.useState(false);
  const [showCaret, setShowCaret] = React.useState(false);

  // Monitor target build state
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      setTypedLength(text.length);
      setIsComplete(true);
      setShowCaret(false);
      onComplete?.();
      return;
    }

    const element = containerRef.current?.closest("[data-build-id]") || containerRef.current;
    if (!element) return;

    const checkState = () => {
      const state = element.getAttribute("data-build-state");
      if (state === "filling" && !isTyping && !isComplete) {
        setIsTyping(true);
        setShowCaret(true);
      } else if (state === "done") {
        setTypedLength(text.length);
        setIsComplete(true);
        setShowCaret(false);
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
  }, [isTyping, isComplete, text.length, onComplete]);

  // Variable Cadence Typing Engine
  React.useEffect(() => {
    if (!isTyping || isComplete) return;

    let timeoutId: NodeJS.Timeout;
    let currentIndex = 0;

    const typeNextChar = () => {
      if (currentIndex >= text.length) {
        setIsComplete(true);
        setIsTyping(false);
        onComplete?.();

        // Caret blinks for 600ms after completion, then fades out
        setTimeout(() => {
          setShowCaret(false);
        }, 600);
        return;
      }

      const char = text[currentIndex];
      currentIndex++;
      setTypedLength(currentIndex);

      // Compute variable delay (40-70 chars/s = 14-25ms)
      const baseDelay = 1000 / (minCps + Math.random() * (maxCps - minCps));

      // Longer pause on punctuation
      let extraPause = 0;
      if (char === "." || char === "!" || char === "?") {
        extraPause = 160;
      } else if (char === "," || char === ";" || char === "-") {
        extraPause = 110;
      }

      timeoutId = setTimeout(typeNextChar, baseDelay + extraPause);
    };

    timeoutId = setTimeout(typeNextChar, 1000 / maxCps);

    return () => clearTimeout(timeoutId);
  }, [isTyping, isComplete, text, minCps, maxCps, onComplete]);

  const visiblePart = isComplete ? text : text.slice(0, typedLength);

  return (
    <span
      ref={containerRef}
      className={`relative inline-block ${className}`}
      style={style}
    >
      {/* 1. Ghost Measuring Block: Reserves exact width & height at all times (Zero CLS) */}
      <span
        aria-hidden="true"
        className="invisible pointer-events-none select-none block"
      >
        {text}
      </span>

      {/* 2. Visible Typing Layer */}
      <span className="absolute inset-0 flex items-center select-text">
        <span>{visiblePart}</span>
        {showCaret && (
          <span
            className="inline-block w-[2px] h-[1.15em] bg-[var(--accent)] ml-0.5 align-middle animate-pulse"
            aria-hidden="true"
          />
        )}
      </span>

      {/* 3. Screen Reader Text */}
      <span className="sr-only">{text}</span>
    </span>
  );
}
