"use client";

import * as React from "react";
import { site } from "@/content/site";
import { Portrait } from "@/components/home/Portrait";

export function ProfilePane() {
  return (
    <div className="w-full">
      <h2 className="sr-only">Profile</h2>

      {/* ===================== DESKTOP (>= 1024px) ===================== */}
      <div className="hidden lg:grid grid-cols-12 gap-8 items-start">
        {/* Left Column (Col 1-7, span 7): Profile paragraph + Facts list */}
        <div className="col-span-7 flex flex-col gap-8">
          <p className="font-serif font-normal text-xl xl:text-2xl text-ink leading-[1.42] max-w-[36ch]">
            {site.about.profile}
          </p>

          <dl className="w-full flex flex-col border-b border-line">
            {site.about.facts.map((fact) => (
              <div
                key={fact.label}
                className="grid grid-cols-[120px_1fr] items-center min-h-[44px] py-2 border-t border-line"
              >
                <dt className="label text-ink-3">{fact.label}</dt>
                <dd className="text-sm font-medium text-ink m-0">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right Column (Col 9-12, span 4): Portrait with caption */}
        <div className="col-start-9 col-span-4 flex flex-col items-start pt-1">
          <div className="w-full max-w-[300px] h-[clamp(220px,36svh,380px)] aspect-[4/5]">
            <Portrait variant="final" className="w-full h-full" />
          </div>
          <span className="font-mono text-xs text-ink-2 mt-2 select-none">
            {site.name.full}
          </span>
        </div>
      </div>

      {/* ===================== TABLET & MOBILE (< 1024px) ===================== */}
      <div className="flex flex-col gap-6 lg:hidden">
        <p className="font-serif font-normal text-lg sm:text-xl text-ink leading-[1.4] max-w-[48ch]">
          {site.about.profile}
        </p>

        <dl className="w-full flex flex-col border-b border-line">
          {site.about.facts.map((fact) => (
            <div
              key={fact.label}
              className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] items-center min-h-[44px] py-2 border-t border-line"
            >
              <dt className="label text-ink-3">{fact.label}</dt>
              <dd className="text-sm font-medium text-ink m-0">{fact.value}</dd>
            </div>
          ))}
        </dl>

        {/* Portrait last at 160x200px left-aligned */}
        <div className="pt-2">
          <div className="w-[160px] h-[200px] aspect-[4/5]">
            <Portrait variant="final" className="w-full h-full" />
          </div>
          <span className="font-mono text-xs text-ink-2 mt-2 block select-none">
            {site.name.full}
          </span>
        </div>
      </div>
    </div>
  );
}

