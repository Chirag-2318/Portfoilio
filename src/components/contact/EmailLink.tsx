import * as React from "react";
import { site } from "@/content/site";

export interface EmailLinkProps {
  email?: string;
  children?: string;
  className?: string;
}

export function EmailLink({
  email = site.email,
  children,
  className = "",
}: EmailLinkProps) {
  const displayText = children || email;

  return (
    <a
      href={`mailto:${email}?subject=Hello%20Chirag`}
      className={`group relative inline-block font-serif font-normal leading-[1.05] tracking-[-0.02em] [overflow-wrap:anywhere] text-[clamp(1.5rem,4.4vw,4.5rem)] text-ink transition-colors duration-160 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-8 rounded-sm after:content-[''] after:absolute after:left-0 after:bottom-[-6px] after:w-full after:h-[2px] after:bg-accent after:origin-left after:scale-x-0 after:transition-transform after:duration-[260ms] after:ease-[cubic-bezier(0.16,1,0.3,1)] hover:after:scale-x-100 focus-visible:after:scale-x-100 select-text ${className}`}
    >
      <span>{displayText}</span>
    </a>
  );
}
