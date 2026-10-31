"use client";

import * as React from "react";
import { RegistrationEngine, type GameState } from "./engine";

export interface RegistrationCanvasHandle {
  start: () => void;
  restart: () => void;
  pause: () => void;
  resume: () => void;
  getEngine: () => RegistrationEngine | null;
}

export interface RegistrationCanvasProps {
  timerLineRef: React.RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  onSheetsChange: (sheets: number) => void;
  onPrintsChange: (prints: number) => void;
  onBestChange: (best: number) => void;
  onStatus: (text: string, durationMs: number) => void;
  onGameOver: (prints: number, best: number, isNewBest: boolean) => void;
  onStateChange: (state: GameState) => void;
}

export const RegistrationCanvas = React.forwardRef<
  RegistrationCanvasHandle,
  RegistrationCanvasProps
>(function RegistrationCanvas(props, ref) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const engineRef = React.useRef<RegistrationEngine | null>(null);

  // Keep latest callbacks in ref to avoid engine re-creation
  const propsRef = React.useRef(props);
  propsRef.current = props;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new RegistrationEngine(
      canvas,
      propsRef.current.timerLineRef.current,
      {
        onSheetsChange: (s) => propsRef.current.onSheetsChange(s),
        onPrintsChange: (p) => propsRef.current.onPrintsChange(p),
        onBestChange: (b) => propsRef.current.onBestChange(b),
        onStatus: (txt, dur) => propsRef.current.onStatus(txt, dur),
        onGameOver: (p, b, nb) => propsRef.current.onGameOver(p, b, nb),
        onStateChange: (st) => propsRef.current.onStateChange(st),
      },
      () => propsRef.current.reducedMotion
    );

    engineRef.current = engine;
    if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
      (window as unknown as { __gameEngine?: RegistrationEngine }).__gameEngine = engine;
    }

    return () => {
      if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
        delete (window as unknown as { __gameEngine?: RegistrationEngine }).__gameEngine;
      }
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Update timer line reference when changed
  React.useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setTimerLine(props.timerLineRef.current);
    }
  }, [props.timerLineRef]);

  React.useImperativeHandle(
    ref,
    () => ({
      start: () => engineRef.current?.start(),
      restart: () => engineRef.current?.restart(),
      pause: () => engineRef.current?.pause(),
      resume: () => engineRef.current?.resume(),
      getEngine: () => engineRef.current,
    }),
    []
  );

  return (
    <div className="relative w-full h-full flex-1 min-h-0 select-none overflow-hidden touch-none">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Game area. Align the red plate with the outlined shape."
        className="block w-full h-full touch-none select-none cursor-grab active:cursor-grabbing"
      />
    </div>
  );
});
