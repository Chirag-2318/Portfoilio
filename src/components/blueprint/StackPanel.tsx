"use client";

import * as React from "react";
import { PanelHeader } from "@/components/blueprint/PanelHeader";
import { TechChip } from "@/components/tech/TechChip";
import { site } from "@/content/site";

export function StackPanel() {
  return (
    <div className="relative bg-[var(--background)]">
      <PanelHeader title="Stack" sheetId="stack" className="py-3 px-5" />

      <div className="py-4 px-5 space-y-3">
        {site.skills.map((group) => (
          <div
            key={group.group}
            className="grid grid-cols-1 sm:grid-cols-[130px_1fr] items-start gap-1 sm:gap-4"
          >
            <h3 className="text-[13px] font-semibold text-foreground mt-1 select-none">
              {group.group}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {group.techs.map((techId) => (
                <TechChip key={techId} id={techId} size="sm" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
