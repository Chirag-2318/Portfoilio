import * as React from "react";
import { IconTile } from "@/components/blueprint/IconTile";
import { PanelHeader } from "@/components/blueprint/PanelHeader";

export function EducationPanel() {
  return (
    <div className="relative">
      <PanelHeader title="Education" sheetId="education" />

      <div className="divide-y divide-[var(--line)]">
        {/* Entry 1: PICT */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between py-4 px-5 gap-2 hover:bg-[var(--accent-muted)] transition-colors duration-150">
          <div className="flex items-start gap-3 min-w-0">
            <IconTile size={24} className="mt-0.5">
              <GraduationCapIcon />
            </IconTile>
            <div className="min-w-0">
              <h3 className="text-base font-medium text-foreground tracking-tight">
                Pune Institute of Computer Technology (PICT)
              </h3>
              <p className="font-mono text-xs text-muted-foreground mt-0.5">
                B.Tech, Electronics and Telecommunication Engineering
              </p>
              <p className="font-mono text-xs text-muted-foreground/80 mt-0.5">
                Pune, Maharashtra, India
              </p>
            </div>
          </div>

          <span className="font-mono text-xs text-muted-foreground shrink-0 tabular-nums self-start sm:self-auto pl-9 sm:pl-0">
            2024 — 2028
          </span>
        </div>

        {/* Entry 2: IIT Madras */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between py-4 px-5 gap-2 hover:bg-[var(--accent-muted)] transition-colors duration-150">
          <div className="flex items-start gap-3 min-w-0">
            <IconTile size={24} className="mt-0.5">
              <GraduationCapIcon />
            </IconTile>
            <div className="min-w-0">
              <h3 className="text-base font-medium text-foreground tracking-tight">
                Indian Institute of Technology Madras
              </h3>
              <p className="font-mono text-xs text-muted-foreground mt-0.5">
                B.Sc, Data Science and Programming
              </p>
            </div>
          </div>

          <span className="font-mono text-xs text-muted-foreground shrink-0 tabular-nums self-start sm:self-auto pl-9 sm:pl-0">
            2024 — 2028
          </span>
        </div>
      </div>
    </div>
  );
}

function GraduationCapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

