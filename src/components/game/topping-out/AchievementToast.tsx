"use client";

import React, { useEffect, useState } from "react";
import type { Achievement } from "./achievements";
import { getAchievementGlyph, TierPips } from "./glyphs";

interface ToastProps {
  achievement: Achievement;
  onDismiss: () => void;
  durationMs?: number;
}

export function AchievementToastItem({
  achievement,
  onDismiss,
  durationMs = 3400,
}: ToastProps) {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);
  const Glyph = getAchievementGlyph(achievement.id);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / durationMs) * 100);
      setProgress(remaining);
      if (elapsed >= durationMs) {
        clearInterval(interval);
        setIsExiting(true);
        setTimeout(onDismiss, 200);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [durationMs, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative w-full max-w-[340px] pointer-events-auto overflow-hidden rounded-lg border border-[var(--line-strong)] bg-[var(--background)] p-3 shadow-xl transition-all duration-300 ease-out select-none ${
        isExiting
          ? "opacity-0 scale-95 translate-y-[-8px]"
          : "opacity-100 scale-100 translate-y-0 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-3"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Glyph container */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--line)] bg-[var(--muted)]/50 text-[var(--accent)]">
          <Glyph className="h-6 w-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
              Unlocked
            </span>
            <TierPips tier={achievement.tier} />
          </div>
          <h4 className="truncate text-xs font-semibold text-[var(--foreground)]">
            {achievement.name}
          </h4>
          <p className="truncate text-[11px] text-[var(--muted-foreground)]">
            {achievement.flavour || achievement.how}
          </p>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={() => {
            setIsExiting(true);
            setTimeout(onDismiss, 200);
          }}
          className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-xs"
          aria-label="Dismiss achievement notification"
        >
          ×
        </button>
      </div>

      {/* Progress timer bar (hidden under prefers-reduced-motion) */}
      <div className="absolute bottom-0 left-0 h-[2px] w-full bg-[var(--line)]">
        <div
          className="h-full bg-[var(--accent)] transition-none motion-reduce:hidden"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function AchievementToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Achievement[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none px-4 w-full max-w-sm">
      {toasts.map((ach) => (
        <AchievementToastItem
          key={ach.id}
          achievement={ach}
          onDismiss={() => onDismiss(ach.id)}
        />
      ))}
    </div>
  );
}

