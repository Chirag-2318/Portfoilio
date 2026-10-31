"use client";

import * as React from "react";
import Link, { LinkProps } from "next/link";
import { useViewTransition } from "@/components/transition/ViewTransitionProvider";

export interface ViewLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>,
    LinkProps {
  children: React.ReactNode;
  className?: string;
}

export const ViewLink = React.forwardRef<HTMLAnchorElement, ViewLinkProps>(
  ({ href, onClick, className, children, ...props }, ref) => {
    const { navigate } = useViewTransition();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);

      // Only handle plain primary clicks without modifier keys
      if (
        !e.defaultPrevented &&
        e.button === 0 &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.shiftKey &&
        (!props.target || props.target === "_self")
      ) {
        e.preventDefault();
        navigate(href.toString());
      }
    };

    return (
      <Link ref={ref} href={href} onClick={handleClick} className={className} {...props}>
        {children}
      </Link>
    );
  }
);

ViewLink.displayName = "ViewLink";

