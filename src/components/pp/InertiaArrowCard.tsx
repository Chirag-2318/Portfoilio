// Adapted from Pixel Perfect (https://www.pixel-perfect.space/), MIT License. Copyright notice and licence retained in THIRD_PARTY_NOTICES.md.
"use client";

import * as React from "react";
import { Icon } from "@/components/ui/Icon";
import { useMotionOK } from "@/components/motion/ease";

export interface InertiaArrowCardProps {
  className?: string;
  arrowClassName?: string;
}

export function InertiaArrowCard({
  className = "",
  arrowClassName = "",
}: InertiaArrowCardProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const pillRef = React.useRef<HTMLDivElement>(null);
  const motionOK = useMotionOK();
  const gsapLoadedRef = React.useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gsapRef = React.useRef<any>(null);

  const initGsap = React.useCallback(async () => {
    if (gsapLoadedRef.current || !motionOK) return;
    try {
      const gsapModule = await import("gsap");
      const gsapInstance = gsapModule.gsap || gsapModule.default;
      gsapRef.current = gsapInstance;
      gsapLoadedRef.current = true;
    } catch {}
  }, [motionOK]);

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" || !motionOK) return;
    initGsap();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" || !motionOK) return;
    const root = rootRef.current;
    const pill = pillRef.current;
    if (!root || !pill) return;

    const rect = root.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);

    // Clamp translation to ±6px
    const clampedX = Math.max(-6, Math.min(6, relX * 0.25));
    const clampedY = Math.max(-6, Math.min(6, relY * 0.25));

    if (gsapRef.current) {
      gsapRef.current.to(pill, {
        x: clampedX,
        y: clampedY,
        duration: 0.25,
        ease: "power2.out",
        overwrite: "auto",
      });
    } else {
      pill.style.transform = `translate3d(${clampedX}px, ${clampedY}px, 0)`;
    }
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" || !motionOK) return;
    const pill = pillRef.current;
    if (!pill) return;

    if (gsapRef.current) {
      gsapRef.current.to(pill, {
        x: 0,
        y: 0,
        duration: 0.4,
        ease: "elastic.out(1, 0.5)",
        overwrite: "auto",
      });
    } else {
      pill.style.transform = "translate3d(0, 0, 0)";
    }
  };

  return (
    <div
      ref={rootRef}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`inline-flex items-center justify-center ${className}`}
    >
      <div
        ref={pillRef}
        className={`w-7 h-7 rounded-full border border-line-strong flex items-center justify-center transition-transform duration-160 active:scale-[0.94] will-change-transform ${arrowClassName}`}
      >
        <Icon name="arrow-right" size={14} className="text-current" />
      </div>
    </div>
  );
}

