"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { site } from "@/content/site";
import { Chip } from "@/components/ui/Chip";
import { MagneticArrow } from "@/components/ui/MagneticArrow";
import { EASE_OUT_EXPO, useMotionOK } from "@/components/motion/ease";

export type ProjectItem = (typeof site.projects)[number];

export interface ProjectDetailProps {
  project: ProjectItem;
  variant?: "panel" | "inline";
  onNextProject?: () => void;
  className?: string;
}

export function ProjectDetail({
  project,
  variant = "panel",
  onNextProject,
  className = "",
}: ProjectDetailProps) {
  const isInline = variant === "inline";
  const motionOK = useMotionOK();

  const content = (
    <div className="flex flex-col gap-2.5 sm:gap-3 w-full">
      {/* 1. Meta row: Chips for kind, year, and context */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <Chip>{project.kind}</Chip>
        {project.year && <Chip>{project.year}</Chip>}
        {project.context && <Chip>{project.context}</Chip>}
      </div>

      {/* 2. Title: Fraunces 2xl-ish */}
      <h2
        className="font-serif font-medium text-2xl sm:text-[26px] lg:text-[28px] xl:text-[34px] text-ink leading-[1.08] tracking-[-0.02em]"
        style={{ fontVariationSettings: '"opsz" 72' }}
      >
        {project.title}
      </h2>

      {/* 3. Summary */}
      <p className="text-[15px] sm:text-base text-ink max-w-[54ch] leading-relaxed">
        {project.summary}
      </p>

      {/* 4. 1px var(--line) rule */}
      <div className="w-full h-px bg-line my-0.5 sm:my-1" aria-hidden="true" />

      {/* 5. What I built */}
      <div className="space-y-2">
        <span className="label block text-ink-2">What I built</span>
        <ul className="space-y-2">
          {project.bullets.map((bullet, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 text-[13px] sm:text-sm text-ink leading-relaxed"
            >
              <span
                className="w-1 h-1 rounded-[1px] bg-accent shrink-0 mt-2"
                aria-hidden="true"
              />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 6. Stack */}
      <div className="space-y-2 pt-0.5">
        <span className="label block text-ink-2">Stack</span>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {project.stack.map((item) => (
            <Chip key={item}>{item}</Chip>
          ))}
        </div>
      </div>
    </div>
  );

  if (isInline) {
    return (
      <div className={`border-l border-line pl-4 sm:pl-5 py-3 ${className}`}>
        {content}
      </div>
    );
  }

  // Desktop/Tablet Panel variant
  return (
    <div
      className={`relative bg-surface border border-line rounded-lg p-4 sm:p-5 lg:p-5 xl:p-8 w-full shadow-xs flex flex-col justify-between ${className}`}
    >
      {/* Screen reader polite announcement of selected project title */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {project.title}
      </span>

      <AnimatePresence mode="wait">
        <motion.div
          key={project.id}
          initial={motionOK ? { opacity: 0, y: 8 } : { opacity: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={motionOK ? { opacity: 0, y: -8 } : { opacity: 0 }}
          transition={{
            duration: motionOK ? 0.22 : 0.12,
            ease: EASE_OUT_EXPO,
          }}
          className="w-full h-full"
        >
          {content}
        </motion.div>
      </AnimatePresence>

      {onNextProject && (
        <div className="hidden lg:flex justify-end pt-3 mt-3 border-t border-line hairline">
          <button
            type="button"
            onClick={onNextProject}
            aria-label="View next project"
            className="group inline-flex items-center gap-2.5 h-11 px-4 rounded-full border border-line-strong bg-paper hover:bg-paper-2 text-ink text-xs font-mono uppercase tracking-wider cursor-pointer select-none transition-all duration-160 ease-out-expo focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-3 active:scale-[0.98]"
          >
            <span>Next project</span>
            <MagneticArrow variant="outline" />
          </button>
        </div>
      )}
    </div>
  );
}
