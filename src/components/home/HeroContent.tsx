"use client";

import * as React from "react";
import { motion } from "motion/react";
import { site } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Portrait } from "@/components/home/Portrait";
import { IndexList } from "@/components/home/IndexList";
import { DraftToggle } from "@/components/home/DraftToggle";
import { useViewTransition } from "@/components/transition/ViewTransitionProvider";
import { EASE_OUT_EXPO, useMotionOK } from "@/components/motion/ease";

export interface HeroContentProps {
  variant: "final" | "draft";
  className?: string;
}

let homeIntroPlayed = false;

export function HeroContent({ variant, className = "" }: HeroContentProps) {
  const isDraft = variant === "draft";
  const { ready } = useViewTransition();
  const motionOK = useMotionOK();

  const isFirstIntro = !isDraft && !homeIntroPlayed && motionOK;

  React.useEffect(() => {
    if (ready && isFirstIntro && !isDraft) {
      homeIntroPlayed = true;
    }
  }, [ready, isFirstIntro, isDraft]);

  // If draft, no animation.
  // If final: animate once with full stagger, or simple fade on repeat.
  const animateIntro = !isDraft && ready && motionOK;

  return (
    <div
      className={`hero hero-container ${className}`}
      data-variant={variant}
      aria-hidden={isDraft ? "true" : undefined}
      inert={isDraft ? true : undefined}
    >
      {/* ===================== LEFT COLUMN ===================== */}
      <div className="flex flex-col justify-between h-full md:col-span-7 lg:col-span-8 z-10">
        {/* Top: Mobile header row (Kicker + Portrait on < 768px) / Desktop Kicker */}
        <div className="flex items-start justify-between gap-4">
          <motion.div
            initial={isFirstIntro ? { opacity: 0, y: 8 } : false}
            animate={animateIntro ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.45, delay: isFirstIntro ? 0.15 : 0 }}
            className="flex items-center gap-3 pt-1"
          >
            <span className="hidden sm:inline-block w-6 h-[1px] bg-ink-3" aria-hidden="true" />
            <span className="label text-ink-2 leading-relaxed max-w-[280px] sm:max-w-none">
              {site.home.kicker}
            </span>
          </motion.div>

          {/* Mobile-only portrait at top right (< 768px) */}
          <div className="md:hidden shrink-0">
            <Portrait
              variant={variant}
              className="w-[60px] h-[75px]"
            />
          </div>
        </div>

        {/* Middle: Display Name */}
        <div data-name className="my-auto py-1 sm:py-4">
          {isDraft ? (
            <div className="display-name text-ink select-none relative" aria-hidden="true">
              {/* Line 1: Chirag */}
              <div className="display-line">
                <span className="relative z-10">{site.name.first}</span>
                {/* Construction guides for line 1 */}
                <div className="construction-guides" aria-hidden="true">
                  {/* Cap Height line */}
                  <div className="guide-line" style={{ top: "var(--g-cap)" }}>
                    <span className="guide-label">cap height</span>
                    <span className="guide-tick guide-tick-left">+</span>
                    <span className="guide-tick guide-tick-right">+</span>
                  </div>
                  {/* X-Height line */}
                  <div className="guide-line" style={{ top: "var(--g-xheight)" }}>
                    <span className="guide-label">x-height</span>
                  </div>
                  {/* Baseline line */}
                  <div className="guide-line" style={{ top: "var(--g-baseline)" }}>
                    <span className="guide-label">baseline</span>
                  </div>
                </div>
              </div>

              {/* Line 2: Patil. */}
              <div className="display-line">
                <span className="relative z-10">
                  {site.name.last}
                  <span className="dot">.</span>
                </span>
                {/* Construction guides for line 2 */}
                <div className="construction-guides" aria-hidden="true">
                  {/* Cap Height line */}
                  <div className="guide-line" style={{ top: "var(--g-cap)" }}>
                    <span className="guide-label">cap height</span>
                    <span className="guide-tick guide-tick-left">+</span>
                    <span className="guide-tick guide-tick-right">+</span>
                  </div>
                  {/* X-Height line */}
                  <div className="guide-line" style={{ top: "var(--g-xheight)" }}>
                    <span className="guide-label">x-height</span>
                  </div>
                  {/* Baseline line */}
                  <div className="guide-line" style={{ top: "var(--g-baseline)" }}>
                    <span className="guide-label">baseline</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <h1 className="display-name text-ink select-none" aria-label={site.name.full}>
              <div className="display-line overflow-hidden">
                <motion.span
                  className="block"
                  initial={isFirstIntro ? { y: "105%" } : false}
                  animate={animateIntro ? { y: "0%" } : undefined}
                  transition={{ duration: 0.7, delay: isFirstIntro ? 0.15 : 0, ease: EASE_OUT_EXPO }}
                >
                  {site.name.first}
                </motion.span>
              </div>
              <div className="display-line overflow-hidden">
                <motion.span
                  className="block"
                  initial={isFirstIntro ? { y: "105%" } : false}
                  animate={animateIntro ? { y: "0%" } : undefined}
                  transition={{ duration: 0.7, delay: isFirstIntro ? 0.24 : 0.05, ease: EASE_OUT_EXPO }}
                >
                  {site.name.last}
                  <span className="dot text-accent">.</span>
                </motion.span>
              </div>
            </h1>
          )}
        </div>

        {/* Lower Left: Tagline, Intro paragraph, and Actions */}
        <div className="space-y-3 sm:space-y-6">
          {/* Tagline */}
          <motion.div
            initial={isFirstIntro ? { opacity: 0, y: 12 } : false}
            animate={animateIntro ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.45, delay: isFirstIntro ? 0.45 : 0.1, ease: EASE_OUT_EXPO }}
            className="font-serif text-lg sm:text-2xl lg:text-[28px] text-ink leading-snug"
          >
            <span>{site.home.taglineA} </span>
            <span data-b>{site.home.taglineB}</span>
          </motion.div>

          {/* Intro paragraph */}
          <motion.p
            initial={isFirstIntro ? { opacity: 0, y: 12 } : false}
            animate={animateIntro ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.45, delay: isFirstIntro ? 0.52 : 0.15, ease: EASE_OUT_EXPO }}
            className="intro-text text-[13px] sm:text-base text-ink-2 max-w-[46ch] leading-relaxed"
          >
            {site.home.intro}
          </motion.p>

          {/* Desktop/Tablet Actions row */}
          <motion.div
            initial={isFirstIntro ? { opacity: 0, y: 12 } : false}
            animate={animateIntro ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.45, delay: isFirstIntro ? 0.59 : 0.2, ease: EASE_OUT_EXPO }}
            className="hidden sm:flex items-center gap-3 pt-2"
          >
            <Button
              href={site.home.ctaPrimary.href}
              variant="primary"
              className={isDraft ? "btn-primary" : ""}
              data-lens-shrink
            >
              <span>{site.home.ctaPrimary.label}</span>
              <Icon name="arrow-right" size={15} className="transition-transform group-hover:translate-x-[3px]" />
            </Button>

            <Button
              href={site.home.ctaSecondary.href}
              variant="outline"
              className={isDraft ? "btn-outline" : ""}
              data-lens-shrink
            >
              {site.home.ctaSecondary.label}
            </Button>

            <div className="ml-auto">
              <DraftToggle />
            </div>
          </motion.div>

          {/* Mobile Actions (< 640px) */}
          <div className="sm:hidden space-y-3 pt-1">
            <div className="flex gap-2.5">
              <Button
                href={site.home.ctaPrimary.href}
                variant="primary"
                className={`flex-1 h-11 text-xs ${isDraft ? "btn-primary" : ""}`}
                data-lens-shrink
              >
                <span>{site.home.ctaPrimary.label}</span>
                <Icon name="arrow-right" size={13} />
              </Button>
              <Button
                href={site.home.ctaSecondary.href}
                variant="outline"
                className={`flex-1 h-11 text-xs ${isDraft ? "btn-outline" : ""}`}
                data-lens-shrink
              >
                {site.home.ctaSecondary.label}
              </Button>
            </div>
            <div className="flex justify-center pt-1">
              <DraftToggle />
            </div>
          </div>
        </div>
      </div>

      {/* ===================== RIGHT COLUMN ===================== */}
      <div className="flex flex-col justify-end gap-6 md:col-span-5 lg:col-span-4 z-10 pt-4 md:pt-0">
        {/* Desktop & Tablet Portrait (≥ 768px) */}
        <motion.div
          data-portrait
          initial={isFirstIntro ? { opacity: 0, clipPath: "inset(100% 0 0 0)" } : false}
          animate={animateIntro ? { opacity: 1, clipPath: "inset(0% 0 0 0)" } : undefined}
          transition={{ duration: 0.6, delay: isFirstIntro ? 0.3 : 0.1, ease: EASE_OUT_EXPO }}
          className="hidden md:block self-start w-auto h-[clamp(110px,22svh,250px)] aspect-[4/5]"
        >
          <Portrait variant={variant} className="w-full h-full" />
        </motion.div>

        {/* Index list */}
        <motion.div
          initial={isFirstIntro ? { opacity: 0, y: 8 } : false}
          animate={animateIntro ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.45, delay: isFirstIntro ? 0.5 : 0.15, ease: EASE_OUT_EXPO }}
          className="w-full"
        >
          <IndexList variant={variant} />
        </motion.div>
      </div>
    </div>
  );
}
