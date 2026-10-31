"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PanelHeader } from "@/components/blueprint/PanelHeader";
import { site, type Project, type ProjectCategory } from "@/content/site";
import { playSound } from "@/components/sound/sound-effects";
import { ProjectPattern } from "@/components/projects/ProjectPattern";
import { ProjectDetails } from "@/components/projects/ProjectDetails";
import projectImagesManifest from "@/content/project-images.json";

type CategoryFilter = "All" | ProjectCategory;
const CATEGORIES: CategoryFilter[] = ["All", "Full-stack", "Backend", "Android"];

interface ImageManifestItem {
  src: string;
  width: number;
  height: number;
  blur: string;
}

const PROJECT_IMAGES: Record<string, ImageManifestItem> = projectImagesManifest;

function useProjectStars(githubUrl?: string | null) {
  const [stars, setStars] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!githubUrl) return;
    try {
      const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) return;
      const [, owner, repo] = match;
      const cleanRepo = repo.replace(/\.git$/, "");
      const cacheKey = `gh-stars:${owner}/${cleanRepo}`;

      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const { stars: cachedStars, expiry } = JSON.parse(cached);
          if (Date.now() < expiry && typeof cachedStars === "number") {
            setStars(cachedStars);
            return;
          }
        }
      } catch {}

      fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && typeof data.stargazers_count === "number" && data.stargazers_count >= 1) {
            setStars(data.stargazers_count);
            try {
              sessionStorage.setItem(
                cacheKey,
                JSON.stringify({
                  stars: data.stargazers_count,
                  expiry: Date.now() + 30 * 60 * 1000,
                })
              );
            } catch {}
          }
        })
        .catch(() => {});
    } catch {}
  }, [githubUrl]);

  return stars;
}

