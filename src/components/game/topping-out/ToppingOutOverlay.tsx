"use client";

import * as React from "react";
import { ToppingOut } from "./ToppingOut";

export interface ToppingOutOverlayProps {
  open: boolean;
  onClose: () => void;
  onExited?: () => void;
}

export default function ToppingOutOverlay({
  open,
  onClose,
  onExited,
}: ToppingOutOverlayProps) {
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = React.useRef<HTMLElement | null>(null);

  // Lock body scroll with scrollbar compensation, preserve scroll position, set inert on main content
  React.useEffect(() => {
    if (!open) {
      onExited?.();
      return;
    }

    if (typeof document === "undefined") return;

    previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;

    // Save scroll position
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    const originalOverflow = document.documentElement.style.overflow;
    const originalPaddingRight = document.documentElement.style.paddingRight;

    document.documentElement.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Set inert on main content so Tab cannot escape the overlay
    const mainEl = document.querySelector("main") || document.getElementById("app-shell");
    if (mainEl) {
      mainEl.setAttribute("inert", "");
    }

    // Move focus to overlay
    requestAnimationFrame(() => {
      overlayRef.current?.focus();
    });

    return () => {
      document.documentElement.style.overflow = originalOverflow;
      document.documentElement.style.paddingRight = originalPaddingRight;
      window.scrollTo(0, scrollY);

      if (mainEl) {
        mainEl.removeAttribute("inert");
      }

      if (previouslyFocusedElementRef.current?.focus) {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, [open, onExited]);

  // Handle Escape key
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Topping Out game"
      tabIndex={-1}
      className="fixed inset-0 z-[90] overflow-hidden select-none outline-none"
    >
      {/* Dim layer behind canvas: 30% background mix, no blur, fades in over 200ms */}
      <div
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--background)_30%,transparent)] transition-opacity duration-200 pointer-events-none"
        aria-hidden="true"
      />

      {/* Transparent full-viewport game layer */}
      <ToppingOut mode="overlay" onClose={onClose} autoFocus />
    </div>
  );
}
