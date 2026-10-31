"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { site } from "@/content/site";
import { Icon } from "@/components/ui/Icon";
import { ProjectDetail } from "@/components/work/ProjectDetail";
import { EASE_IN_OUT_QUART, EASE_OUT_EXPO, useMotionOK } from "@/components/motion/ease";

export type ProjectItem = (typeof site.projects)[number];

export interface ProjectRowProps {
  project: ProjectItem;
  isSelected: boolean;
  isLast?: boolean;
  onSelect: () => void;
  tabIndex?: number;
  isMobile?: boolean;
  isOpen?: boolean;
  buttonRef?: (el: HTMLButtonElement | null) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}

export function ProjectRow({
  project,
  isSelected,
  isLast = false,
  onSelect,
  tabIndex = -1,
  isMobile = false,
  isOpen = false,
  buttonRef,
  onKeyDown,
}: ProjectRowProps) {
  const motionOK = useMotionOK();
  const rowRef = React.useRef<HTMLDivElement>(null);

  // Mobile scroll into view if selected on mount/hash change
  React.useEffect(() => {
    if (isMobile && isOpen && rowRef.current) {
      // Allow DOM layout to complete before scrolling
      const timer = setTimeout(() => {
        rowRef.current?.scrollIntoView({
          behavior: motionOK ? "smooth" : "auto",
          block: "start",
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isMobile, isOpen, motionOK]);

  // ===================== MOBILE ACCORDION ROW =====================
  if (isMobile) {
    const detailId = `detail-${project.id}`;
    const btnId = `btn-${project.id}`;

    return (
      <div
        ref={rowRef}
        className={`w-full border-t border-line ${isLast ? "border-b" : ""}`}
      >
        <button
          ref={buttonRef}
          id={btnId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={detailId}
          onClick={onSelect}
          className="group w-full min-h-[84px] py-4 pl-4 pr-3 flex items-center justify-between text-left cursor-pointer transition-colors duration-160 hover:bg-paper-2/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[-2px]"
        >
          <div className="flex flex-col gap-1 pr-3 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-ink-3 leading-none">
                {project.index}
              </span>
              <span className="font-mono text-[11px] text-ink-2 leading-none truncate">
                {project.kind}
                {project.year ? ` · ${project.year}` : ""}
              </span>
            </div>
            <span
              className={`font-serif text-lg leading-snug line-clamp-2 transition-colors duration-160 ${
                isOpen ? "text-ink font-medium" : "text-ink-2 group-hover:text-ink"
              }`}
            >
              {project.title}
            </span>
          </div>

          <div className="shrink-0 w-8 h-8 flex items-center justify-center">
            <span
              className={`transition-transform duration-260 ease-out-expo ${
                isOpen ? "rotate-180 text-accent" : "text-ink-3 group-hover:text-ink"
              }`}
            >
              <Icon name="chevron-down" size={16} />
            </span>
          </div>
        </button>

        {/* Expandable Accordion Region */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              id={detailId}
              role="region"
              aria-labelledby={btnId}
              initial={motionOK ? { height: 0, opacity: 0 } : false}
              animate={{ height: "auto", opacity: 1 }}
              exit={motionOK ? { height: 0, opacity: 0 } : { opacity: 0 }}
              transition={{
                duration: motionOK ? 0.3 : 0,
                ease: EASE_OUT_EXPO,
              }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-6 pt-1">
                <ProjectDetail project={project} variant="inline" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ===================== DESKTOP / TABLET ROW =====================
  return (
    <li className="w-full">
      <button
        ref={buttonRef}
        type="button"
        role="button"
        tabIndex={tabIndex}
        aria-pressed={isSelected}
        aria-current={isSelected ? "true" : undefined}
        onClick={onSelect}
        onKeyDown={onKeyDown}
        className={`group relative w-full min-h-[84px] lg:min-h-[88px] py-2.5 sm:py-3 pl-5 pr-4 flex items-center justify-between text-left cursor-pointer border-t border-line transition-colors duration-160 hover:bg-paper-2/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[-2px] ${
          isLast ? "border-b" : ""
        }`}
      >
        {/* Selected 2px var(--accent) sliding bar */}
        {isSelected && (
          <motion.div
            layoutId="work-bar"
            className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent"
            transition={{ duration: 0.26, ease: EASE_IN_OUT_QUART }}
          />
        )}

        <div className="flex flex-col gap-1.5 pr-4 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-[10px] leading-none transition-colors duration-160 ${
                isSelected ? "text-ink-2 font-medium" : "text-ink-3 group-hover:text-ink-2"
              }`}
            >
              {project.index}
            </span>
            <span className="font-mono text-[11px] text-ink-2 leading-none truncate">
              {project.kind}
              {project.year ? ` · ${project.year}` : ""}
            </span>
          </div>

          <span
            className={`font-serif text-xl lg:text-[22px] leading-snug line-clamp-2 transition-colors duration-160 ${
              isSelected ? "text-ink font-medium" : "text-ink-2 group-hover:text-ink"
            }`}
          >
            {project.title}
          </span>
        </div>

        <div className="shrink-0 w-8 h-8 flex items-center justify-center">
          <span
            className={`transition-colors duration-160 ${
              isSelected
                ? "text-accent"
                : "text-ink-3 group-hover:text-ink"
            }`}
          >
            <Icon name="arrow-up-right" size={16} />
          </span>
        </div>
      </button>
    </li>
  );
}
