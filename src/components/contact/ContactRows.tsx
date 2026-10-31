"use client";

import * as React from "react";
import { site } from "@/content/site";
import { getSocials } from "@/lib/socials";
import { usePuneTime } from "@/lib/usePuneTime";
import { Icon } from "@/components/ui/Icon";

export function ContactRows() {
  const puneTime = usePuneTime();
  const socials = React.useMemo(() => getSocials().filter((s) => s.visible), []);

  return (
    <dl className="w-full border-b border-line hairline">
      {/* 1. PHONE */}
      <div className="group grid grid-cols-[88px_1fr_auto] items-center min-h-[52px] border-t border-line hairline py-2.5 px-1">
        <dt className="label text-ink-2">Phone</dt>
        <dd className="text-sm font-medium text-ink">
          <a
            href={site.phone.href}
            className="inline-flex items-center gap-1.5 hover:text-ink transition-colors duration-160 group-hover:underline group-hover:decoration-accent group-hover:decoration-1 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded-sm"
          >
            <span>{site.phone.display}</span>
          </a>
        </dd>
        <dd className="shrink-0 flex items-center justify-end pl-2">
          <a
            href={site.phone.href}
            aria-label={`Call ${site.phone.display}`}
            className="text-ink-2 group-hover:text-ink transition-colors duration-160"
          >
            <Icon
              name="arrow-up-right"
              size={15}
              className="opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-160 ease-out-expo"
            />
          </a>
        </dd>
      </div>

      {/* 2. BASED */}
      <div className="grid grid-cols-[88px_1fr_auto] items-center min-h-[52px] border-t border-line hairline py-2.5 px-1">
        <dt className="label text-ink-2">Based</dt>
        <dd className="text-sm text-ink-2 font-normal col-span-2">
          Pune, Maharashtra, India
        </dd>
      </div>

      {/* 3. PUNE TIME */}
      <div className="grid grid-cols-[88px_1fr_auto] items-center min-h-[52px] border-t border-line hairline py-2.5 px-1">
        <dt className="label text-ink-2">Pune time</dt>
        <dd className="font-mono text-sm tabular text-ink-2 col-span-2">
          <span className="w-14 inline-block">{puneTime ?? "--:--"}</span>
          <span className="text-ink-2 ml-1">IST</span>
        </dd>
      </div>

      {/* 4. SOCIALS */}
      {socials.map((s) => (
        <div
          key={s.key}
          className="group grid grid-cols-[88px_1fr_auto] items-center min-h-[52px] border-t border-line hairline py-2.5 px-1"
        >
          <dt className="label text-ink-2">{s.label}</dt>
          <dd className="text-sm text-ink">
            {s.placeholder ? (
              <span className="text-ink-2 inline-flex items-center gap-2">
                <span className="text-xs sm:text-sm">Add the URL in src/content/site.ts</span>
                <span className="font-mono text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded border border-line-strong text-ink-2">
                  PLACEHOLDER
                </span>
              </span>
            ) : (
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-ink transition-colors duration-160 group-hover:underline group-hover:decoration-accent group-hover:decoration-1 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded-sm font-medium"
              >
                <span>{s.label}</span>
              </a>
            )}
          </dd>
          <dd className="shrink-0 flex items-center justify-end pl-2">
            {!s.placeholder && (
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${s.label}`}
                className="text-ink-2 group-hover:text-ink transition-colors duration-160"
              >
                <Icon
                  name="arrow-up-right"
                  size={15}
                  className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-160 ease-out-expo"
                />
              </a>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

