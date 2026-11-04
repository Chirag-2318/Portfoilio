"use client";

import * as React from "react";
import { site } from "@/content/site";
import { IconTile } from "@/components/blueprint/IconTile";
import { CopyButton } from "@/components/blueprint/CopyButton";
import { ScrambleDecodeText } from "@/components/inspector/effects/ScrambleDecodeText";

export function OverviewPanel() {
  const [timeStr, setTimeStr] = React.useState<string>("");
  const [tzOffsetNote, setTzOffsetNote] = React.useState<string>("");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    const updateClock = () => {
      const now = new Date();
      // Format hh:mm:ss a in Asia/Kolkata
      try {
        const istFormatter = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Kolkata",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
        setTimeStr(istFormatter.format(now));

        // Compute difference with visitor's local time zone
        const localOffsetMinutes = -now.getTimezoneOffset(); // visitor offset from UTC in minutes
        const istOffsetMinutes = 330; // +05:30 = 330 minutes
        const diffMinutes = istOffsetMinutes - localOffsetMinutes;

        if (Math.abs(diffMinutes) < 15) {
          setTzOffsetNote("// same time zone");
        } else {
          const diffHours = diffMinutes / 60;
          const absHours = Math.abs(diffHours);
          const formattedHours = Number.isInteger(absHours)
            ? absHours.toString()
            : absHours.toFixed(1);

          if (diffHours > 0) {
            setTzOffsetNote(`// ${formattedHours}h ahead of you`);
          } else {
            setTzOffsetNote(`// ${formattedHours}h behind you`);
          }
        }
      } catch {
        setTimeStr("--:-- --");
        setTzOffsetNote("// IST");
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-5 sm:p-6 relative">
      <h2 className="sr-only">Overview</h2>

      <div className="relative grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {/* Row 1: Spans both columns: Briefcase icon */}
        <div className="sm:col-span-2 flex items-center gap-3 font-mono text-sm group">
          <div data-build-id="info-row-1-icon" data-build-type="chrome">
            <IconTile>
              <BriefcaseIcon />
            </IconTile>
          </div>
          <span
            data-build-id="info-row-1-text"
            data-build-type="text"
            className="text-foreground"
          >
            Summer Intern @{" "}
            <a href="#experience" className="link font-semibold">
              Barclays
            </a>{" "}
            <span className="text-muted-foreground">(upcoming)</span>
          </span>
        </div>

        {/* Row 2: Map pin icon */}
        <div className="flex items-center gap-3 font-mono text-sm group min-w-0">
          <div data-build-id="info-row-2-icon" data-build-type="chrome">
            <IconTile>
              <MapPinIcon />
            </IconTile>
          </div>
          <a
            data-build-id="info-row-2-text"
            data-build-type="text"
            href="https://maps.google.com/?q=Pune,+Maharashtra,+India"
            target="_blank"
            rel="noopener noreferrer"
            className="link truncate text-foreground"
          >
            Pune, Maharashtra, India
          </a>
        </div>

        {/* Row 3: Clock icon (live local time in Asia/Kolkata formatted hh:mm AM/PM) */}
        <div className="flex items-center gap-3 font-mono text-sm group min-w-0">
          <div data-build-id="info-row-3-icon" data-build-type="chrome">
            <IconTile>
              <ClockIcon />
            </IconTile>
          </div>
          <div
            data-build-id="info-row-3-text"
            data-build-type="text"
            className="flex items-baseline gap-1.5 truncate"
          >
            <span className="tabular-nums text-foreground">
              {mounted ? (
                <ScrambleDecodeText text={timeStr} targetId="info-row-3-text" />
              ) : (
                "--:-- --"
              )}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {mounted ? tzOffsetNote : "// IST"}
            </span>
          </div>
        </div>

        {/* Row 4: Mail icon with copy button */}
        <div className="flex items-center gap-3 font-mono text-sm group min-w-0 justify-between sm:justify-start">
          <div className="flex items-center gap-3 min-w-0 truncate">
            <div data-build-id="info-row-4-icon" data-build-type="chrome">
              <IconTile>
                <MailIcon />
              </IconTile>
            </div>
            <a
              data-build-id="info-row-4-text"
              data-build-type="text"
              href={`mailto:${site.email}`}
              className="link truncate text-foreground"
            >
              <ScrambleDecodeText text={site.email} targetId="info-row-4-text" />
            </a>
          </div>
          <CopyButton text={site.email} message="Email copied to clipboard" />
        </div>

        {/* Row 5: Phone icon with copy button */}
        <div className="flex items-center gap-3 font-mono text-sm group min-w-0 justify-between sm:justify-start">
          <div className="flex items-center gap-3 min-w-0 truncate">
            <div data-build-id="info-row-5-icon" data-build-type="chrome">
              <IconTile>
                <PhoneIcon />
              </IconTile>
            </div>
            <a
              data-build-id="info-row-5-text"
              data-build-type="text"
              href="tel:+918080645366"
              className="link truncate text-foreground"
            >
              <ScrambleDecodeText text="+91 8080645366" targetId="info-row-5-text" />
            </a>
          </div>
          <CopyButton text="+918080645366" message="Phone number copied" />
        </div>

        {/* Row 6: Graduation cap icon */}
        <div className="sm:col-span-2 flex items-center gap-3 font-mono text-sm group">
          <div data-build-id="info-row-6-icon" data-build-type="chrome">
            <IconTile>
              <GraduationCapIcon />
            </IconTile>
          </div>
          <span
            data-build-id="info-row-6-text"
            data-build-type="text"
            className="text-foreground"
          >
            B.Tech E&amp;TC at PICT + B.Sc at IIT Madras
          </span>
        </div>
      </div>
    </div>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function GraduationCapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}
