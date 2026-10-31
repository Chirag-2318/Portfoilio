"use client";

import * as React from "react";
import { site } from "@/content/site";

export function SkillsPane() {
  return (
    <div className="w-full">
      <h2 className="sr-only">Skills</h2>

      {/* 2x2 Grid at >= 768px, single column on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-7 lg:gap-x-16 lg:gap-y-8">
        {site.skills.map((group) => (
          <div key={group.group} className="flex flex-col">
            <h3 className="label text-ink-2 pb-2 mb-2.5 border-b border-line">
              {group.group}
            </h3>

            <ul className="flex flex-wrap items-baseline m-0 p-0 list-none text-base leading-[1.85] text-ink">
              {group.items.map((skill) => (
                <li
                  key={skill}
                  className="inline-flex items-center [&:not(:last-child)]:after:content-['·'] [&:not(:last-child)]:after:mx-2.5 [&:not(:last-child)]:after:text-ink-2"
                >
                  <span className="cursor-default hover:underline hover:decoration-accent hover:underline-offset-4 transition-all duration-160">
                    {skill}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="font-mono text-xs text-ink-2 pt-6 sm:pt-8 select-none">
        Most of my work is Java/Spring Boot, Python/FastAPI and Kotlin/Jetpack Compose.
      </p>
    </div>
  );
}

