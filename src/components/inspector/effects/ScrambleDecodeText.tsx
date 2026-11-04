"use client";

import * as React from "react";
import { seededRandom } from "../motion-tokens";

interface ScrambleDecodeTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  targetId?: string;
  durationMs?: number;
  glyphSet?: string;
}

const DEFAULT_GLYPHS = "0123456789ABCDEF_/*-+=#@%&";

export function ScrambleDecodeText({
  text,
  className = "",
  style,
  targetId,
  durationMs = 450,
  glyphSet = DEFAULT_GLYPHS,
}: ScrambleDecodeTextProps) {
  const containerRef = React.useRef<HTMLSpanElement | null>(null);
  const [displayText, setDisplayText] = React.useState<string>(text);
  const [isDecoding, setIsDecoding] = React.useState(false);
  const [isDone, setIsDone] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      setDisplayText(text);
      setIsDone(true);
      return;
    }

    // Monitor parent element for data-build-state transitions
    const element = containerRef.current?.closest("[data-build-id]") || containerRef.current;
    if (!element) return;

    const checkState = () => {
      const state = element.getAttribute("data-build-state");
      if (state === "filling" && !isDecoding && !isDone) {
        setIsDecoding(true);
      } else if (state === "done") {
        setDisplayText(text);
        setIsDone(true);
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
  }, [isDecoding, isDone, text]);

  // Decode Animation Loop
  React.useEffect(() => {
    if (!isDecoding || isDone) return;

    const startTime = performance.now();
    const len = text.length;

    // Precalculate lock times left-to-right with slight seeded jitter
    const lockTimes = Array.from({ length: len }, (_, i) => {
      const baseProgress = (i + 1) / len;
      const jitter = (seededRandom(i * 31 + len) - 0.5) * 0.18;
      const progressWithJitter = Math.max(0.1, Math.min(1.0, baseProgress + jitter));
      return progressWithJitter * durationMs;
    });

    let frameId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      let allLocked = true;

      const chars: string[] = [];
      for (let i = 0; i < len; i++) {
        const originalChar = text[i];
        if (originalChar === " " || originalChar === "\n" || originalChar === "\t") {
          chars.push(originalChar);
          continue;
        }

        if (elapsed >= lockTimes[i]) {
          chars.push(originalChar);
        } else {
          allLocked = false;
          // Scramble with random glyph
          const randomIndex = Math.floor(Math.random() * glyphSet.length);
          chars.push(glyphSet[randomIndex]);
        }
      }

      setDisplayText(chars.join(""));

      if (allLocked || elapsed >= durationMs + 100) {
        setDisplayText(text);
        setIsDone(true);
        setIsDecoding(false);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [isDecoding, isDone, text, durationMs, glyphSet]);

  return (
    <span
      ref={containerRef}
      className={`font-mono tabular-nums inline-block select-text ${className}`}
      style={style}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{isDone ? text : displayText}</span>
    </span>
  );
}
