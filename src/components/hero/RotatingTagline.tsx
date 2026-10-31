"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { site } from "@/content/site";

const TAGLINES = site.home.taglines;

export function RotatingTagline({ className = "" }: { className?: string }) {
  const [index, setIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(media.matches);

    const mediaListener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    media.addEventListener("change", mediaListener);

    const handleVisibility = () => {
      setIsPaused(document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      media.removeEventListener("change", mediaListener);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  React.useEffect(() => {
    if (isPaused || prefersReducedMotion) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % TAGLINES.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, prefersReducedMotion]);

  return (
    <div
      tabIndex={0}
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => {
        if (!document.hidden) setIsPaused(false);
      }}
      onFocus={() => setIsPaused(true)}
      onBlur={() => {
        if (!document.hidden) setIsPaused(false);
      }}
      className={`relative grid outline-none font-mono text-sm text-muted-foreground select-none ${className}`}
    >
      {/* Visually hidden sentence for screen readers */}
      <span className="sr-only">
        Backend and Android developer from Pune.
      </span>

      {/* Invisible stacked lines measuring max height to ensure zero layout shift */}
      <div
        aria-hidden="true"
        className="col-start-1 row-start-1 grid select-none pointer-events-none invisible"
      >
        {TAGLINES.map((line, i) => (
          <span key={i} className="col-start-1 row-start-1 py-1 block">
            {line}
          </span>
        ))}
      </div>

      {/* Visible active rotating line */}
      <div
        aria-hidden="true"
        className="col-start-1 row-start-1 flex items-center overflow-hidden py-1"
      >
        {prefersReducedMotion ? (
          <span className="block truncate">{TAGLINES[0]}</span>
        ) : (
          <AnimatePresence mode="wait">
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{
                opacity: 0,
                y: -6,
                filter: "blur(4px)",
                transition: { duration: 0.22, ease: "easeIn" },
              }}
              transition={{
                duration: 0.32,
                ease: "easeOut",
              }}
              className="block truncate"
            >
              {TAGLINES[index]}
            </motion.span>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