export function ProjectsPanel() {
  const [selectedCategory, setSelectedCategory] = React.useState<CategoryFilter>("All");
  const [activeProject, setActiveProject] = React.useState<Project | null>(null);

  const filteredProjects = React.useMemo(() => {
    if (selectedCategory === "All") return site.projects;
    return site.projects.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  const seeMoreUrl = site.links.seeMoreProjects;

  // Arrow key navigation for radiogroup
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = (index + 1) % CATEGORIES.length;
      playSound("select");
      setSelectedCategory(CATEGORIES[next]);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (index - 1 + CATEGORIES.length) % CATEGORIES.length;
      playSound("select");
      setSelectedCategory(CATEGORIES[prev]);
    }
  };

  return (
    <div className="relative">
      <PanelHeader
        sheetId="projects"
        title={
          <span className="flex items-baseline">
            Projects
            <sup className="text-xs font-mono text-muted-foreground ml-1.5 font-normal">
              ({filteredProjects.length})
            </sup>
          </span>
        }
      />

      {/* Toolbar row: Filter pills & See More Link */}
      <div className="px-5 pt-5 pb-3 border-b border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--background)]">
        {/* Segmented Control */}
        <div
          role="radiogroup"
          aria-label="Filter projects by category"
          className="inline-flex rounded-full border border-[var(--border)] p-0.5 gap-0.5 bg-transparent self-start"
        >
          {CATEGORIES.map((cat, idx) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                data-sound="select"
                onClick={() => setSelectedCategory(cat)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`relative px-3 h-7 rounded-full text-sm font-medium transition-colors select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                  isSelected
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="project-filter-pill"
                    transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    className="absolute inset-0 rounded-full bg-[var(--muted)]"
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            );
          })}
        </div>

        {/* See more projects link */}
        {seeMoreUrl && (
          <a
            href={seeMoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 self-start sm:self-auto underline decoration-dashed underline-offset-4"
          >
            <span>See more projects</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </a>
        )}
      </div>

      {/* Grid of Compact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3.5 gap-y-5 px-5 pb-5 pt-4 bg-[var(--background)]">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              onSelect={setActiveProject}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Details Dialog */}
      <ProjectDetails
        project={activeProject}
        isOpen={activeProject !== null}
        onClose={() => setActiveProject(null)}
      />
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  index: number;
  onSelect: (p: Project) => void;
}

function ProjectCard({ project, index, onSelect }: ProjectCardProps) {
  const [imgError, setImgError] = React.useState(false);
  const starCount = useProjectStars(project.links.github);
  const imgMeta = PROJECT_IMAGES[project.id];

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="flex flex-col group/card"
    >
      {/* Cover with Pattern Background & Cropped Floating Screenshot */}
      <button
        type="button"
        onClick={() => onSelect(project)}
        aria-label={`View details for ${project.name}`}
        className="group relative w-full aspect-video rounded-[10px] overflow-hidden border border-dashed border-[var(--border)] hover:border-[var(--muted-foreground)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors block cursor-pointer text-left select-none"
      >
        {/* Animated pattern background */}
        <div className="absolute inset-0 pointer-events-none">
          <ProjectPattern kind={project.pattern} />
        </div>

        {/* Screenshot (webp) or fallback monogram block */}
        {imgMeta && !imgError ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{
              duration: 0.42,
              ease: "easeOut",
              delay: (index % 2) * 0.06,
            }}
            className="absolute left-[8%] right-[8%] top-[10%] bottom-[-3%] overflow-hidden rounded-t-[8px] border border-white/12 dark:border-white/12 border-black/8 shadow-[0_10px_28px_-10px_rgba(0,0,0,0.55)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.55)] transition-transform duration-250 ease-out group-hover:translate-y-[-4px] group-hover:scale-[1.01] motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:scale-100 pointer-events-none"
          >
            <Image
              src={imgMeta.src}
              alt={`Screenshot of ${project.name}`}
              width={imgMeta.width}
              height={imgMeta.height}
              sizes="(min-width: 768px) 380px, 100vw"
              placeholder="blur"
              blurDataURL={imgMeta.blur}
              className="w-full h-full object-cover object-top"
              onError={() => setImgError(true)}
            />
          </motion.div>
        ) : (
          <div className="absolute left-[8%] right-[8%] top-[10%] bottom-[-3%] bg-[var(--muted)] rounded-t-[8px] flex items-center justify-center font-mono text-sm font-semibold text-muted-foreground border border-[var(--border)]">
            {project.monogram}
          </div>
        )}

        {/* Monogram Corner Badge */}
        <div className="absolute right-2 bottom-2 z-10 size-7 rounded-md bg-[var(--background)] border border-[var(--border)] flex items-center justify-center font-mono text-[10px] font-medium text-foreground shadow-xs pointer-events-none">
          {project.monogram}
        </div>
      </button>

      {/* Title & Stars row */}
      <div className="mt-2.5 flex items-baseline justify-between gap-2">
        <h3 className="font-sans text-[15px] font-medium text-foreground tracking-tight truncate">
          {project.name}
        </h3>
        {starCount !== null && starCount >= 1 && (
          <span className="font-mono text-xs text-muted-foreground tabular-nums shrink-0">
            ★ {starCount}
          </span>
        )}
      </div>

      {/* Summary Description (2-line clamp) */}
      <p className="text-sm text-muted-foreground line-clamp-2 mt-1 min-h-[40px] leading-snug">
        {project.summary}
      </p>

      {/* Action Buttons row */}
      <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {project.links.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              data-sound="select"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-medium bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span>GitHub</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
              className="inline-flex items-center gap-1 h-8 px-3 rounded-lg text-[13px] font-medium border border-[var(--border)] bg-transparent text-foreground hover:bg-[var(--muted)] active:scale-[0.98] transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span>Live Demo</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
          )}
        </div>

        <button
          type="button"
          data-sound="select"
          onClick={() => onSelect(project)}
          className="text-[13px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer py-1 px-1.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ml-auto"
        >
          Details
        </button>
      </div>
    </motion.div>
  );
}
