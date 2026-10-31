"use client";

import * as React from "react";
import { Panel } from "@/components/blueprint/Panel";
import { PanelHeader } from "@/components/blueprint/PanelHeader";
import { site } from "@/content/site";

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface ApiResponse {
  total: {
    [year: string]: number;
    lastYear: number;
  };
  contributions: ContributionDay[];
}

const DARK_COLORS = ["#18181b", "#2c2c31", "#4a4a52", "#8a8a94", "#ff5a2c"];
const LIGHT_COLORS = ["#f0f0f2", "#dcdce0", "#b9b9c2", "#7c7c88", "#e8441a"];

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function formatDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const m = MONTH_NAMES[date.getMonth()];
    return `${m} ${day}`;
  } catch {
    return dateStr;
  }
}

export function ContributionsPanel() {
  const username = site.links.githubUsername;

  // Only render if a real githubUsername is set (not null, not "TODO", not placeholder)
  const isValidUsername =
    Boolean(username) &&
    username !== "TODO" &&
    username !== "PLACEHOLDER_GITHUB_USERNAME" &&
    username !== null &&
    !username.includes("replace-me");

  const [data, setData] = React.useState<ApiResponse | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<boolean>(false);
  const [isDark, setIsDark] = React.useState<boolean>(true);
  const [isReducedMotion, setIsReducedMotion] = React.useState<boolean>(false);
  const [hasAnimated, setHasAnimated] = React.useState<boolean>(false);

  // Tooltip state
  const [hoveredCell, setHoveredCell] = React.useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);

  // Active focused cell for roving tabindex: [col, row]
  const [focusedCell, setFocusedCell] = React.useState<[number, number]>([0, 0]);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Theme check
  React.useEffect(() => {
    if (!isValidUsername) return;
    const checkTheme = () => {
      setIsDark(
        document.documentElement.classList.contains("dark") ||
          !document.documentElement.classList.contains("light")
      );
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(motionQuery.matches);
    const motionListener = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    motionQuery.addEventListener("change", motionListener);

    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", motionListener);
    };
  }, [isValidUsername]);

  // Data fetching with 30-minute sessionStorage cache
  React.useEffect(() => {
    if (!isValidUsername || !username) return;

    const cacheKey = `gh_activity_${username}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const { payload, expiry } = JSON.parse(cached);
        if (Date.now() < expiry && payload) {
          setData(payload);
          setLoading(false);
          return;
        }
      }
    } catch {
      // ignore storage error
    }

    const controller = new AbortController();
    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((json: ApiResponse) => {
        setData(json);
        setLoading(false);
        try {
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({
              payload: json,
              expiry: Date.now() + 30 * 60 * 1000,
            })
          );
        } catch {}
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [username, isValidUsername]);

  // Trigger column entrance animation when container comes in view
  React.useEffect(() => {
    if (!data || hasAnimated || isReducedMotion) return;
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [data, hasAnimated, isReducedMotion]);

  // Scroll to latest week on mount
  React.useEffect(() => {
    if (!loading && data && scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [loading, data]);

  if (!isValidUsername || error) {
    return null;
  }

  const palette = isDark ? DARK_COLORS : LIGHT_COLORS;

  // Build 7-row x ~53-column grid
  const columns: ContributionDay[][] = [];
  if (data && data.contributions) {
    let currentWeek: ContributionDay[] = [];
    data.contributions.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        columns.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) {
      columns.push(currentWeek);
    }
  }

  // Calculate month labels placed at the first column of each month (skipping overlaps)
  const monthLabels: { label: string; colIndex: number }[] = [];
  let lastLabeledCol = -10;
  columns.forEach((col, colIdx) => {
    const firstDay = col[0];
    if (firstDay) {
      const parts = firstDay.date.split("-").map(Number);
      const dayOfMonth = parts[2];
      if (dayOfMonth <= 7 && colIdx - lastLabeledCol >= 4) {
        const m = MONTH_NAMES[parts[1] - 1];
        monthLabels.push({ label: m, colIndex: colIdx });
        lastLabeledCol = colIdx;
      }
    }
  });

  const totalCount = data?.total?.lastYear ?? 0;

  // Roving tabindex key navigation
  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    const [c, r] = focusedCell;
    const maxCols = columns.length;
    let nextC = c;
    let nextR = r;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      nextC = Math.min(maxCols - 1, c + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      nextC = Math.max(0, c - 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      nextR = Math.min(6, r + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      nextR = Math.max(0, r - 1);
    } else {
      return;
    }

    setFocusedCell([nextC, nextR]);
    const targetEl = document.querySelector<HTMLDivElement>(
      `[data-col="${nextC}"][data-row="${nextR}"]`
    );
    targetEl?.focus();
  };

  return (
    <Panel id="activity" noTopLine noBottomLine>
      <div ref={containerRef} className="relative">
        <PanelHeader title="GitHub activity" sheetId="activity" />

        <div className="p-5 sm:p-6 space-y-4 bg-[var(--background)]">
          {/* Scrollable Container with left fade mask on narrow screens */}
          <div className="relative">
            {/* Left fade mask */}
            <div
              className="absolute left-0 top-0 bottom-0 w-8 pointer-events-none z-10 sm:hidden bg-gradient-to-r from-[var(--background)] to-transparent"
              aria-hidden="true"
            />

            <div
              ref={scrollRef}
              className="overflow-x-auto no-scrollbar scroll-smooth pb-2"
              onKeyDown={handleGridKeyDown}
            >
              <div className="inline-block min-w-full">
                {/* Month labels row */}
                <div
                  className="flex text-[11px] font-mono text-muted-foreground mb-1.5 h-4 select-none relative"
                  style={{ width: `${columns.length * 15}px` }}
                >
                  {monthLabels.map((m) => (
                    <span
                      key={`${m.label}-${m.colIndex}`}
                      className="absolute"
                      style={{ left: `${m.colIndex * 15}px` }}
                    >
                      {m.label}
                    </span>
                  ))}
                </div>

                {/* Contribution Cells Grid (7 rows x ~53 columns) */}
                {loading || !data ? (
                  // Static muted skeleton while loading (no shimmer)
                  <div
                    className="grid grid-rows-7 grid-flow-col gap-[3px]"
                    style={{ width: `${53 * 15}px` }}
                  >
                    {Array.from({ length: 53 * 7 }).map((_, i) => (
                      <div
                        key={i}
                        className="size-3 rounded-[3px] bg-[var(--muted)]"
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    role="grid"
                    aria-label="GitHub contribution calendar"
                    className="grid grid-rows-7 grid-flow-col gap-[3px] select-none"
                    style={{ width: `${columns.length * 15}px` }}
                  >
                    {columns.map((col, colIdx) => {
                      const staggerDelay = isReducedMotion
                        ? "0ms"
                        : hasAnimated
                        ? "0ms"
                        : `${colIdx * 6}ms`;

                      return col.map((day, rowIdx) => {
                        const isFocused =
                          focusedCell[0] === colIdx && focusedCell[1] === rowIdx;
                        const color = palette[day.level] || palette[0];
                        const dateFormatted = formatDate(day.date);
                        const label = `${day.count} contribution${
                          day.count === 1 ? "" : "s"
                        } on ${dateFormatted}`;

                        return (
                          <div
                            key={day.date}
                            role="gridcell"
                            tabIndex={isFocused ? 0 : -1}
                            data-col={colIdx}
                            data-row={rowIdx}
                            aria-label={label}
                            style={{
                              backgroundColor: color,
                              animationDelay: staggerDelay,
                            }}
                            className={`size-3 rounded-[3px] cursor-pointer outline-none transition-transform duration-100 hover:scale-125 focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                              hasAnimated || isReducedMotion
                                ? "opacity-100"
                                : "animate-fade-in opacity-0"
                            }`}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredCell({
                                x: rect.left + rect.width / 2,
                                y: rect.top - 8,
                                text: label,
                              });
                            }}
                            onMouseLeave={() => setHoveredCell(null)}
                            onFocus={(e) => {
                              setFocusedCell([colIdx, rowIdx]);
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredCell({
                                x: rect.left + rect.width / 2,
                                y: rect.top - 8,
                                text: label,
                              });
                            }}
                            onBlur={() => setHoveredCell(null)}
                          />
                        );
                      });
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer row (text-sm): Total count on left, legend on right */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-muted-foreground font-mono">
            <span>{totalCount.toLocaleString()} contributions in the last year</span>

            <div className="flex items-center gap-1.5 text-xs select-none">
              <span>Less</span>
              {palette.map((c, i) => (
                <div
                  key={i}
                  className="size-2.5 rounded-[2px]"
                  style={{ backgroundColor: c }}
                  aria-hidden="true"
                />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Solid Popover Tooltip on Cell Hover/Focus */}
        {hoveredCell && (
          <div
            style={{
              position: "fixed",
              left: `${hoveredCell.x}px`,
              top: `${hoveredCell.y}px`,
              transform: "translate(-50%, -100%)",
            }}
            className="z-50 pointer-events-none px-2 py-1 bg-[var(--background)] border border-[var(--line-strong)] rounded text-xs font-mono text-foreground shadow-md whitespace-nowrap"
          >
            {hoveredCell.text}
          </div>
        )}
      </div>
    </Panel>
  );
}
