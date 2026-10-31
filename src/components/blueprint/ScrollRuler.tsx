"use client";

import * as React from "react";

const SECTION_IDS = [
  "top",
  "overview",
  "socials",
  "about",
  "numbers",
  "experience",
  "projects",
  "achievements",
  "education",
  "stack",
  "resume",
  "contact",
];

export function ScrollRuler() {
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [activeSection, setActiveSection] = React.useState("top");
  const rulerHeightRef = React.useRef<number>(600);
  const rulerContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // 1. Scroll listener for progress calculation
    const handleScroll = () => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const p = Math.min(Math.max(window.scrollY / scrollHeight, 0), 1);
        setScrollProgress(p);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // 2. Measure ruler container height
    if (rulerContainerRef.current) {
      rulerHeightRef.current = rulerContainerRef.current.clientHeight;
    }

    // 3. IntersectionObserver for active section label
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: 0,
      }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  // Compute number of 24px ticks
  const tickCount = Math.floor(rulerHeightRef.current / 24);
  const ticks = Array.from({ length: Math.max(tickCount, 15) });

  return (
    <aside
      aria-hidden="true"
      className="fixed top-24 bottom-24 left-4 2xl:left-10 hidden xl:flex flex-col items-center pointer-events-none z-30 select-none w-20"
    >
      <div
        ref={rulerContainerRef}
        className="relative w-full h-full flex justify-center"
      >
        {/* 1px Vertical Ruler Line */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-[var(--dimension)]" />

        {/* Ticks every 24px */}
        <div className="absolute inset-0 flex flex-col justify-between py-1">
          {ticks.map((_, i) => (
            <div
              key={i}
              className="w-2 h-px bg-[var(--dimension)] mx-auto"
            />
          ))}
        </div>

        {/* Progress Marker with Accent Triangle and Section Label */}
        <div
          style={{ top: `${scrollProgress * 100}%` }}
          className="absolute left-1/2 -translate-y-1/2 flex items-center transition-all duration-75 ease-out"
        >
          {/* Small accent triangle pointing right towards the column */}
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            fill="none"
            className="text-[var(--accent)] -translate-x-1/2 fill-current shrink-0"
          >
            <polygon points="0,0 8,4 0,8" />
          </svg>

          {/* Current Section Label */}
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--accent)] font-medium ml-2 whitespace-nowrap bg-[var(--background)] px-1 py-0.5 rounded border border-[var(--accent)]/30 shadow-xs">
            {activeSection}
          </span>
        </div>
      </div>
    </aside>
  );
}

