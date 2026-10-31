"use client";

import * as React from "react";
import gsap from "gsap";
import { cn } from "@/lib/cn";

export type RevealOrder = "center" | "edges" | "random" | "start" | "end";

export interface MosaicRevealProps {
  src: string;
  cols?: number;
  rows?: number;
  order?: RevealOrder;
  aspect?: string;
  className?: string;
  trigger?: "inView" | "mount";
  alt?: string;
  rounded?: string;
  onError?: () => void;
}

export function MosaicReveal({
  src,
  cols = 8,
  rows = 5,
  order = "center",
  aspect = "16 / 9",
  className,
  trigger = "inView",
  alt = "",
  rounded = "rounded-lg",
  onError,
}: MosaicRevealProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);
  const ctxRef = React.useRef<gsap.Context | null>(null);

  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [isReducedMotion, setIsReducedMotion] = React.useState(false);
  const hasTriggeredRef = React.useRef(false);

  // Check prefers-reduced-motion
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(media.matches);

    const listener = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // Preload image
  React.useEffect(() => {
    let active = true;
    const img = new Image();
    img.src = src;
    img.onload = () => {
      if (!active) return;
      setIsLoaded(true);
    };
    img.onerror = () => {
      if (!active) return;
      setHasError(true);
      onError?.();
    };
    return () => {
      active = false;
    };
  }, [src, onError]);

  // Clean up GSAP context on unmount
  React.useEffect(() => {
    return () => {
      ctxRef.current?.revert();
    };
  }, []);

  // Play / replay reveal animation
  const playReveal = React.useCallback(() => {
    if (!gridRef.current || isReducedMotion) return;

    ctxRef.current?.revert();
    ctxRef.current = gsap.context(() => {
      if (!gridRef.current) return;
      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, scale: 0.4 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "power3.out",
          stagger: { each: 0.025, grid: [rows, cols], from: order },
        }
      );
    }, gridRef);
  }, [cols, rows, order, isReducedMotion]);

  // Handle trigger (mount or inView)
  React.useEffect(() => {
    if (!isLoaded || hasError || hasTriggeredRef.current) return;

    if (isReducedMotion) {
      hasTriggeredRef.current = true;
      return;
    }

    if (trigger === "mount") {
      hasTriggeredRef.current = true;
      // Short RAF delay to ensure elements are rendered
      requestAnimationFrame(() => {
        playReveal();
      });
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          observer.disconnect();
          playReveal();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [isLoaded, hasError, trigger, isReducedMotion, playReveal]);

  if (hasError) {
    return null;
  }

  // Generate tiles config
  const totalTiles = cols * rows;
  const tiles = Array.from({ length: totalTiles }, (_, i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const posX = cols > 1 ? (c / (cols - 1)) * 100 : 0;
    const posY = rows > 1 ? (r / (rows - 1)) * 100 : 0;
    return {
      key: i,
      c,
      r,
      posX,
      posY,
    };
  });

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={alt}
      onClick={playReveal}
      style={{ aspectRatio: aspect }}
      className={cn(
        "relative w-full overflow-hidden select-none cursor-pointer bg-[var(--muted)]",
        rounded,
        className
      )}
    >
      {!isLoaded ? (
        // Plain muted block while preloading
        <div className="w-full h-full bg-[var(--muted)]" />
      ) : isReducedMotion ? (
        // Instant full image on reduced motion
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="w-full h-full object-cover block"
          loading="eager"
        />
      ) : (
        // Animated mosaic grid
        <div
          ref={gridRef}
          aria-hidden="true"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            width: "100%",
            height: "100%",
          }}
        >
          {tiles.map((tile) => (
            <div
              key={tile.key}
              style={{
                backgroundImage: `url(${src})`,
                backgroundSize: `${cols * 100}% ${rows * 100}%`,
                backgroundPosition: `${tile.posX}% ${tile.posY}%`,
                backgroundRepeat: "no-repeat",
                opacity: 0,
                transform: "scale(0.4)",
                willChange: "transform, opacity",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
