"use client";

import * as React from "react";
import { ViewFrame } from "@/components/ui/ViewFrame";
import { useAssets } from "@/lib/AssetsContext";
import { ResumeSheet } from "@/components/resume/ResumeSheet";
import { ResumeActions } from "@/components/resume/ResumeActions";
import { Reveal } from "@/components/motion/Reveal";
import "./resume.css";

export function ResumeView() {
  const { hasResume } = useAssets();

  const sub = hasResume
    ? "Read it here, or download the PDF."
    : "Read it here. The PDF will be added soon.";

  return (
    <ViewFrame
      kicker="04 — Resume"
      title="Resume"
      sub={sub}
      compactHeader
      className="h-full flex flex-col min-h-0"
    >
      {/* DESKTOP (>= 1024px): Grid 12 cols, sheet in col 1-8, actions in col 9-12 */}
      <div className="hidden lg:grid grid-cols-12 gap-6 xl:gap-8 min-h-0 flex-1 items-stretch">
        <div className="col-span-8 h-full min-h-0 flex flex-col">
          <Reveal delay={0.1} y={12} className="h-full min-h-0 flex flex-col">
            <ResumeSheet />
          </Reveal>
        </div>
        <div className="col-span-4 sticky top-0">
          <Reveal delay={0.2} y={12}>
            <ResumeActions />
          </Reveal>
        </div>
      </div>

      {/* MOBILE / TABLET (< 1024px): Stack actions first, then sheet in normal flow */}
      <div className="flex flex-col gap-4 lg:hidden pb-6">
        <Reveal delay={0.06} y={8}>
          <ResumeActions />
        </Reveal>
        <Reveal delay={0.15} y={12}>
          <ResumeSheet />
        </Reveal>
      </div>
    </ViewFrame>
  );
}
