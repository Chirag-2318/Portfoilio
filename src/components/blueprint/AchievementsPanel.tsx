"use client";

import * as React from "react";
import { IconTile } from "@/components/blueprint/IconTile";
import { PanelHeader } from "@/components/blueprint/PanelHeader";
import { HandwrittenNote } from "@/components/blueprint/HandwrittenNote";

interface AchievementItem {
  id: string;
  title: string;
  meta?: string;
  iconType: "trophy" | "flag" | "shield" | "mic" | "users";
}

const ACHIEVEMENTS_DATA: AchievementItem[] = [
  { id: "coep", title: "Winner, COEP Inspiron", iconType: "trophy" },
  { id: "iqoo", title: "Top 7, iQOO Hackathon", meta: "2026", iconType: "trophy" },
  { id: "barclays-hoh", title: "Finalist, Barclays Hack-O-Hire", iconType: "flag" },
  { id: "mindspark", title: "Finalist, Tata Motors COEP MindSpark '25", meta: "2025", iconType: "flag" },
  { id: "techrush", title: "Finalist, PISB Techrush 2025", meta: "2025", iconType: "flag" },
  { id: "nda", title: "Cleared NDA written examination (UPSC)", iconType: "shield" },
  { id: "ssb", title: "Cleared SSB Stage 1", iconType: "shield" },
  { id: "debate", title: "National-level debater", iconType: "mic" },
  { id: "csi", title: "Member, Computer Society of India (CSI), PICT Pune", meta: "Coding contests and workshops", iconType: "users" },
];

export function AchievementsPanel() {
  const [showAll, setShowAll] = React.useState(false);

  const visibleItems = showAll ? ACHIEVEMENTS_DATA : ACHIEVEMENTS_DATA.slice(0, 5);

  return (
    <div className="relative">
      <PanelHeader title="Achievements" sheet="SHEET 05 / 09" />

      <div className="divide-y divide-[var(--line)]">
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-4 px-5 gap-3 hover:bg-[var(--accent-muted)] transition-colors duration-150"
          >
            <div className="flex items-center gap-3 min-w-0">
              <IconTile size={24}>
                <AchievementIcon type={item.iconType} />
              </IconTile>
              <span className="text-sm font-medium text-foreground tracking-tight truncate">
                {item.title}
              </span>
            </div>

            {item.meta && (
              <span className="font-mono text-xs text-muted-foreground shrink-0 tabular-nums">
                {item.meta}
              </span>
            )}
          </div>
        ))}
      </div>

      {!showAll && (
        <div className="py-4 px-5 flex justify-center bg-[var(--background)]">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="h-8 px-3 rounded-lg border border-[var(--border)] text-sm font-medium text-foreground hover:bg-[var(--muted)] active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-ring"
          >
            Show all achievements ({ACHIEVEMENTS_DATA.length})
          </button>
        </div>
      )}
    </div>
  );
}

function AchievementIcon({ type }: { type: AchievementItem["iconType"] }) {
  switch (type) {
    case "trophy":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1h10v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34" />
          <path d="M6 4h12a2 2 0 0 1 2 2v3a8 8 0 0 1-8 8 8 8 0 0 1-8-8V6a2 2 0 0 1 2-2Z" />
        </svg>
      );
    case "flag":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
      );
    case "shield":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case "mic":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      );
    case "users":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
  }
}
