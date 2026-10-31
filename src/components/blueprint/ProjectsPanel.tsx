"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PanelHeader } from "@/components/blueprint/PanelHeader";
import { MosaicReveal } from "@/components/ui/MosaicReveal";
import { TechChip } from "@/components/tech/TechChip";
import { site, type Project } from "@/content/site";

type CategoryFilter = "All" | "Backend" | "Android";
const CATEGORIES: CategoryFilter[] = ["All", "Backend", "Android"];

function useProjectStars(githubUrl?: string | null) {
  const [stars, setStars] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!githubUrl) return;
    try {
      const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) return;
      const [, owner, repo] = match;
      const cleanRepo = repo.replace(/\.git$/, "");
      const cacheKey = `gh_stars_${owner}_${cleanRepo}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const { stars: cachedStars, expiry } = JSON.parse(cached);
        if (Date.now() < expiry && typeof cachedStars === "number") {
          setStars(cachedStars);
          return;
        }
      }
      fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && typeof data.stargazers_count === "number") {
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
  const [expandedIds, setExpandedIds] = React.useState<Record<string, boolean>>({
    sar: true,
    validedi: false,
    arthix: false,
  });

  const toggle = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredProjects = React.useMemo(() => {
    if (selectedCategory === "All") return site.projects;
    return site.projects.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  const githubUser = site.links.githubUsername;

  // Arrow key navigation for radiogroup
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = (index + 1) % CATEGORIES.length;
      setSelectedCategory(CATEGORIES[next]);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (index - 1 + CATEGORIES.length) % CATEGORIES.length;
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

      {/* Filter Bar & See More Link */}
      <div className="px-5 pt-4 pb-3 border-b border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--background)]">
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

        {/* See more projects link (rendered only if GITHUB_USERNAME is set) */}
        {githubUser && (
          <a
            href={`https://github.com/${githubUser}?tab=repositories`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 self-start sm:self-auto border-b border-dashed border-[var(--muted-foreground)] pb-0.5"
          >
            See more projects
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

      {/* Projects List */}
      <motion.ul
        layout
        className="divide-y divide-[var(--line)] list-none p-0 m-0"
      >
        <AnimatePresence initial={false}>
          {filteredProjects.map((project, index) => (
            <ProjectRow
              key={project.id}
              project={project}
              index={index}
              isExpanded={Boolean(expandedIds[project.id])}
              onToggle={() => toggle(project.id)}
            />
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}

function ProjectRow({
  project,
  index,
  isExpanded,
  onToggle,
}: {
  project: Project;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const ghUrl = project.links?.github;
  const liveUrl = project.links?.live;
  const starCount = useProjectStars(ghUrl);

  return (
    <motion.li
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="relative group bg-[var(--background)]"
    >
      {/* Row Header (Click target) */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full text-left flex items-center py-4 px-5 gap-4 hover:bg-[var(--accent-muted)] transition-colors duration-150 select-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {/* Clean mono index P-01..P-03 */}
        <span className="font-mono text-xs text-muted-foreground w-8 shrink-0">
          P-0{index + 1}
        </span>

        {/* Title & metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-medium text-foreground tracking-tight">
              {project.title}
            </span>
            {project.year && (
              <span className="font-mono text-xs text-muted-foreground">
                Period: {project.year}
              </span>
            )}
            {starCount !== null && (
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                ★ {starCount}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5 font-sans">
            {project.summary}
          </p>
        </div>

        {/* Right controls: chevron */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center justify-center size-6 rounded-md hover:bg-[var(--muted)] text-muted-foreground hover:text-foreground transition-colors">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-muted-foreground transition-transform duration-200 ease-out ${
                isExpanded ? "rotate-180" : "rotate-0"
              }`}
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </button>

      {/* Expanded details */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-out ${
          isExpanded
            ? "max-h-[1400px] opacity-100 border-t border-[var(--line)]"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-5 sm:pl-16 space-y-5 bg-[var(--background)]">
          {/* Cover Art Mosaic Reveal */}
          <div className="max-w-xl">
            <MosaicReveal
              src={project.cover}
              cols={8}
              rows={5}
              order="center"
              aspect="16 / 9"
              trigger="inView"
              alt={project.coverAlt}
              rounded="rounded-lg"
              className="border border-[var(--line-strong)]"
            />
          </div>

          {/* Bullets */}
          <ul className="list-disc ps-4 space-y-2 text-sm text-foreground marker:text-muted-foreground leading-relaxed">
            {project.bullets.map((bullet, i) => (
              <li key={i}>{bullet}</li>
            ))}
          </ul>

          {/* Technologies & Tools Row with Compact Chips */}
          <div className="pt-4 border-t border-[var(--line)]/60">
            <h4 className="text-[13px] font-semibold text-foreground mb-2">
              Technologies & Tools
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {project.techs.map((techId) => (
                <TechChip key={techId} id={techId} size="sm" />
              ))}
            </div>
          </div>

          {/* Action Buttons: GitHub & Live Demo (only rendered when URLs exist) */}
          {(ghUrl || liveUrl) && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {ghUrl && (
                <a
                  href={ghUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  <span>GitHub</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
              )}

              {liveUrl && (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium border border-[var(--border)] bg-transparent text-foreground hover:bg-[var(--muted)] transition-colors"
                >
                  <span>Live Demo</span>
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
          )}
        </div>
      </div>
    </motion.li>
  );
}
