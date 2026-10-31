"use client";

import * as React from "react";
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

const DARK_COLORS = ["#18181b", "#3f3f46", "#71717a", "#a1a1aa", "#e4e4e7"];
const LIGHT_COLORS = ["#ececef", "#c8c8ce", "#9a9aa3", "#5c5c66", "#18181b"];

export function ContributionsPanel() {
  const username: string = site.home.githubUsername;

  // Only render if a real githubUsername is set
  const isValidUsername =
    Boolean(username) &&
    username !== "PLACEHOLDER_GITHUB_USERNAME" &&
    !username.includes("replace-me");

  const [data, setData] = React.useState<ApiResponse | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<boolean>(false);
  const [isDark, setIsDark] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (!isValidUsername) return;

    // Check theme
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark") || !document.documentElement.classList.contains("light"));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // Try cache
    const cacheKey = `gh_contrib_${username}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setData(JSON.parse(cached));
        setLoading(false);
        return () => observer.disconnect();
      }
    } catch {
      // ignore
    }

    // Fetch API
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
          sessionStorage.setItem(cacheKey, JSON.stringify(json));
        } catch {
          // ignore
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
      observer.disconnect();
    };
  }, [username, isValidUsername]);

  if (!isValidUsername || error) {
    return null;
  }

  const palette = isDark ? DARK_COLORS : LIGHT_COLORS;

  // Group contributions into 7 rows (Sunday to Saturday)
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

  const total = data?.total?.lastYear ?? 0;

  return (
    <div id="contributions" className="mx-auto max-w-3xl border-x border-[var(--line)] bg-[var(--background)] relative">
      <h2 className="sr-only">GitHub contributions</h2>

      <div className="p-4 overflow-hidden">
        {loading ? (
          /* Skeleton */
          <div className="h-32 flex items-center justify-center">
            <span className="font-mono text-xs text-muted-foreground animate-pulse">
              Loading contribution grid…
            </span>
          </div>
        ) : (
          <div className="relative">
            {/* Horizontally scrollable on mobile with fade mask */}
            <div
              className="overflow-x-auto pb-2 scrollbar-none"
              style={{
                maskImage: "linear-gradient(to right, black 85%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to right, black 85%, transparent 100%)",
              }}
            >
              <div className="flex gap-[3px] min-w-max p-1">
                {columns.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-[3px]">
                    {week.map((day) => {
                      const color = palette[Math.min(day.level, 4)] || palette[0];
                      const dateObj = new Date(day.date);
                      const dateLabel = dateObj.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                      const tooltip = `${day.count} contribution${day.count === 1 ? "" : "s"} on ${dateLabel}`;

                      return (
                        <div
                          key={day.date}
                          title={tooltip}
                          className="size-[11px] rounded-[2px] transition-transform hover:scale-125 cursor-pointer"
                          style={{ backgroundColor: color }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Row */}
      {!loading && (
        <div className="px-4 py-2 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>
            {total} contributions in the last year. Source:{" "}
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link font-medium text-foreground"
            >
              GitHub
            </a>
            .
          </span>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span>Less</span>
            <div className="flex gap-1 items-center">
              {palette.map((c, i) => (
                <span
                  key={i}
                  className="size-[10px] rounded-[2px]"
                  style={{ backgroundColor: c }}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      )}
    </div>
  );
}
