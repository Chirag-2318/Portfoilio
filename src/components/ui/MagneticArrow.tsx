"use client";

import * as React from "react";
import { Icon } from "@/components/ui/Icon";
import { useMotionOK } from "@/components/motion/ease";

export interface MagneticArrowProps {
  className?: string;
  variant?: "primary" | "outline";
}

export function MagneticArrow({
  className = "",
  variant = "primary",
}: MagneticArrowProps) {
  const circleRef = React.useRef<HTMLDivElement>(null);
  const motionOK = useMotionOK();
  const gsapLoadedRef = React.useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gsapRef = React.useRef<any>(null);

  const initGsap = React.useCallback(async () => {
    if (gsapLoadedRef.current || !motionOK) return;
    try {
      const gsapModule = await import("gsap");
      const gsapInstance = gsapModule.gsap || gsapModule.default;
      try {
        const { InertiaPlugin } = await import("gsap/InertiaPlugin");
        if (InertiaPlugin) {
          gsapInstance.registerPlugin(InertiaPlugin);
        }
      } catch {}
      gsapRef.current = gsapInstance;
      gsapLoadedRef.current = true;
    } catch {}
  }, [motionOK]);

  React.useEffect(() => {
    if (!motionOK) return;
    const circle = circleRef.current;
    if (!circle) return;

    const parent = circle.closest(".group") || circle.parentElement;
    if (!parent) return;

    let isHovering = false;

    const handlePointerEnter = (e: Event) => {
      const pe = e as PointerEvent;
      if (pe.pointerType === "touch") return;
      isHovering = true;
      initGsap();
    };

    const handlePointerMove = (e: Event) => {
      const pe = e as PointerEvent;
      if (pe.pointerType === "touch" || !isHovering) return;

      const circleRect = circle.getBoundingClientRect();
      const centerX = circleRect.left + circleRect.width / 2;
      const centerY = circleRect.top + circleRect.height / 2;

      const dx = pe.clientX - centerX;
      const dy = pe.clientY - centerY;

      // Clamped to ±6px
      const clampedX = Math.max(-6, Math.min(6, dx * 0.25));
      const clampedY = Math.max(-6, Math.min(6, dy * 0.25));

      if (gsapRef.current) {
        gsapRef.current.to(circle, {
          x: clampedX,
          y: clampedY,
          duration: 0.25,
          ease: "power2.out",
          overwrite: "auto",
        });
      } else {
        circle.style.transform = `translate3d(${clampedX}px, ${clampedY}px, 0)`;
      }
    };

    const handlePointerLeave = (e: Event) => {
      const pe = e as PointerEvent;
      if (pe.pointerType === "touch") return;
      isHovering = false;

      if (gsapRef.current) {
        gsapRef.current.to(circle, {
          x: 0,
          y: 0,
          duration: 0.4,
          ease: "elastic.out(1, 0.6)",
          overwrite: "auto",
        });
      } else {
        circle.style.transform = "translate3d(0, 0, 0)";
      }
    };

    parent.addEventListener("pointerenter", handlePointerEnter);
    parent.addEventListener("pointermove", handlePointerMove);
    parent.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      parent.removeEventListener("pointerenter", handlePointerEnter);
      parent.removeEventListener("pointermove", handlePointerMove);
      parent.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [motionOK, initGsap]);

  const styleClasses =
    variant === "primary"
      ? "bg-paper text-ink border border-paper"
      : "bg-transparent text-ink border border-line-strong";

  return (
    <div
      ref={circleRef}
      className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center transition-transform duration-160 active:scale-[0.94] will-change-transform select-none ${styleClasses} ${className}`}
    >
      <Icon name="arrow-right" size={14} className="text-current" />
    </div>
  );
}
