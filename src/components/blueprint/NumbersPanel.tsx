"use client";

import * as React from "react";
import { PanelHeader } from "./PanelHeader";

interface NumberItem {
  value: number;
  label: string;
}

const NUMBERS_DATA: NumberItem[] = [
  { value: 1, label: "Hackathon win" },
  { value: 3, label: "Hackathon finals" },
  { value: 3, label: "Hackathon projects built" },
  { value: 2, label: "Degrees in progress" },
];

export function NumbersPanel() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = React.useState(false);
  const [counts, setCounts] = React.useState<number[]>([0, 0, 0, 0]);

  React.useEffect(() => {
    // Check prefers-reduced-motion
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCounts(NUMBERS_DATA.map((d) => d.value));
      setHasAnimated(true);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          observer.disconnect();

          const duration = 700; // ms
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(1, elapsed / duration);
            // Ease-out cubic: 1 - (1 - t)^3
            const easeOut = 1 - Math.pow(1 - progress, 3);

            const nextCounts = NUMBERS_DATA.map((d) => Math.round(d.value * easeOut));
            setCounts(nextCounts);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCounts(NUMBERS_DATA.map((d) => d.value));
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <div className="relative">
      <PanelHeader title="The numbers" sheet="SHEET 02 / 09" />

      {/* 4-column numbers strip with generous padding and no cell borders */}
      <div
        ref={containerRef}
        className="py-8 px-5 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 bg-[var(--background)]"
      >
        {NUMBERS_DATA.map((item, index) => (
          <div key={item.label} className="flex flex-col items-center text-center select-none">
            <span
              className="font-serif text-[2.75rem] sm:text-[3.5rem] leading-none font-normal text-foreground tabular-nums tracking-tight"
              style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
            >
              {counts[index]}
            </span>
            <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground mt-2 leading-tight">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export { NumbersPanel as BillOfMaterialsPanel };
