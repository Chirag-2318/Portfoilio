"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/cn";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  const toggleTheme = React.useCallback(() => {
    const nextTheme = isDark ? "light" : "dark";

    // View Transitions API if supported
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
        setTheme(nextTheme);
      });
    } else {
      setTheme(nextTheme);
    }
  }, [isDark, setTheme]);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "size-8 rounded-[10px] flex items-center justify-center transition-colors select-none",
        "text-muted-foreground hover:text-foreground hover:bg-[var(--muted)] active:scale-[0.98]",
        "focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      {/* Half-filled circle icon */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className="transition-transform duration-200"
      >
        <circle
          cx="8"
          cy="8"
          r="6"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        {/* Left half solid in dark, right half solid in light */}
        {isDark ? (
          <path
            d="M 8 2 A 6 6 0 0 0 8 14 Z"
            fill="currentColor"
          />
        ) : (
          <path
            d="M 8 2 A 6 6 0 0 1 8 14 Z"
            fill="currentColor"
          />
        )}
      </svg>
    </button>
  );
}
