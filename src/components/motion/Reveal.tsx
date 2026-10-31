"use client";

import * as React from "react";
import { motion } from "motion/react";
import { EASE_OUT_EXPO, useMotionOK } from "@/components/motion/ease";
import { useViewTransition } from "@/components/transition/ViewTransitionProvider";

export interface RevealProps {
  delay?: number;
  y?: number;
  as?: "div" | "section" | "article" | "header" | "footer" | "span" | "p";
  className?: string;
  children: React.ReactNode;
}

export function Reveal({
  delay = 0,
  y = 12,
  as = "div",
  className = "",
  children,
}: RevealProps) {
  const { ready } = useViewTransition();
  const motionOK = useMotionOK();

  const MotionComponent = motion[as] as typeof motion.div;

  return (
    <MotionComponent
      initial={{
        opacity: 0,
        y: motionOK ? y : 0,
      }}
      animate={
        ready
          ? {
              opacity: 1,
              y: 0,
            }
          : {
              opacity: 0,
              y: motionOK ? y : 0,
            }
      }
      transition={{
        duration: motionOK ? 0.45 : 0.12,
        delay,
        ease: EASE_OUT_EXPO,
      }}
      className={className}
    >
      {children}
    </MotionComponent>
  );
}

