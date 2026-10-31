"use client";

import * as React from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { useAssets } from "@/lib/AssetsContext";
import { useToaster } from "@/components/ui/Toaster";
import { useMotionOK } from "@/components/motion/ease";
import { site } from "@/content/site";

const SECTIONS = [
  { id: "resume-education", label: "Education", index: "01" },
  { id: "resume-skills", label: "Skills", index: "02" },
  { id: "resume-projects", label: "Projects", index: "03" },
  { id: "resume-highlights", label: "Highlights", index: "04" },
];

export function ResumeActions() {
  const { hasResume } = useAssets();
  const { toast } = useToaster();
  const motionOK = useMotionOK();

  const handleJump = (sectionId: string) => {
    const container = document.getElementById("resume-sheet");
    const target = document.getElementById(sectionId);
    if (!target) return;

    if (container && window.innerWidth >= 1024) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const relativeTop = targetRect.top - containerRect.top + container.scrollTop - 12;

      container.scrollTo({
        top: Math.max(0, relativeTop),
        behavior: motionOK ? "smooth" : "auto",
      });
    } else {
      target.scrollIntoView({
        behavior: motionOK ? "smooth" : "auto",
        block: "start",
      });
    }

    target.focus?.({ preventScroll: true });
  };

  return (
    <div className="resume-actions-sidebar flex flex-col gap-6">
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
        {hasResume ? (
          <Button
            href={site.assets.resume}
            download="Chirag_Patil_Resume.pdf"
            variant="primary"
            className="w-full justify-center"
          >
            <Icon name="download" size={16} />
            <span>Download PDF</span>
          </Button>
        ) : (
          <button
            type="button"
            aria-disabled="true"
            onClick={() => toast("The PDF is being set")}
            className="group inline-flex items-center justify-center gap-2 text-sm font-medium h-11 sm:h-10 px-5 rounded-full border border-line-strong bg-transparent text-ink opacity-60 cursor-not-allowed select-none transition-all duration-160 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-3 w-full"
          >
            <Icon name="download" size={16} className="text-ink-2" />
            <span>PDF coming soon</span>
          </button>
        )}

        <Button
          variant="outline"
          onClick={() => window.print()}
          className="w-full justify-center"
        >
          <Icon name="printer" size={16} />
          <span>Print this sheet</span>
        </Button>
      </div>

      {/* Desktop only: Jump to navigation */}
      <div className="hidden lg:flex flex-col pt-2">
        <span className="label block mb-2 text-ink-2 select-none">Jump to</span>
        <nav aria-label="Resume sections" className="flex flex-col border-t border-line hairline">
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => handleJump(sec.id)}
              className="h-11 flex items-center justify-between text-sm text-ink-2 hover:text-ink border-b border-line hairline transition-colors duration-160 text-left cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 rounded-sm select-none group"
            >
              <span className="group-hover:translate-x-0.5 transition-transform duration-160 ease-out-expo">
                {sec.label}
              </span>
              <span className="font-mono text-xs text-ink-2">
                {sec.index}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

