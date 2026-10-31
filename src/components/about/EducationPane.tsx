"use client";

import * as React from "react";
import { site } from "@/content/site";

export function EducationPane() {
  // Check if both programmes have identical years
  const allYearsMatch =
    site.education.length > 1 &&
    site.education.every((e) => e.years === site.education[0].years);

  return (
    <div className="w-full">
      <h2 className="sr-only">Education</h2>

      <div className="w-full border-b border-line">
        {site.education.map((item) => (
          <div
            key={item.institution}
            className="w-full border-t border-line py-5 sm:py-6 lg:py-7 px-3 sm:px-4 -mx-3 sm:-mx-4 rounded-sm transition-colors duration-160 hover:bg-paper-2/50"
          >
            {/* Desktop / Tablet layout */}
            <div className="hidden sm:grid grid-cols-12 gap-6 items-baseline">
              <div className="col-span-4 lg:col-span-3">
                <span className="font-mono text-lg sm:text-xl lg:text-2xl text-ink-2">
                  {item.years}
                </span>
              </div>
              <div className="col-span-8 lg:col-span-9 flex flex-col gap-1.5">
                <h3 className="font-serif font-medium text-xl sm:text-2xl lg:text-3xl text-ink leading-snug">
                  {item.institution}
                </h3>
                <p className="text-sm sm:text-base text-ink">
                  <span>{item.degree}</span>
                  <span className="text-ink-3 mx-2">·</span>
                  <span className="text-ink-2">{item.field}</span>
                </p>
              </div>
            </div>

            {/* Mobile layout */}
            <div className="flex flex-col gap-2 sm:hidden">
              <span className="font-mono text-sm text-ink-2">{item.years}</span>
              <h3 className="font-serif font-medium text-lg text-ink leading-snug">
                {item.institution}
              </h3>
              <p className="text-xs sm:text-sm text-ink leading-relaxed">
                <span>{item.degree}</span>
                <span className="text-ink-3 mx-1.5">·</span>
                <span className="text-ink-2">{item.field}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {allYearsMatch && (
        <p className="font-mono text-xs text-ink-2 pt-4 select-none">
          Both programmes run {site.education[0].years}.
        </p>
      )}
    </div>
  );
}
