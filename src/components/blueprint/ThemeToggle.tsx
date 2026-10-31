"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { playSound } from "@/components/sound/sound-effects";

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
      : "dark"
    : "dark";

  const cycleTheme = React.useCallback(() => {
    // Check real DOM theme class
    const isDark =
      typeof document !== "undefined"
        ? document.documentElement.classList.contains("dark")
        : currentTheme === "dark";

    const nextTheme = isDark ? "light" : "dark";

    if (nextTheme === "light") {
      playSound("toggleOn");
    } else {
      playSound("toggleOff");
    }

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
      : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={label}
      title={`${currentTheme === "dark" ? "Dark" : "Light"} theme (${label})`}
      className={cn(
        "size-8 rounded-[10px] flex items-center justify-center transition-colors select-none",
        "text-muted-foreground hover:text-foreground hover:bg-[var(--muted)] active:scale-[0.98]",
        "focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      {currentTheme === "dark" ? (
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
      ) : (
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
    </button>
  );
}
