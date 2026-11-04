"use client";

import * as React from "react";
import { debugStore, type DebugConfig } from "./motion-tokens";
import { introController } from "@/components/intro/intro-controller";
import { targetRegistry } from "./target-registry";

export function DebugTuningPanel() {
  const [config, setConfig] = React.useState<DebugConfig>(() => debugStore.get());
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  React.useEffect(() => {
    return debugStore.subscribe((newConfig) => {
      setConfig(newConfig);
    });
  }, []);

  if (!config.active) return null;

  const handleSpeedChange = (multiplier: number) => {
    debugStore.set({ speedMultiplier: multiplier });
  };

  const handleCursorCountChange = (count: number) => {
    debugStore.set({ cursorCount: count });
  };

  const handleRestart = () => {
    targetRegistry.init();
    introController.emitEntering(window.innerWidth / 2, window.innerHeight / 2);
  };

  const handleSkip = () => {
    targetRegistry.setAllDone();
    introController.emitEntered();
  };

  return (
    <div className="fixed top-16 right-4 z-[9999] w-72 rounded-lg border border-[var(--line-strong)] bg-[var(--background)]/95 backdrop-blur-md p-3 text-xs font-mono shadow-2xl text-foreground select-none">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
        <span className="font-semibold text-[var(--accent)] flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[var(--accent)] animate-ping" />
          TUNING PANEL (?debug)
        </span>
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-muted-foreground hover:text-foreground text-[10px] px-1.5 py-0.5 rounded border border-[var(--border)]"
        >
          {isCollapsed ? "Expand" : "Collapse"}
        </button>
      </div>

      {!isCollapsed && (
        <div className="space-y-3 pt-2.5">
          {/* Speed Multiplier */}
          <div>
            <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
              <span>Speed Multiplier</span>
              <span className="text-foreground">{config.speedMultiplier.toFixed(2)}x</span>
            </div>
            <div className="flex gap-1">
              {[0.25, 0.5, 1.0, 2.0, 4.0].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSpeedChange(s)}
                  className={`flex-1 py-1 rounded text-[10px] border transition-colors ${
                    config.speedMultiplier === s
                      ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]"
                      : "border-[var(--line)] hover:border-foreground/40 text-muted-foreground"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Cursor Count */}
          <div>
            <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
              <span>Cursor Count</span>
              <span className="text-foreground">{config.cursorCount}</span>
            </div>
            <input
              type="range"
              min="4"
              max="24"
              step="2"
              value={config.cursorCount}
              onChange={(e) => handleCursorCountChange(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </div>

          {/* Trail Lifetime */}
          <div>
            <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
              <span>Trail Lifetime</span>
              <span className="text-foreground">{config.trailLifetimeMs}ms</span>
            </div>
            <input
              type="range"
              min="100"
              max="600"
              step="50"
              value={config.trailLifetimeMs}
              onChange={(e) => debugStore.set({ trailLifetimeMs: Number(e.target.value) })}
              className="w-full accent-[var(--accent)]"
            />
          </div>

          {/* Toggle Inspector Lines */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-muted-foreground">Show Blueprint Outlines</span>
            <input
              type="checkbox"
              checked={config.showInspectorLines}
              onChange={(e) => debugStore.set({ showInspectorLines: e.target.checked })}
              className="accent-[var(--accent)]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={handleRestart}
              className="flex-1 py-1.5 rounded bg-[var(--accent)] text-white text-[11px] font-medium hover:opacity-90 active:scale-95 transition-all"
            >
              Restart
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 py-1.5 rounded border border-[var(--line)] text-muted-foreground hover:text-foreground text-[11px] hover:bg-[var(--muted)] active:scale-95 transition-all"
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
