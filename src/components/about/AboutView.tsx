"use client";

import * as React from "react";
import { ViewFrame } from "@/components/ui/ViewFrame";
import { Tabs } from "@/components/about/Tabs";
import { useTabHash, TabId } from "@/components/about/useTabHash";
import { ProfilePane } from "@/components/about/ProfilePane";
import { EducationPane } from "@/components/about/EducationPane";
import { SkillsPane } from "@/components/about/SkillsPane";
import { HighlightsPane } from "@/components/about/HighlightsPane";
import { Reveal } from "@/components/motion/Reveal";
import { motion, AnimatePresence } from "motion/react";
import { EASE_OUT_EXPO, useMotionOK } from "@/components/motion/ease";

export function AboutView() {
  const { activeTab, selectTab } = useTabHash();
  const motionOK = useMotionOK();

  const renderActivePane = (tab: TabId) => {
    switch (tab) {
      case "profile":
        return <ProfilePane />;
      case "education":
        return <EducationPane />;
      case "skills":
        return <SkillsPane />;
      case "highlights":
        return <HighlightsPane />;
      default:
        return <ProfilePane />;
    }
  };

  return (
    <ViewFrame
      kicker="03 — About"
      title="About"
      sub="A short version of who I am, what I studied, what I use and what I have done."
      compactHeader
    >
      <div className="flex flex-col gap-6 sm:gap-8 w-full">
        {/* Accessible Tabs Row */}
        <Reveal delay={0.1} y={8}>
          <Tabs activeTab={activeTab} onSelectTab={selectTab} />
        </Reveal>

        {/* Tab Panel Container with fixed min-height to prevent layout jumps */}
        <div
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          tabIndex={0}
          className="w-full min-h-[380px] lg:min-h-[400px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-4 rounded-sm"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={motionOK ? { opacity: 0, y: 8 } : { opacity: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: motionOK ? 0.22 : 0.12,
                ease: EASE_OUT_EXPO,
              }}
              className="w-full"
            >
              {renderActivePane(activeTab)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </ViewFrame>
  );
}
