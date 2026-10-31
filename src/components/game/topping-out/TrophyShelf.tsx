"use client";

import React, { useEffect, useRef } from "react";
import {
  type Achievement,
  type AchievementCategory,
  type AchievementState,
  ACHIEVEMENTS,
  progressFor,
} from "./achievements";
import { getAchievementGlyph, LockGlyph, TierPips } from "./glyphs";
import { playSound } from "@/components/sound/sound-effects";

interface TrophyShelfProps {
  isOpen: boolean;
  onClose: () => void;
  state: AchievementState;
}

const CATEGORY_NAMES: Record<AchievementCategory, string> = {
  craft: "Craft & Precision",
  height: "Height Milestones",
  landmark: "Landmark Surveys",
  secret: "Field Curiosities",
  meta: "Chartered Ranks",
};

export function TrophyShelf({ isOpen, onClose, state }: TrophyShelfProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Play sound on open / close
  useEffect(() => {
    if (isOpen) {
      playSound("open");
      closeBtnRef.current?.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        playSound("close");
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unlockedCount = Object.keys(state.unlocked).length;
  const totalCount = ACHIEVEMENTS.length;

  const categories: AchievementCategory[] = ["craft", "height", "landmark", "secret", "meta"];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="trophy-shelf-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playSound("close");
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="relative flex flex-col w-full max-w-[560px] max-h-[82vh] rounded-lg border border-[var(--line-strong)] bg-[var(--background)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4 bg-[var(--muted)]/20">
          <div>
            <div className="flex items-center gap-2.5">
              <h2
                id="trophy-shelf-title"
                className="text-base font-semibold tracking-tight text-[var(--foreground)]"
              >
                Trophy Shelf
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono border border-[var(--line)] bg-[var(--background)] text-[var(--muted-foreground)]">
                {unlockedCount} / {totalCount}
              </span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Field credentials, precision marks, and structural milestones.
            </p>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={() => {
              playSound("close");
              onClose();
            }}
            className="flex size-7 items-center justify-center rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-base"
            aria-label="Close Trophy Shelf"
          >
            ×
          </button>
        </div>

        {/* Scrollable list grouped by category */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {categories.map((cat) => {
            const items = ACHIEVEMENTS.filter((a) => a.category === cat);
            if (items.length === 0) return null;

            return (
              <section key={cat} aria-label={CATEGORY_NAMES[cat]}>
                <div className="flex items-center gap-2 mb-3 pb-1 border-b border-[var(--line)]/60">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--muted-foreground)]">
                    {CATEGORY_NAMES[cat]}
                  </span>
                  <div className="flex-1 h-[1px] bg-[var(--line)]/40" />
                </div>

                <div className="grid gap-2.5">
                  {items.map((ach) => {
                    const isUnlocked = Boolean(state.unlocked[ach.id]);
                    const Glyph = getAchievementGlyph(ach.id);
                    const progress = !isUnlocked ? progressFor(ach, state) : null;

                    return (
                      <div
                        key={ach.id}
                        className={`group relative flex items-start gap-3.5 p-3 rounded-md border transition-all ${
                          isUnlocked
                            ? "border-[var(--line)] bg-[var(--muted)]/10 hover:border-[var(--line-strong)]"
                            : "border-[var(--line)]/40 bg-[var(--background)] opacity-60"
                        }`}
                      >
                        {/* Icon */}
                        <div
                          className={`flex size-10 shrink-0 items-center justify-center rounded border transition-colors ${
                            isUnlocked
                              ? "border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]"
                              : "border-[var(--line)] bg-[var(--muted)]/30 text-[var(--muted-foreground)]"
                          }`}
                        >
                          {ach.secret && !isUnlocked ? (
                            <LockGlyph className="size-5 opacity-70" />
                          ) : (
                            <Glyph className="size-5" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3
                              className={`text-xs font-semibold truncate ${
                                isUnlocked
                                  ? "text-[var(--foreground)]"
                                  : "text-[var(--muted-foreground)]"
                              }`}
                            >
                              {ach.secret && !isUnlocked ? "Secret Milestone" : ach.name}
                            </h3>
                            <TierPips tier={ach.tier} />
                          </div>

                          <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5 leading-snug">
                            {ach.secret && !isUnlocked
                              ? ach.hint || "Keep building to discover."
                              : isUnlocked
                              ? ach.flavour
                              : ach.how}
                          </p>

                          {/* Progress bar if available */}
                          {progress && progress.target > 1 && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex-1 h-1 bg-[var(--muted)] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[var(--accent)] rounded-full"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      (progress.current / progress.target) * 100
                                    )}%`,
                                  }}
                                />
                              </div>
                              <span className="font-mono text-[10px] text-[var(--muted-foreground)] shrink-0">
                                {progress.current} / {progress.target}
                              </span>
                            </div>
                          )}

                          {/* Reward pill */}
                          {ach.reward && (
                            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono border border-[var(--accent)]/20 bg-[var(--accent)]/5 text-[var(--accent)]">
                              <span>★</span>
                              <span>{ach.reward}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--line)] px-5 py-3 bg-[var(--muted)]/20 text-[11px] font-mono text-[var(--muted-foreground)]">
          <span>Press [Esc] or [T] to close</span>
          <span>{totalCount - unlockedCount} remaining</span>
        </div>
      </div>
    </div>
  );
}

