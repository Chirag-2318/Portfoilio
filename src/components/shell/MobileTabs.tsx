"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { site } from "@/content/site";
import { ViewLink } from "@/components/transition/ViewLink";
import { EASE_IN_OUT_QUART } from "@/components/motion/ease";

export function MobileTabs() {
  const pathname = usePathname();

  return (
    <nav
      data-print="hide"
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-paper border-t border-line pb-[env(safe-area-inset-bottom,0px)] select-none"
    >
      <div className="h-14 grid grid-cols-5 items-stretch">
        {site.nav.map((item) => {
          const isActive = pathname === item.href;

          return (
            <ViewLink
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex flex-col items-center justify-center min-h-[44px] transition-colors duration-160 ${
                isActive ? "text-ink" : "text-ink-2 hover:text-ink"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="tab-bar"
                  transition={{ duration: 0.26, ease: EASE_IN_OUT_QUART }}
                  className="absolute top-0 left-0 right-0 h-[2px] bg-accent"
                />
              )}
              <span className="font-mono text-[10px] leading-none text-ink-3 mb-0.5">
                {item.index}
              </span>
              <span className="text-xs font-medium leading-none">
                {item.label}
              </span>
            </ViewLink>
          );
        })}
      </div>
    </nav>
  );
}

