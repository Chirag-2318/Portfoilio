import * as React from "react";
import { PanelHeader } from "@/components/blueprint/PanelHeader";

interface StackGroup {
  name: string;
  items: string[];
}

const STACK_GROUPS: StackGroup[] = [
  {
    name: "Languages",
    items: ["Java", "Kotlin", "Python", "C++", "SQL"],
  },
  {
    name: "Frameworks",
    items: [
      "Spring Boot",
      "Spring Framework",
      "Spring Security",
      "Servlets",
      "JPA",
      "FastAPI",
      "Jetpack Compose",
      "Hilt",
    ],
  },
  {
    name: "Databases",
    items: ["MySQL", "PostgreSQL", "Room", "SQLCipher"],
  },
  {
    name: "Cloud and tools",
    items: [
      "AWS S3",
      "AWS RDS",
      "Git",
      "GitHub",
      "Maven",
      "Gradle",
      "IntelliJ IDEA",
      "Android Studio",
      "Postman",
    ],
  },
];

export function StackPanel() {
  return (
    <div className="relative">
      <PanelHeader title="Stack" />

      <div className="divide-y divide-[var(--line)]">
        {STACK_GROUPS.map((group) => (
          <div key={group.name} className="relative">
            {/* Group Header Row */}
            <div className="px-4 py-2 bg-[var(--muted)]/40 border-b border-[var(--line)]">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {group.name}
              </span>
            </div>

            {/* Grid of Cells with right & bottom borders */}
            <div className="grid grid-cols-2 sm:grid-cols-3">
              {group.items.map((item, idx) => {
                return (
                  <div
                    key={item}
                    className="flex items-center gap-2.5 px-4 py-3 border-r border-b border-[var(--line)] hover:bg-[var(--accent-muted)] transition-colors duration-150 group"
                  >
                    <TechIcon name={item} />
                    <span className="text-sm text-foreground truncate font-sans">
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TechIcon({ name }: { name: string }) {
  // Return crisp 16x16 SVG icon or mono initial tile
  switch (name) {
    case "Java":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0">
          <path d="M4 19c6 2 10 2 16 0" />
          <path d="M6 15c4 1.5 8 1.5 12 0" />
          <path d="M10 2c-1 2-1 4 2 6" />
          <path d="M14 2c-1 2-1 4 2 6" />
          <path d="M12 11c-2 2-2 4 4 6" />
        </svg>
      );
    case "Kotlin":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0">
          <polygon points="2 2 22 2 12 12 22 22 2 22" />
        </svg>
      );
    case "Python":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0">
          <path d="M12 2v4a2 2 0 0 1-2 2H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2v-2a2 2 0 0 1 2-2h4a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2z" />
          <path d="M12 22v-4a2 2 0 0 1 2-2h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2v2a2 2 0 0 1-2 2h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2z" />
        </svg>
      );
    case "PostgreSQL":
    case "MySQL":
    case "SQL":
    case "SQLCipher":
    case "Room":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      );
    case "Spring Boot":
    case "Spring Framework":
    case "Spring Security":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M8 11l3 3 5-5" />
        </svg>
      );
    case "FastAPI":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case "Jetpack Compose":
    case "Android Studio":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      );
    case "AWS S3":
    case "AWS RDS":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0">
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
        </svg>
      );
    case "Git":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0">
          <circle cx="18" cy="18" r="3" />
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <line x1="6" y1="9" x2="6" y2="15" />
          <path d="M18 15a9 9 0 0 0-9-9" />
        </svg>
      );
    case "GitHub":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0">
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
          <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
      );
    default:
      return (
        <span className="size-4 rounded-sm bg-[var(--muted)] border border-[var(--border)] font-mono text-[9px] font-semibold flex items-center justify-center text-muted-foreground shrink-0">
          {name.charAt(0)}
        </span>
      );
  }
}

