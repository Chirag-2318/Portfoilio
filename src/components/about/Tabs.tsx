"use client";

import * as React from "react";
import { motion } from "motion/react";
import { TabId } from "@/components/about/useTabHash";
import { EASE_IN_OUT_QUART } from "@/components/motion/ease";

export interface TabItem {
  id: TabId;
  index: string;
  label: string;
}

export const ABOUT_TABS: TabItem[] = [
  { id: "profile", index: "01", label: "Profile" },
  { id: "education", index: "02", label: "Education" },
  { id: "skills", index: "03", label: "Skills" },
  { id: "highlights", index: "04", label: "Highlights" },
];

export interface TabsProps {
  activeTab: TabId;
  onSelectTab: (id: TabId) => void;
  className?: string;
}

export function Tabs({ activeTab, onSelectTab, className = "" }: TabsProps) {
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let targetIndex = index;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      targetIndex = (index + 1) % ABOUT_TABS.length;
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      targetIndex = (index - 1 + ABOUT_TABS.length) % ABOUT_TABS.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      targetIndex = ABOUT_TABS.length - 1;
    } else {
      return;
    }

    const targetTab = ABOUT_TABS[targetIndex];
    if (targetTab) {
      onSelectTab(targetTab.id);
      tabRefs.current[targetIndex]?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label="About sections"
      className={`relative w-full border-b border-line flex items-center justify-between sm:justify-start gap-1 min-[360px]:gap-3 sm:gap-6 md:gap-7 select-none ${className}`}
    >
      {ABOUT_TABS.map((tab, idx) => {
        const isSelected = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[idx] = el;
            }}
            id={`tab-${tab.id}`}
            role="tab"
            type="button"
            tabIndex={isSelected ? 0 : -1}
            aria-selected={isSelected}
            aria-controls={`panel-${tab.id}`}
            onClick={() => onSelectTab(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`relative py-3 cursor-pointer font-mono text-[9.5px] min-[360px]:text-[11px] sm:text-xs uppercase tracking-tight min-[360px]:tracking-[0.04em] sm:tracking-[0.08em] whitespace-nowrap transition-colors duration-160 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 ${
              isSelected ? "text-ink font-medium" : "text-ink-2 hover:text-ink"
            }`}
          >
            <span className="text-ink-3 mr-0.5 min-[360px]:mr-1 sm:mr-1.5">{tab.index}</span>
            <span>{tab.label}</span>

            {/* Sliding 2px var(--accent) underline */}
            {isSelected && (
              <motion.div
                layoutId="about-tab"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent"
                transition={{ duration: 0.26, ease: EASE_IN_OUT_QUART }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
