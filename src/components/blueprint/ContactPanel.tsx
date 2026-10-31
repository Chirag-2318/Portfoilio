"use client";

import * as React from "react";
import { site } from "@/content/site";
import { PanelHeader } from "@/components/blueprint/PanelHeader";
import { CopyButton } from "@/components/blueprint/CopyButton";
import { FrameCell } from "@/components/ui/FrameCell";

export function ContactPanel() {
  const githubUrl = site.socials.github.url;
  const linkedinUrl = site.socials.linkedin.url;

  return (
    <div className="relative bg-[var(--background)]">
      <PanelHeader title="Contact" sheetId="contact" />

      {/* FrameCell wrapping the CTA block with py-10 inside */}
      <FrameCell contentClassName="py-10 px-4 sm:px-6">
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Open to internships, hackathon teams and interesting problems.
          </p>

          {/* Email with CopyButton and aligned "say hi" note */}
          <div className="relative inline-flex items-center">
            {/* Handwritten note "say hi": tip 8px to the left of the email block, vertically centred */}
            <div
              aria-hidden="true"
              className="hidden xl:flex absolute right-full mr-2 top-1/2 -translate-y-full flex-col items-end pointer-events-none select-none z-20"
            >
              <span
                className="text-xl/none font-medium text-[var(--accent)] opacity-90 tracking-tight whitespace-nowrap mb-1"
                style={{
                  fontFamily: "var(--font-caveat), cursive",
                  transform: "rotate(-5deg)",
                }}
              >
                say hi
              </span>
              <svg
                data-arrow-tip="contact"
                width="44"
                height="26"
                viewBox="0 0 44 26"
                fill="none"
                className="text-[var(--accent)] opacity-90 overflow-visible"
              >
                <path
                  d="M 4 4 C 16 6, 30 12, 42 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 33 24 L 42 24 L 40 16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Email + Copy */}
            <div data-email-block className="flex items-center gap-3 group max-w-fit">
              <a
                href={`mailto:${site.email}`}
                className="link font-mono text-base sm:text-lg font-medium text-foreground tracking-tight break-all"
              >
                {site.email}
              </a>
              <CopyButton text={site.email} message="Email copied to clipboard" />
            </div>
          </div>

          {/* Action Row: Primary Send Email Button + Social Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href={`mailto:${site.email}?subject=Hello%20Chirag`}
              className="h-9 px-4 rounded-lg bg-foreground text-background font-medium text-sm flex items-center justify-center hover:opacity-90 active:scale-[0.98] transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-ring"
            >
              Send an email
            </a>

            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile"
                title="GitHub"
                className="size-9 rounded-lg border border-[var(--border)] text-muted-foreground hover:text-foreground hover:bg-[var(--muted)] flex items-center justify-center transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
            )}

            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile"
                title="LinkedIn"
                className="size-9 rounded-lg border border-[var(--border)] text-muted-foreground hover:text-foreground hover:bg-[var(--muted)] flex items-center justify-center transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </FrameCell>
    </div>
  );
}
