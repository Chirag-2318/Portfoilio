"use client";

import * as React from "react";
import type { ActiveSkeletonBox, InspectorGuide } from "./inspector-types";
import { INSPECTOR_CONFIG } from "./timeline-config";

interface InspectorOverlayProps {
  active: boolean;
  boxes: Map<string, ActiveSkeletonBox>;
  guides: InspectorGuide[];
  showTopRuler?: boolean;
}

export function InspectorOverlay({
  active,
  boxes,
  guides,
  showTopRuler = false,
}: InspectorOverlayProps) {
  if (!active && boxes.size === 0 && guides.length === 0) {
    return null;
  }

  const activeBoxes = Array.from(boxes.values());

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9989] overflow-hidden select-none"
      aria-hidden="true"
    >
      <svg className="w-full h-full absolute inset-0">
        <defs>
          <pattern
            id="ruler-ticks"
            width="10"
            height="16"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0.5" y1="0" x2="0.5" y2="4" stroke="currentColor" strokeWidth="1" />
            <line x1="5.5" y1="0" x2="5.5" y2="2" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>

        {/* 1. Alignment Guides (1px hairline spanning the viewport) */}
        {guides.map((g) => {
          const strokeColor =
            g.color === "red"
              ? INSPECTOR_CONFIG.redGuideColor
              : g.color === "orange"
              ? INSPECTOR_CONFIG.orangeGuideColor
              : INSPECTOR_CONFIG.blueOutlineColor;

          const snapped = Math.round(g.pos) + 0.5;

          return g.axis === "y" ? (
            <line
              key={g.id}
              x1="0"
              y1={snapped}
              x2="100%"
              y2={snapped}
              stroke={strokeColor}
              strokeWidth="1"
              strokeDasharray={g.color === "orange" ? "4 4" : undefined}
              opacity={g.alpha}
              style={{ transition: "opacity 200ms linear" }}
            />
          ) : (
            <line
              key={g.id}
              x1={snapped}
              y1="0"
              x2={snapped}
              y2="100%"
              stroke={strokeColor}
              strokeWidth="1"
              strokeDasharray={g.color === "orange" ? "4 4" : undefined}
              opacity={g.alpha}
              style={{ transition: "opacity 200ms linear" }}
            />
          );
        })}

        {/* 2. Top Ruler Strip (appears during section transitions) */}
        {showTopRuler && (
          <g className="text-muted-foreground/60">
            <rect x="0" y="0" width="100%" height="16" fill="var(--background)" opacity="0.8" />
            <rect x="0" y="0" width="100%" height="16" fill="url(#ruler-ticks)" />
            <line x1="0" y1="16.5" x2="100%" y2="16.5" stroke="var(--line)" strokeWidth="1" />
          </g>
        )}

        {/* 3. Skeleton Blueprint Outlines & Corner Handles */}
        {activeBoxes.map((b) => {
          const rect = b.rect;
          if (!rect || rect.width <= 0 || rect.height <= 0) return null;

          const x = Math.round(rect.left) + 0.5;
          const y = Math.round(rect.top) + 0.5;
          const w = Math.round(b.currentW);
          const h = Math.round(b.currentH);

          const handleSize = INSPECTOR_CONFIG.cornerHandleSizePx;
          const halfH = handleSize / 2;

          return (
            <g
              key={b.targetId}
              opacity={b.alpha}
              style={{ transition: "opacity 200ms ease-out" }}
            >
              {/* Main Box Outline */}
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                fill="none"
                stroke={INSPECTOR_CONFIG.blueOutlineColor}
                strokeWidth="1"
              />

              {/* Multi-line Text Skeletons if text has multiple wrapped lines */}
              {b.type === "text" && b.lineRects && b.lineRects.length > 1 && (
                b.lineRects.map((lr, lIdx) => (
                  <rect
                    key={lIdx}
                    x={Math.round(lr.left) + 0.5}
                    y={Math.round(lr.top) + 0.5}
                    width={Math.round(lr.width * b.progress)}
                    height={Math.round(lr.height)}
                    fill="rgba(37, 99, 235, 0.08)"
                    stroke="rgba(37, 99, 235, 0.4)"
                    strokeWidth="1"
                  />
                ))
              )}

              {/* 4 Corner Handles (5px square, white fill, blue stroke) */}
              {/* Top-Left */}
              <rect
                x={x - halfH}
                y={y - halfH}
                width={handleSize}
                height={handleSize}
                fill="#ffffff"
                stroke={INSPECTOR_CONFIG.blueOutlineColor}
                strokeWidth="1"
              />
              {/* Top-Right */}
              <rect
                x={x + w - halfH}
                y={y - halfH}
                width={handleSize}
                height={handleSize}
                fill="#ffffff"
                stroke={INSPECTOR_CONFIG.blueOutlineColor}
                strokeWidth="1"
              />
              {/* Bottom-Left */}
              <rect
                x={x - halfH}
                y={y + h - halfH}
                width={handleSize}
                height={handleSize}
                fill="#ffffff"
                stroke={INSPECTOR_CONFIG.blueOutlineColor}
                strokeWidth="1"
              />
              {/* Bottom-Right */}
              <rect
                x={x + w - halfH}
                y={y + h - halfH}
                width={handleSize}
                height={handleSize}
                fill="#ffffff"
                stroke={INSPECTOR_CONFIG.blueOutlineColor}
                strokeWidth="1"
              />
            </g>
          );
        })}
      </svg>

      {/* 4. DOM Elements: W x H Dimension Pills & Media Placeholders */}
      {activeBoxes.map((b) => {
        const rect = b.rect;
        if (!rect || rect.width <= 0 || rect.height <= 0) return null;

        const x = Math.round(rect.left);
        const y = Math.round(rect.top);
        const w = Math.round(b.currentW);
        const h = Math.round(b.currentH);

        // Place pill above box if room, else below or inside
        const pillY = y >= 22 ? y - 18 : y + 4;
        const pillX = x + 4;

        return (
          <React.Fragment key={`dom-${b.targetId}`}>
            {/* W x H Dimension Pill (10px mono, white text, blue background, 2px radius) */}
            <div
              className="absolute pointer-events-none select-none font-mono text-[10px] leading-none px-1.5 py-0.5 rounded-[2px] bg-[#2563eb] text-white tracking-wide font-medium shadow-xs"
              style={{
                left: `${pillX}px`,
                top: `${pillY}px`,
                opacity: b.alpha,
                transition: "opacity 200ms ease-out",
              }}
            >
              {Math.round(b.currentW)} × {Math.round(b.currentH)}
            </div>

            {/* Media Placeholder (for type === "media" during skeleton / filling) */}
            {b.type === "media" && b.state !== "done" && (
              <div
                className="absolute pointer-events-none select-none flex flex-col items-center justify-center bg-zinc-800/80 border border-zinc-700/60 text-zinc-400"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${w}px`,
                  height: `${h}px`,
                  opacity: b.alpha,
                  transition: "opacity 300ms ease-out",
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-70 animate-pulse"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
                <span className="font-mono text-[9px] mt-1 opacity-60">media placeholder</span>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
