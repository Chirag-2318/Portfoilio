"use client";

import React, { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import type { Project } from "@/content/site";
import { TechChip } from "@/components/tech/TechChip";
import { playSound } from "@/components/sound/sound-effects";

export interface ProjectDetailsProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectDetails({ project, isOpen, onClose }: ProjectDetailsProps) {
  useEffect(() => {
    if (isOpen) {
      playSound("open");
    }
  }, [isOpen]);

  if (!project) return null;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      playSound("close");
      onClose();
    }
  };

  const metaLine = [
    project.subtitle,
    project.period || project.year,
    project.context,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[color-mix(in_srgb,var(--background)_70%,transparent)] animate-in fade-in duration-200" />
        <Dialog.Content
          aria-describedby="project-details-description"
          className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-[560px] max-h-[80vh] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-2xl focus:outline-none animate-in zoom-in-95 duration-200 text-left"
        >
          {/* Close Icon Button */}
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Close"
              className="absolute top-4 right-4 flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-[var(--muted)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-base cursor-pointer transition-colors"
            >
              ×
            </button>
          </Dialog.Close>

          {/* Title */}
          <Dialog.Title
            className="font-serif text-[1.75rem] font-normal leading-tight text-foreground pr-8"
            style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
          >
            {project.name}
          </Dialog.Title>

          {/* Subtitle / Period / Context */}
          <p className="font-mono text-xs text-muted-foreground mt-1">
            {metaLine}
          </p>

          {/* Bullet Points */}
          <div id="project-details-description" className="mt-5 space-y-2.5">
            {project.bullets.map((bullet, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-sm text-foreground/90 leading-relaxed">
                <span className="text-muted-foreground select-none mt-0.5">•</span>
                <span>{bullet}</span>
              </div>
            ))}
          </div>

          {/* Technologies & Tools */}
          <div className="mt-6 pt-5 border-t border-[var(--line)]">
            <h4 className="text-[13px] font-semibold text-foreground mb-3 tracking-tight">
              Technologies & Tools
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {project.techs.map((t) => (
                <TechChip key={t} id={t} size="sm" />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center gap-2.5">
            {project.links.github && (
              <a
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
                data-sound="select"
                className="inline-flex items-center gap-2 h-8 px-3.5 rounded-lg text-[13px] font-medium bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span>GitHub</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
              </a>
            )}

            {project.links.live && (
              <a
                href={project.links.live}
                target="_blank"
                rel="noopener noreferrer"
                data-sound="select"
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-[13px] font-medium border border-[var(--border)] bg-transparent text-foreground hover:bg-[var(--muted)] active:scale-[0.98] transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span>Live Demo</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </a>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export default ProjectDetails;

