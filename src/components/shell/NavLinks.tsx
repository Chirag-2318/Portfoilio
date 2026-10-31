"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { site } from "@/content/site";
import { ViewLink } from "@/components/transition/ViewLink";
import { FlipText } from "@/components/motion/FlipText";
import { EASE_IN_OUT_QUART } from "@/components/motion/ease";

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-4 lg:gap-6" aria-label="Primary">
      {site.nav.map((item) => {
        const isActive = pathname === item.href;

        return (
          <ViewLink
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`group relative flex items-center gap-1.5 py-1 text-sm font-medium transition-colors duration-160 select-none ${
              isActive ? "text-ink" : "text-ink-2 hover:text-ink"
            }`}
          >
            <span
              className="hidden lg:inline font-mono text-[11px] leading-none text-ink-2"
              aria-hidden="true"
            >
              {item.index}
            </span>
            {isActive ? (
              <span>{item.label}</span>
            ) : (
              <FlipText trigger="parent">{item.label}</FlipText>
            )}

            {isActive && (
              <motion.div
                layoutId="nav-underline"
                transition={{ duration: 0.26, ease: EASE_IN_OUT_QUART }}
                className="absolute -bottom-1 left-0 right-0 h-[1px] bg-accent"
              />
            )}
          </ViewLink>
        );
      })}
    </nav>
  );
}
