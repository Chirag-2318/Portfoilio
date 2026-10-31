"use client";

import * as React from "react";
import { IconTile } from "@/components/blueprint/IconTile";
import { Tag } from "@/components/blueprint/Tag";
import { PanelHeader } from "@/components/blueprint/PanelHeader";

export function ExperiencePanel() {
  const [expanded, setExpanded] = React.useState(true);

  return (
    <div className="relative">
      <PanelHeader title="Experience" />

      {/* Experience Entry */}
      <div className="p-4 relative">
        {/* Top Company Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
          <div className="flex items-center gap-3">
            <IconTile>
              <BuildingIcon />
            </IconTile>
            <h3 className="text-xl/6 font-medium text-foreground tracking-tight">
              Barclays
            </h3>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-mono text-muted-foreground self-start sm:self-auto pl-9 sm:pl-0">
            <span>Summer Internship</span>
            <span className="text-[var(--border)]" aria-hidden="true">
              |
            </span>
            <div className="flex items-center gap-1.5">
              <span className="status-dot-container" aria-hidden="true">
                <span className="status-dot-ping" />
                <span className="status-dot-core" />
              </span>
              <span className="sr-only">Upcoming</span>
              <span className="text-muted-foreground">Upcoming</span>
            </div>
          </div>
        </div>

        {/* Position Row with thin vertical connector line */}
        <div className="relative pl-3 mt-1">
          {/* 1px var(--border) connector line */}
          <div
            className="absolute left-3 top-0 bottom-4 w-px bg-[var(--border)] pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative pl-6">
            {/* Position trigger button */}
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              aria-expanded={expanded}
              className="w-full text-left flex items-center justify-between gap-3 py-1.5 group select-none rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <IconTile size={20} className="size-5">
                  <BriefcaseSmallIcon />
                </IconTile>
                <span className="font-medium text-foreground group-hover:text-foreground/80 transition-colors">
                  Summer Intern
                </span>
                <span className="text-muted-foreground/60" aria-hidden="true">
                  |
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  Period: Upcoming
                </span>
              </div>

              {/* Rotating Chevron */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-muted-foreground transition-transform duration-200 ease-out shrink-0 ${
                  expanded ? "rotate-180" : "rotate-0"
                }`}
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Expandable content */}
            <div
              className={`overflow-hidden transition-all duration-200 ease-out ${
                expanded ? "max-h-96 opacity-100 pt-2 pb-1" : "max-h-0 opacity-0"
              }`}
            >
              <div className="pl-7 space-y-3">
                <ul className="list-disc ps-3.5 space-y-1.5 text-sm text-foreground marker:text-muted-foreground leading-relaxed">
                  <li>
                    Selected for Barclays&apos; Internship Program after clearing the Hack-O-Hire hackathon round and the subsequent interview process.
                  </li>
                </ul>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Tag>Hack-O-Hire</Tag>
                  <Tag>Internship</Tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BuildingIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
  );
}

function BriefcaseSmallIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

