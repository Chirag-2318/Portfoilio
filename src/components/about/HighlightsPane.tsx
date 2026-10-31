"use client";

import * as React from "react";
import { site } from "@/content/site";

export function HighlightsPane() {
  return (
    <div className="w-full">
      <h2 className="sr-only">Highlights</h2>

      <div className="w-full border-b border-line">
        {site.achievements.map((item) => {
          const isBarclays = item.id === "barclays";
          const isHackathons = item.id === "hackathons" && Boolean(item.results);

          return (
            <div
              key={item.id}
              className="w-full border-t border-line py-4 sm:py-5 min-h-[72px]"
            >
              {/* Desktop / Tablet layout (>= 768px) */}
              <div className="hidden sm:grid grid-cols-12 gap-4 lg:gap-6 items-start">
                {/* Col 1-2 (span 2): Category label */}
                <div className="col-span-3 lg:col-span-2 pt-1">
                  <span className="label text-ink-3 block">{item.label}</span>
                </div>

                {/* Col 3-7 (span 5): Title + Status */}
                <div className="col-span-5 lg:col-span-5 flex flex-wrap items-baseline gap-2">
                  <h3 className="font-serif font-medium text-xl lg:text-[22px] text-ink leading-snug">
                    {item.title}
                  </h3>
                  {isBarclays && item.status && (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-accent border border-accent rounded-full px-2 py-0.5 leading-none select-none inline-flex items-center">
                      {item.status}
                    </span>
                  )}
                </div>

                {/* Col 8-12 (span 5): Detail or Results list */}
                <div className="col-span-4 lg:col-span-5">
                  {isHackathons && item.results ? (
                    <ul className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-1.5 m-0 p-0 list-none">
                      {item.results.map((res) => {
                        const isWinner = res.rank.toLowerCase() === "winner";

                        return (
                          <li
                            key={res.where}
                            className="flex items-center text-xs sm:text-[13px] leading-relaxed"
                          >
                            {isWinner && (
                              <span
                                className="w-1.5 h-1.5 rounded-[1px] bg-accent inline-block mr-1.5 shrink-0"
                                aria-hidden="true"
                              />
                            )}
                            <span className="font-mono text-xs text-ink uppercase mr-1.5 font-medium">
                              {res.rank}
                            </span>
                            <span className="text-ink-3 mr-1.5">·</span>
                            <span className="text-ink-2 truncate">{res.where}</span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm lg:text-[15px] text-ink-2 leading-relaxed m-0">
                      {item.detail}
                    </p>
                  )}
                </div>
              </div>

              {/* Mobile layout (< 768px) */}
              <div className="flex flex-col gap-2 sm:hidden py-1">
                <span className="label text-ink-3">{item.label}</span>

                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-serif font-medium text-lg text-ink leading-snug">
                    {item.title}
                  </h3>
                  {isBarclays && item.status && (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-accent border border-accent rounded-full px-2 py-0.5 leading-none select-none inline-flex items-center">
                      {item.status}
                    </span>
                  )}
                </div>

                {isHackathons && item.results ? (
                  <ul className="flex flex-col gap-1.5 pt-1 m-0 p-0 list-none">
                    {item.results.map((res) => {
                      const isWinner = res.rank.toLowerCase() === "winner";

                      return (
                        <li
                          key={res.where}
                          className="flex items-center text-xs leading-relaxed"
                        >
                          {isWinner && (
                            <span
                              className="w-1.5 h-1.5 rounded-[1px] bg-accent inline-block mr-1.5 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                          <span className="font-mono text-xs text-ink uppercase mr-1.5 font-medium">
                            {res.rank}
                          </span>
                          <span className="text-ink-3 mr-1.5">·</span>
                          <span className="text-ink-2">{res.where}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-xs sm:text-sm text-ink-2 leading-relaxed m-0">
                    {item.detail}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
