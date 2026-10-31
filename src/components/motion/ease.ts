import { useReducedMotion } from "motion/react";

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT_QUART = [0.76, 0, 0.24, 1] as const;

export const SPRING = {
  type: "spring",
  stiffness: 380,
  damping: 34,
  mass: 0.8,
} as const;

export function useMotionOK(): boolean {
  const shouldReduceMotion = useReducedMotion();
  return !shouldReduceMotion;
}
