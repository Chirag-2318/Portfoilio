"use client";

import * as React from "react";
import { site } from "@/content/site";
import { getSocials } from "@/lib/socials";

export function ResumeSheet() {
  const sheetRef = React.useRef<HTMLElement>(null);
  const [atEnd, setAtEnd] = React.useState(false);
  const socials = React.useMemo(() => getSocials().filter((s) => s.visible), []);

  React.useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;

    const checkScroll = () => {
      // 4px tolerance
      const isEnd = el.scrollHeight - el.scrollTop - el.clientHeight <= 6;
      setAtEnd(isEnd);
    };

    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll, { passive: true });

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  return (
    <div className="relative w-full max-w-[820px] h-full flex flex-col min-h-0">
      {/* Corner crop ticks outside the sheet */}
      <div
        data-print="hide"
        aria-hidden="true"
        className="absolute -top-1.5 -left-1.5 w-1.5 h-1.5 pointer-events-none select-none z-10 hidden sm:block"
      >
        <div className="absolute top-0 left-0 w-1.5 h-px bg-ink-3" />
        <div className="absolute top-0 left-0 w-px h-1.5 bg-ink-3" />
      </div>
      <div
        data-print="hide"
        aria-hidden="true"
        className="absolute -top-1.5 -right-1.5 w-1.5 h-1.5 pointer-events-none select-none z-10 hidden sm:block"
      >
        <div className="absolute top-0 right-0 w-1.5 h-px bg-ink-3" />
        <div className="absolute top-0 right-0 w-px h-1.5 bg-ink-3" />
      </div>
      <div
        data-print="hide"
        aria-hidden="true"
        className="absolute -bottom-1.5 -left-1.5 w-1.5 h-1.5 pointer-events-none select-none z-10 hidden sm:block"
      >
        <div className="absolute bottom-0 left-0 w-1.5 h-px bg-ink-3" />
        <div className="absolute bottom-0 left-0 w-px h-1.5 bg-ink-3" />
      </div>
      <div
        data-print="hide"
        aria-hidden="true"
        className="absolute -bottom-1.5 -right-1.5 w-1.5 h-1.5 pointer-events-none select-none z-10 hidden sm:block"
      >
        <div className="absolute bottom-0 right-0 w-1.5 h-px bg-ink-3" />
        <div className="absolute bottom-0 right-0 w-px h-1.5 bg-ink-3" />
      </div>

      {/* Main Resume Sheet */}
      <article
        ref={sheetRef}
        id="resume-sheet"
        aria-label="Resume of Chirag Patil"
        data-at-end={atEnd ? "true" : undefined}
        style={
          atEnd
            ? undefined
            : {
                maskImage:
                  "linear-gradient(to bottom, black calc(100% - 28px), transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, black calc(100% - 28px), transparent 100%)",
              }
        }
        className="w-full bg-surface border border-line-strong rounded-[16px] p-5 sm:p-8 xl:p-10 text-sm leading-snug lg:overflow-y-auto lg:max-h-full transition-[mask-image] duration-200"
      >
        {/* MASTHEAD */}
        <header className="border-b border-line pb-4">
          <h1 className="font-serif text-3xl sm:text-[36px] font-medium leading-[1.05] tracking-tight text-ink">
            Chirag Patil<span className="text-accent">.</span>
          </h1>
          <p className="text-base text-ink-2 mt-1 font-sans">{site.role}</p>

          <div className="mt-2.5 font-mono text-xs text-ink-2 flex flex-wrap items-center">
            <a
              href={`mailto:${site.email}`}
              className="hover:text-ink hover:underline underline-offset-2 [&:not(:last-child)]:after:content-['·'] [&:not(:last-child)]:after:mx-2 [&:not(:last-child)]:after:text-ink-3"
            >
              {site.email}
            </a>
            <a
              href={site.phone.href}
              className="hover:text-ink hover:underline underline-offset-2 [&:not(:last-child)]:after:content-['·'] [&:not(:last-child)]:after:mx-2 [&:not(:last-child)]:after:text-ink-3"
            >
              {site.phone.display}
            </a>
            <span className="[&:not(:last-child)]:after:content-['·'] [&:not(:last-child)]:after:mx-2 [&:not(:last-child)]:after:text-ink-3">
              Pune, Maharashtra, India
            </span>
            {socials.map((s) => (
              <span
                key={s.key}
                className="[&:not(:last-child)]:after:content-['·'] [&:not(:last-child)]:after:mx-2 [&:not(:last-child)]:after:text-ink-3"
              >
                {!s.placeholder ? (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-ink hover:underline underline-offset-2"
                  >
                    {s.label}
                  </a>
                ) : (
                  <span>{s.label}</span>
                )}
              </span>
            ))}
          </div>
        </header>

        {/* SECTIONS */}
        <div className="pt-4 space-y-5">
          {/* 1. EDUCATION */}
          <section id="resume-education" className="resume-section scroll-mt-6" tabIndex={-1}>
            <h2 className="label text-ink-3 uppercase pb-1 border-b border-line">
              Education
            </h2>
            <div className="mt-2.5 space-y-2.5">
              {site.education.map((edu) => (
                <div
                  key={edu.institution}
                  className="resume-row grid grid-cols-1 sm:grid-cols-[96px_1fr] gap-1 sm:gap-4 items-baseline"
                >
                  <span className="font-mono text-xs text-ink-3 shrink-0 tabular">
                    {edu.years}
                  </span>
                  <div>
                    <h3 className="font-serif text-[18px] font-medium leading-snug text-ink">
                      {edu.institution}
                    </h3>
                    <p className="text-sm text-ink-2 mt-0.5">
                      {edu.degree} · {edu.field}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 2. SKILLS */}
          <section id="resume-skills" className="resume-section scroll-mt-6" tabIndex={-1}>
            <h2 className="label text-ink-3 uppercase pb-1 border-b border-line">
              Skills
            </h2>
            <div className="mt-2.5 space-y-2">
              {site.skills.map((skill) => (
                <div
                  key={skill.group}
                  className="resume-row grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-1 sm:gap-4 items-baseline"
                >
                  <span className="label text-ink-2 shrink-0">{skill.group}</span>
                  <ul className="inline-flex flex-wrap items-center text-sm text-ink-2" role="list">
                    {skill.items.map((item) => (
                      <li
                        key={item}
                        className="inline [&:not(:last-child)]:after:content-['·'] [&:not(:last-child)]:after:mx-1.5 [&:not(:last-child)]:after:text-ink-3 text-ink"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* 3. PROJECTS */}
          <section id="resume-projects" className="resume-section scroll-mt-6" tabIndex={-1}>
            <h2 className="label text-ink-3 uppercase pb-1 border-b border-line">
              Projects
            </h2>
            <div className="mt-2.5 space-y-2.5">
              {site.projects.map((proj) => {
                const metaParts = [
                  proj.kind,
                  proj.year,
                  proj.context,
                  ...proj.stack,
                ].filter(Boolean);

                return (
                  <div
                    key={proj.id}
                    className="resume-row flex items-start gap-3 sm:gap-4"
                  >
                    <span className="font-mono text-xs text-ink-3 shrink-0 pt-0.5">
                      {proj.index}
                    </span>
                    <div>
                      <h3 className="font-serif text-[18px] font-medium leading-snug text-ink">
                        {proj.title}
                      </h3>
                      <p className="font-mono text-xs text-ink-2 mt-0.5 leading-relaxed">
                        {metaParts.join(" · ")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 4. HIGHLIGHTS */}
          <section id="resume-highlights" className="resume-section scroll-mt-6" tabIndex={-1}>
            <h2 className="label text-ink-3 uppercase pb-1 border-b border-line">
              Highlights
            </h2>
            <div className="mt-2.5 space-y-2">
              {site.achievements.map((item) => {
                const isBarclays = item.id === "barclays";
                const isHackathons = item.id === "hackathons";
                const hackathonSummary =
                  isHackathons && item.results
                    ? item.results.map((r) => `${r.rank}, ${r.where}`).join(" · ")
                    : null;

                return (
                  <div key={item.id} className="resume-row">
                    <div className="font-serif text-[16px] font-medium leading-snug text-ink">
                      <span>{item.title}</span>
                      {isBarclays && (
                        <span className="font-sans text-sm text-ink-2 font-normal">
                          {" "}
                          — Upcoming
                        </span>
                      )}
                    </div>
                    {hackathonSummary && (
                      <p className="text-sm text-ink-2 mt-0.5 leading-relaxed">
                        {hackathonSummary}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}
