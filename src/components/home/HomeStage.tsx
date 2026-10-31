"use client";

import * as React from "react";
import "./home.css";
import { DraftProvider } from "@/components/home/DraftContext";
import { HeroContent } from "@/components/home/HeroContent";
import { LoupeRing } from "@/components/home/LoupeRing";
import { useLens } from "@/components/home/useLens";

export function HomeStage() {
  return (
    <DraftProvider>
      <StageInner />
    </DraftProvider>
  );
}

function StageInner() {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const draftRef = React.useRef<HTMLDivElement>(null);
  const ringRef = React.useRef<SVGSVGElement>(null);

  const { onPointerMove, onPointerDown, onPointerUp, onPointerLeave } = useLens({
    stageRef,
    draftRef,
    ringRef,
  });

  return (
    <div
      ref={stageRef}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      onPointerCancel={onPointerLeave}
      className="home-stage relative w-full h-full select-none"
      style={{ touchAction: "none" }}
    >
      {/* 1. FINAL LAYER (Interactive, Base) */}
      <HeroContent variant="final" />

      {/* 2. DRAFT LAYER (Overlay, Clipped by signature lens circle) */}
      <div
        ref={draftRef}
        aria-hidden="true"
        inert={true}
        className="absolute inset-0 pointer-events-none z-10 bg-paper overflow-hidden"
        style={{
          clipPath: "circle(0px at 0px 0px)",
        }}
      >
        <HeroContent variant="draft" />
      </div>

      {/* 3. LOUPE RING (Follows cursor with spring physics, 1px accent outline & ticks) */}
      <LoupeRing ref={ringRef} />
    </div>
  );
}
