"use client";

import * as React from "react";
import { IconTile } from "@/components/blueprint/IconTile";
import { Tag } from "@/components/blueprint/Tag";
import { PanelHeader } from "@/components/blueprint/PanelHeader";
import { HandwrittenNote } from "@/components/blueprint/HandwrittenNote";

interface ProjectItem {
  id: string;
  title: string;
  kind: string;
  year?: string;
  oneLine: string;
  bullets: string[];
  tags: string[];
  githubUrl?: string;
}

const PROJECTS_DATA: ProjectItem[] = [
  {
    id: "sar",
    title: "SAR Generator with Audit Trails",
    kind: "Hackathon project",
    oneLine: "Automated Suspicious Activity Report generation with role-based access.",
    bullets: [
      "Built a Spring Boot backend for automated Suspicious Activity Report (SAR) generation with RESTful APIs, JWT-based authentication and Role-Based Access Control (RBAC) for Analyst, Admin and Auditor roles.",
      "Designed a scalable data ingestion pipeline for CSV and JSON files, integrating AWS S3 for secure storage and managing 15+ relational entities using PostgreSQL and JPA (Hibernate).",
      "Integrated AI-powered analysis via a Python microservice for SAR narrative generation, typology detection and end-to-end compliance workflows; implemented audit logging and a DTO-based architecture for data integrity.",
    ],
    tags: ["Spring Boot", "Java", "PostgreSQL", "AWS S3", "JWT", "Python"],
  },
  {
    id: "validedi",
    title: "ValidEDI",
    kind: "Hackathon project",
    year: "2025",
    oneLine: "Healthcare EDI parser and validator.",
    bullets: [
      "Built an async FastAPI platform to process X12 HIPAA EDI transactions (837/835/834) with custom parsing, loop hierarchy construction and 50+ validation rules.",
      "Implemented Firebase JWT-based RBAC with 6 roles; integrated AWS S3 and PostgreSQL (JSONB, async ORM) for scalable storage and batch processing, with AI-powered EDI analysis via Groq Llama 3.3.",
    ],
    tags: ["FastAPI", "PostgreSQL", "SQLAlchemy", "Firebase", "AWS S3", "Groq"],
  },
  {
    id: "arthix",
    title: "ARTHIX",
    kind: "Android app · iQOO Hackathon 2026 - FinTech and Commerce",
    year: "2026",
    oneLine: "Zero-typing UPI expense tracker, fully on-device.",
    bullets: [
      "Built a fully on-device Android expense tracker that logs UPI spends with no typing: bank/UPI notifications (NotificationListenerService) supply the exact amount and payee, while a phone shake supplies the category.",
      "Designed a nearest-neighbour reconciliation engine (120 s symmetric window) pairing shakes and notifications in either order; all amounts stored as Long paise to avoid floating-point errors.",
      "Privacy-first design: no backend, AES-256 SQLCipher-encrypted Room DB, bounded accelerometer window for battery; LLM-phrased reports validated against deterministic math, plus offline Whisper voice splitting and ML Kit OCR.",
    ],
    tags: ["Kotlin", "Jetpack Compose", "Room", "SQLCipher", "Hilt", "ML Kit", "Whisper"],
  },
];

export function ProjectsPanel() {
  // Default: first item expanded, others collapsed
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

  return (
    <div className="relative">
      {/* Handwritten note on left margin pointing right */}
      <HandwrittenNote side="left" arrow="point-right" className="top-12">
        hackathons
      </HandwrittenNote>

      <PanelHeader>
        <h2 className="text-3xl font-medium tracking-tight text-foreground flex items-baseline">
          Projects
          <sup className="text-xs font-mono text-muted-foreground ml-1.5 font-normal">
            (3)
          </sup>
        </h2>
      </PanelHeader>

      <ul className="divide-y divide-[var(--line)] list-none p-0 m-0">
        {PROJECTS_DATA.map((project, index) => {
          const isExpanded = Boolean(expandedIds[project.id]);

          return (
            <li key={project.id} className="relative group">
              {/* Row Header (Click target) */}
              <button
                type="button"
                onClick={() => toggle(project.id)}
                aria-expanded={isExpanded}
                className="w-full text-left flex items-stretch hover:bg-[var(--accent-muted)] transition-colors duration-150 select-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {/* Left cell: IconTile with project index or code icon */}
                <div className="p-4 flex items-center justify-center shrink-0">
                  <IconTile>
                    <CodeFolderIcon index={index + 1} />
                  </IconTile>
                </div>

                {/* Right cell: border-l dashed var(--line), p-4 */}
                <div className="flex-1 min-w-0 border-l border-dashed border-[var(--line)] p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2 mb-1">
                      <span className="font-medium text-foreground text-base tracking-tight truncate">
                        {project.title}
                      </span>
                      {project.year && (
                        <span className="font-mono text-xs text-muted-foreground">
                          Period: {project.year}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground truncate leading-snug">
                      {project.oneLine}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Optional GitHub icon link */}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`GitHub repository for ${project.title}`}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      >
                        <GithubIcon />
                      </a>
                    )}

                    {/* Chevron icon */}
                    <svg
                      width="16"
                      height="16"
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
                    ? "max-h-[600px] opacity-100 border-t border-[var(--line)]"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-4 sm:pl-16 space-y-4 bg-[var(--background)]">
                  <ul className="list-disc ps-4 space-y-2 text-sm text-foreground marker:text-muted-foreground leading-relaxed">
                    {project.bullets.map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--line)]/60">
                    {project.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CodeFolderIcon({ index }: { index: number }) {
  return (
    <span className="font-mono text-xs font-semibold text-muted-foreground">
      0{index}
    </span>
  );
}

function GithubIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}
