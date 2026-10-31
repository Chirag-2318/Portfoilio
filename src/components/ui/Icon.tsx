import * as React from "react";
import {
  Sun,
  Moon,
  Copy,
  Check,
  ArrowUpRight,
  ArrowRight,
  Download,
  Search,
  X,
  ChevronDown,
  ExternalLink,
  Printer,
} from "lucide-react";
import { EmailIcon } from "@/components/icons/EmailIcon";
import { CallIcon } from "@/components/icons/CallIcon";

export type IconName =
  | "sun"
  | "moon"
  | "copy"
  | "check"
  | "arrow-up-right"
  | "arrow-right"
  | "github"
  | "linkedin"
  | "mail"
  | "phone"
  | "download"
  | "printer"
  | "search"
  | "x"
  | "chevron-down"
  | "external"
  | "registration";

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, "ref"> {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function Icon({
  name,
  size = 18,
  strokeWidth = 1.5,
  className = "",
  "aria-hidden": ariaHidden = true,
  ...props
}: IconProps) {
  const commonProps = {
    width: size,
    height: size,
    strokeWidth,
    className,
    "aria-hidden": ariaHidden,
    ...props,
  };

  switch (name) {
    case "sun":
      return <Sun {...commonProps} />;
    case "moon":
      return <Moon {...commonProps} />;
    case "copy":
      return <Copy {...commonProps} />;
    case "check":
      return <Check {...commonProps} />;
    case "arrow-up-right":
      return <ArrowUpRight {...commonProps} />;
    case "arrow-right":
      return <ArrowRight {...commonProps} />;
    case "mail":
      return <EmailIcon {...commonProps} />;
    case "phone":
      return <CallIcon {...commonProps} />;
    case "download":
      return <Download {...commonProps} />;
    case "printer":
      return <Printer {...commonProps} />;
    case "search":
      return <Search {...commonProps} />;
    case "x":
      return <X {...commonProps} />;
    case "chevron-down":
      return <ChevronDown {...commonProps} />;
    case "external":
      return <ExternalLink {...commonProps} />;

    case "github":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...commonProps}
        >
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
          <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
      );

    case "linkedin":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...commonProps}
        >
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );

    case "registration":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...commonProps}
        >
          {/* Main circle r=6 centred */}
          <circle cx="12" cy="12" r="6" />
          {/* Four crosshair lines extending 3px beyond the circle at N, S, W, E */}
          <line x1="12" y1="3" x2="12" y2="21" />
          <line x1="3" y1="12" x2="21" y2="12" />
          {/* Second smaller circle r=3 offset (+2, +2) drawn with stroke var(--accent) */}
          <circle
            cx="14"
            cy="14"
            r="3"
            stroke="var(--accent)"
            className="registration-offset transition-transform duration-160 ease-out-expo group-hover:translate-x-px group-hover:translate-y-px"
          />
        </svg>
      );

    default:
      return null;
  }
}
