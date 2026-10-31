"use client";

import * as React from "react";
import { PanelHeader } from "@/components/blueprint/PanelHeader";

export function AboutPanel() {
  const [greetingWord, setGreetingWord] = React.useState<string>("Good");
  const [periodWord, setPeriodWord] = React.useState<string>("day.");
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreetingWord("Good");
      setPeriodWord("morning.");
    } else if (hour >= 12 && hour < 17) {
      setGreetingWord("Good");
      setPeriodWord("afternoon.");
    } else if (hour >= 17 && hour < 22) {
      setGreetingWord("Good");
      setPeriodWord("evening.");
    } else {
      setGreetingWord("Good");
      setPeriodWord("night.");
    }
  }, []);

  return (
    <div>
      <PanelHeader noBottomLine sheetId="about">
        <h2
          className="font-serif text-[2.25rem] leading-[1.05] font-normal tracking-[-0.005em] text-balance text-foreground min-h-[2.5rem] flex items-baseline gap-2"
          style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
        >
          <span>{greetingWord}</span>
          <span className="relative inline-block whitespace-nowrap">
            <span className="italic">{periodWord}</span>
            <svg
              viewBox="0 0 100 12"
              fill="none"
              preserveAspectRatio="none"
              className="absolute left-0 -bottom-2 w-full h-2.5 text-[var(--accent)] pointer-events-none overflow-visible"
              aria-hidden="true"
            >
              <path
                d="M 2 8 C 30 3, 70 11, 98 5"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 100,
                  strokeDashoffset: isMounted ? 0 : 100,
                  transition: "stroke-dashoffset 500ms ease-out 150ms",
                }}
              />
            </svg>
          </span>
        </h2>
      </PanelHeader>

      <div className="p-5 sm:p-6 pt-3">
        <ul className="list-disc ps-3.5 space-y-2.5 text-sm text-foreground marker:text-muted-foreground leading-relaxed">
          <li>
            Hello. I&apos;m Chirag, a developer from Pune.
          </li>
          <li>
            Studying Electronics and Telecommunication at Pune Institute of Computer Technology (PICT) and Data Science and Programming at IIT Madras (2024 — 2028).
          </li>
          <li>
            Barclays Summer Intern (upcoming), selected through Hack-O-Hire. Winner at COEP Inspiron, Top 7 at iQOO Hackathon, finalist at Barclays Hack-O-Hire, Tata Motors COEP MindSpark &apos;25 and PISB Techrush 2025.
          </li>
        </ul>
      </div>

      {/* Two 1px hairlines with a 16px gap between them (double rule ending the panel) */}
      <div className="relative pt-2" aria-hidden="true">
        <div className="w-full h-px bg-[var(--line)]" />
        <div className="w-full h-4" />
        <div className="w-full h-px bg-[var(--line)]" />
      </div>
    </div>
  );
}
