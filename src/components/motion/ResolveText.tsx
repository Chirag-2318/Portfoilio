"use client";

import * as React from "react";
import { motion } from "motion/react";
import { EASE_OUT_EXPO, useMotionOK } from "@/components/motion/ease";
import { useViewTransition } from "@/components/transition/ViewTransitionProvider";

export interface ResolveTextProps {
  as?: "h1" | "h2" | "h3" | "h4" | "span" | "div";
  className?: string;
  children: React.ReactNode;
}

export function ResolveText({
  as: Component = "h1",
  className = "",
  children,
}: ResolveTextProps) {
  const { ready } = useViewTransition();
  const motionOK = useMotionOK();

  return (
    <Component className={`relative inline-block ${className}`}>
      {/* Accessible screen reader text */}
      <span className="sr-only">{children}</span>

      {/* OUTLINE LAYER (sets natural dimensions) */}
      <motion.span
        aria-hidden="true"
        initial={{ opacity: 1 }}
        animate={{
          opacity: ready && motionOK ? 0 : ready && !motionOK ? 0 : 1,
        }}
        transition={{
          duration: 0.3,
          delay: 0.4,
          ease: EASE_OUT_EXPO,
        }}
        style={{
          color: "transparent",
          WebkitTextStroke: "1px var(--ink-3)",
        }}
        className="block select-none"
      >
        {children}
      </motion.span>

      {/* FILL LAYER (wipes left-to-right over outline) */}
      <motion.span
        aria-hidden="true"
        initial={{
          clipPath: motionOK ? "inset(0 100% 0 0)" : "inset(0 0 0 0)",
        }}
        animate={{
          clipPath:
            ready || !motionOK
              ? "inset(0 0% 0 0)"
              : "inset(0 100% 0 0)",
        }}
        transition={{
          duration: motionOK ? 0.7 : 0.1,
          ease: EASE_OUT_EXPO,
        }}
        style={{
          color: "var(--ink)",
        }}
        className="absolute inset-0 block select-none pointer-events-none"
      >
        {children}
      </motion.span>
    </Component>
  );
}
