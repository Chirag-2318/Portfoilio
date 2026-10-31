"use client";

import * as React from "react";
import { PanelHeader } from "@/components/blueprint/PanelHeader";
import { TechRow } from "@/components/tech/TechRow";
import { site } from "@/content/site";

export function StackPanel() {
  return (
    <div className="relative">
      <PanelHeader title="Stack" sheet="SHEET 07 / 09" />

      <div className="p-5 sm:p-6 space-y-6">
        {site.skills.map((group) => (
          <div key={group.group} className="relative">
            <TechRow
              heading={group.group}
              techs={group.techs}
              size="md"
              layoutId={`stack-${group.group}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
