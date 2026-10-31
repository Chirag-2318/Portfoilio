"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/cn";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted
    ? theme === "light"
      ? "light"
      : theme === "blueprint"
      ? "blueprint"
      : "dark"
    : "dark";

  const cycleTheme = React.useCallback(() => {
    // dark -> light -> blueprint -> dark
    const nextTheme =
      currentTheme === "dark"
        ? "light"
        : currentTheme === "light"
        ? "blueprint"
        : "dark";

    if (typeof document !== "undefined" && "startViewTransition" in document) {
      (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
        setTheme(nextTheme);
      });
    } else {
      setTheme(nextTheme);
    }
  }, [currentTheme, setTheme]);

  const label =
    currentTheme === "dark"
      ? "Switch to light theme"
      : currentTheme === "light"
      ? "Switch to blueprint theme"
      : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={label}
      title={`${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)} theme (${label})`}
      className={cn(
        "size-8 rounded-[10px] flex items-center justify-center transition-colors select-none",
        "text-muted-foreground hover:text-foreground hover:bg-[var(--muted)] active:scale-[0.98]",
        "focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      {currentTheme === "dark" && (
        /* Moon icon */
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
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}

      {currentTheme === "light" && (
        /* Sun icon */
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
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      )}

      {currentTheme === "blueprint" && (
        /* Drafting compass / set-square icon */
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
          <polygon points="4 20 20 20 4 4 4 20" />
          <line x1="8" y1="20" x2="8" y2="16" />
          <line x1="12" y1="20" x2="12" y2="16" />
          <line x1="16" y1="20" x2="16" y2="16" />
          <circle cx="9" cy="13" r="2" />
        </svg>
      )}
    </button>
  );
}
