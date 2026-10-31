"use client";

import * as React from "react";
import { site } from "@/content/site";
import { ViewFrame } from "@/components/ui/ViewFrame";
import { ProjectRow } from "@/components/work/ProjectRow";
import { ProjectDetail } from "@/components/work/ProjectDetail";
import { useProjectHash } from "@/components/work/useProjectHash";
import { Stagger } from "@/components/motion/Stagger";
import { Reveal } from "@/components/motion/Reveal";

export function WorkView() {
  const { selectedId, selectProject } = useProjectHash();
  const desktopButtonRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const selectedIndex = React.useMemo(() => {
    const idx = site.projects.findIndex((p) => p.id === selectedId);
    return idx >= 0 ? idx : 0;
  }, [selectedId]);

  const selectedProject = site.projects[selectedIndex] || site.projects[0];

  const handleNextProject = React.useCallback(() => {
    const nextIndex = (selectedIndex + 1) % site.projects.length;
    const nextProject = site.projects[nextIndex];
    if (nextProject) {
      selectProject(nextProject.id);
    }
  }, [selectedIndex, selectProject]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    let targetIndex = index;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      targetIndex = (index + 1) % site.projects.length;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      targetIndex = (index - 1 + site.projects.length) % site.projects.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      targetIndex = site.projects.length - 1;
    } else {
      return;
    }

    const targetProject = site.projects[targetIndex];
    if (targetProject) {
      selectProject(targetProject.id);
      desktopButtonRefs.current[targetIndex]?.focus();
    }
  };

  return (
    <ViewFrame
      kicker="02 — Selected work"
      title="Work"
      sub="Three builds, mostly from hackathons. Select one for the details."
      compactHeader
    >
      {/* ===================== DESKTOP / TABLET VIEW (>= 768px) ===================== */}
      <div className="hidden md:grid grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Project Rows list (Col 1-5) */}
        <div className="col-span-5 flex flex-col">
          <ul className="w-full flex flex-col" role="list">
            <Stagger baseDelay={0.06} staggerInterval={0.06}>
              {site.projects.map((project, idx) => {
                const isSelected = project.id === selectedProject.id;
                const isLast = idx === site.projects.length - 1;

                return (
                  <Reveal key={project.id} y={12}>
                    <ProjectRow
                      project={project}
                      isSelected={isSelected}
                      isLast={isLast}
                      tabIndex={isSelected ? 0 : -1}
                      onSelect={() => selectProject(project.id)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      buttonRef={(el) => {
                        desktopButtonRefs.current[idx] = el;
                      }}
                    />
                  </Reveal>
                );
              })}
            </Stagger>
          </ul>

          {/* Keyboard hint */}
          <span className="hidden [@media(hover:hover)_and_(pointer:fine)]:inline-block font-mono text-[11px] text-ink-3 pt-3 pl-1 select-none">
            ↑ ↓ to browse
          </span>
        </div>

        {/* Right Column: Project Detail Panel (Col 6-12, span 7) */}
        <div className="col-span-7">
          <Reveal delay={0.24} y={12}>
            <ProjectDetail
              project={selectedProject}
              variant="panel"
              onNextProject={handleNextProject}
              className="min-h-[320px] lg:min-h-[350px]"
            />
          </Reveal>
        </div>
      </div>

      {/* ===================== MOBILE VIEW (< 768px) ===================== */}
      <div className="block md:hidden">
        <Stagger baseDelay={0.06} staggerInterval={0.06}>
          {site.projects.map((project, idx) => {
            const isOpen = project.id === selectedId;
            const isLast = idx === site.projects.length - 1;

            return (
              <Reveal key={project.id} y={12}>
                <ProjectRow
                  isMobile
                  project={project}
                  isSelected={isOpen}
                  isOpen={isOpen}
                  isLast={isLast}
                  onSelect={() => selectProject(project.id)}
                />
              </Reveal>
            );
          })}
        </Stagger>
      </div>
    </ViewFrame>
  );
}
