"use client";

import * as React from "react";
import { site } from "@/content/site";
import { PanelHeader } from "@/components/blueprint/PanelHeader";

export function ResumePanel() {
  const [fileExists, setFileExists] = React.useState<boolean>(false);
  const [checking, setChecking] = React.useState<boolean>(true);

  React.useEffect(() => {
    fetch(site.assets.resume, { method: "HEAD" })
      .then((res) => {
        setFileExists(res.ok);
      })
      .catch(() => {
        setFileExists(false);
      })
      .finally(() => {
        setChecking(false);
      });
  }, []);

  return (
    <div className="relative">
      <PanelHeader title="Resume" sheet="SHEET 08 / 09" />

      <div className="p-5 sm:p-6 space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          A one-page summary of my education, skills, projects and achievements.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {fileExists ? (
            <>
              <a
                href={site.assets.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-4 rounded-lg bg-foreground text-background font-medium text-sm flex items-center justify-center hover:opacity-90 active:scale-[0.98] transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-ring"
              >
                View
              </a>

              <a
                href={site.assets.resume}
                download="Chirag_Patil_Resume.pdf"
                className="h-9 px-4 rounded-lg border border-[var(--border)] text-foreground font-medium text-sm flex items-center justify-center hover:bg-[var(--muted)] active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-ring"
              >
                Download
              </a>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled
                className="h-9 px-4 rounded-lg bg-[var(--muted)] text-muted-foreground font-medium text-sm flex items-center justify-center opacity-50 cursor-not-allowed border border-[var(--border)]"
              >
                View
              </button>

              <button
                type="button"
                disabled
                className="h-9 px-4 rounded-lg bg-[var(--muted)] text-muted-foreground font-medium text-sm flex items-center justify-center opacity-50 cursor-not-allowed border border-[var(--border)]"
              >
                Download
              </button>
            </>
          )}
        </div>

        {!checking && !fileExists && (
          <p className="font-mono text-xs text-muted-foreground mt-2">
            // Resume file coming soon.
          </p>
        )}
      </div>
    </div>
  );
}

