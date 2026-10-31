"use client";

import * as React from "react";
import { IconTile } from "@/components/blueprint/IconTile";
import { PanelHeader } from "@/components/blueprint/PanelHeader";
import { HandwrittenNote } from "@/components/blueprint/HandwrittenNote";
import { TechRow } from "@/components/tech/TechRow";
import type { TechId } from "@/lib/tech-icons";

interface ProjectItem {
  id: string;
  title: string;
  kind: string;
  year?: string;
  oneLine: string;
  bullets: string[];
  techs: TechId[];
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
    techs: ["spring-boot", "java", "postgresql", "aws-s3", "jwt", "jpa", "python"],
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
    techs: ["fastapi", "postgresql", "sqlalchemy", "firebase", "aws-s3", "groq"],
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
    techs: ["kotlin", "jetpack-compose", "room", "sqlcipher", "hilt", "mlkit", "whisper"],
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
      <PanelHeader
        sheet="SHEET 04 / 09"
        title={
          <span className="flex items-baseline">
            Projects
            <sup className="text-xs font-mono text-muted-foreground ml-1.5 font-normal">
              (3)
            </sup>
          </span>
        }
      />

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
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5 font-sans">
                    {project.oneLine}
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
                    ? "max-h-[800px] opacity-100 border-t border-[var(--line)]"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-5 sm:pl-16 space-y-5 bg-[var(--background)]">
                  <ul className="list-disc ps-4 space-y-2 text-sm text-foreground marker:text-muted-foreground leading-relaxed">
                    {project.bullets.map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>

                  {/* Real Technology & Tool Brand Tiles */}
                  <div className="pt-3 border-t border-[var(--line)]/60">
                    <TechRow
                      heading="Technologies & Tools"
                      techs={project.techs}
                      size="sm"
                      layoutId={`project-${project.id}`}
                    />
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
