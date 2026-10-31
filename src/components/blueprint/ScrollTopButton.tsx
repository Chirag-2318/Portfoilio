"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

interface ScrollTopButtonProps {
  className?: string;
}

export function ScrollTopButton({ className }: ScrollTopButtonProps) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      title="Scroll to top"
      className={cn(
        "fixed bottom-4 right-4 z-40 size-8 rounded-lg border border-[var(--border)] bg-[var(--background)] text-muted-foreground hover:text-foreground hover:bg-[var(--muted)] flex items-center justify-center transition-all shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}
