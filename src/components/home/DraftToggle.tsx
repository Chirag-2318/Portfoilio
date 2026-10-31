"use client";

import * as React from "react";
import { Icon } from "@/components/ui/Icon";
import { useDraft } from "@/components/home/DraftContext";

export function DraftToggle({ className = "" }: { className?: string }) {
  const { draft, toggle } = useDraft();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={draft}
      data-lens-shrink
      className={`group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ink-2 hover:text-ink transition-all duration-160 cursor-pointer underline underline-offset-4 decoration-line-strong hover:decoration-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded-sm max-[767px]:h-10 max-[767px]:px-4 max-[767px]:rounded-full max-[767px]:border max-[767px]:border-line-strong max-[767px]:bg-surface max-[767px]:no-underline max-[767px]:shadow-xs ${className}`}
    >
      <Icon
        name="registration"
        size={14}
        className="text-accent shrink-0 transition-transform duration-160 group-hover:rotate-45"
      />
      <span>{draft ? "Back to final" : "Show first draft"}</span>
    </button>
  );
}
