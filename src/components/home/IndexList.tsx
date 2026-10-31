"use client";

import * as React from "react";
import { site } from "@/content/site";
import { ViewLink } from "@/components/transition/ViewLink";
import { Icon } from "@/components/ui/Icon";
import { useCopy } from "@/lib/useCopy";

export interface IndexListProps {
  variant: "final" | "draft";
  className?: string;
}

export function IndexList({ variant, className = "" }: IndexListProps) {
  const isDraft = variant === "draft";
  const { copy } = useCopy();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    copy(site.email, "Email copied");
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <dl className={`w-full divide-y divide-line border-b border-line ${className}`}>
      {site.home.index.map((row) => {
        const isHiddenOnMobile = row.key === "study" || row.key === "based";
        const isInteractive = Boolean(row.href);
        const isWon = row.key === "won";
        const isReach = row.key === "reach";
        const isBased = row.key === "based";

        const rowGridClasses = `grid grid-cols-[72px_1fr_auto] items-center min-h-[44px] lg:min-h-[48px] py-2 px-0 select-none ${
          isHiddenOnMobile ? "hidden md:grid" : "grid"
        }`;

        if (isReach) {
          return (
            <div key={row.key} className={rowGridClasses}>
              <dt className="label">{row.label}</dt>
              <dd className="truncate pr-2">
                {isDraft ? (
                  <span className="text-sm font-medium text-ink-2 truncate block">
                    {row.value}
                  </span>
                ) : (
                  <a
                    href={`mailto:${site.email}?subject=Hello%20Chirag`}
                    data-lens-shrink
                    className="text-sm font-medium text-ink hover:underline underline-offset-4 decoration-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded-xs truncate block"
                  >
                    {row.value}
                  </a>
                )}
              </dd>
              <dd className="flex items-center justify-end">
                {isDraft ? (
                  <div className="w-7 h-7 flex items-center justify-center text-ink-3">
                    <Icon name="copy" size={13} />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleCopy}
                    data-lens-shrink
                    aria-label="Copy email address"
                    className="w-7 h-7 rounded-sm flex items-center justify-center text-ink-2 hover:text-ink hover:bg-paper-2 transition-colors duration-160 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    <Icon name={copied ? "check" : "copy"} size={13} className={copied ? "text-accent" : ""} />
                  </button>
                )}
              </dd>
            </div>
          );
        }

        if (isInteractive && row.href) {
          const content = (
            <>
              <dt className="label">{row.label}</dt>
              <dd
                className={`text-sm font-medium transition-colors duration-160 pr-2 ${
                  isDraft
                    ? "text-ink-2"
                    : "text-ink group-hover:underline underline-offset-4 decoration-accent"
                } ${isDraft && isWon ? "line-through decoration-ink-3 decoration-1" : ""}`}
              >
                {row.value}
              </dd>
              <dd className="flex items-center justify-end w-5">
                <Icon
                  name="arrow-up-right"
                  size={14}
                  className={`text-accent transition-opacity duration-160 ${
                    isDraft ? "opacity-0" : "opacity-0 group-hover:opacity-100"
                  }`}
                />
              </dd>
            </>
          );

          if (isDraft) {
            return (
              <div key={row.key} className={rowGridClasses}>
                {content}
              </div>
            );
          }

          return (
            <ViewLink
              key={row.key}
              href={row.href}
              data-lens-shrink
              className={`group border-t-0 ${rowGridClasses} focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded-xs`}
            >
              {content}
            </ViewLink>
          );
        }

        // Static row (e.g. Based)
        return (
          <div key={row.key} className={rowGridClasses}>
            <dt className="label">{row.label}</dt>
            <dd
              className={`text-sm font-medium ${
                isBased || isDraft ? "text-ink-2" : "text-ink"
              }`}
            >
              {row.value}
            </dd>
            <dd className="w-5" />
          </div>
        );
      })}
    </dl>
  );
}
