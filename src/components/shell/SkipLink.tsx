import * as React from "react";

export function SkipLink() {
  return (
    <a
      data-print="hide"
      href="#content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-surface focus:text-ink focus:border focus:border-line-strong focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent font-medium text-sm transition-all"
    >
      <span className="underline decoration-accent decoration-2 underline-offset-4">
        Skip to content
      </span>
    </a>
  );
}

