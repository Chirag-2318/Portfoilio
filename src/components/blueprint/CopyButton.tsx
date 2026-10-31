"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { useCopy } from "@/lib/useCopy";

interface CopyButtonProps {
  text: string;
  message?: string;
  className?: string;
}

export function CopyButton({ text, message, className }: CopyButtonProps) {
  const { copy } = useCopy();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const ok = await copy(text, message ?? "Copied to clipboard");
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    },
    [copy, text, message]
  );

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied to clipboard!" : `Copy ${text}`}
      title={copied ? "Copied!" : `Copy ${text}`}
      className={cn(
        "inline-flex items-center justify-center size-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150 ease-out select-none",
        "opacity-0 -translate-x-2.5 group-hover:opacity-100 group-hover:translate-x-0 group-focus-within:opacity-100 group-focus-within:translate-x-0",
        "[@media(pointer:coarse)]:opacity-100 [@media(pointer:coarse)]:translate-x-0",
        className
      )}
    >
      {copied ? (
        <span
          className="inline-flex items-center justify-center animate-[blurIn_200ms_ease-out] text-info"
          aria-hidden="true"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      ) : (
        <span
          className="inline-flex items-center justify-center transition-transform hover:scale-110"
          aria-hidden="true"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </span>
      )}
    </button>
  );
}
