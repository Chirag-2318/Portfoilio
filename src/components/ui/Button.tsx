import * as React from "react";
import { ViewLink } from "@/components/transition/ViewLink";

export type ButtonVariant = "primary" | "outline" | "ghost";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  href?: string;
  target?: string;
  rel?: string;
  children: React.ReactNode;
  className?: string;
}

export function Button({
  variant = "primary",
  href,
  target,
  rel,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses =
    "group inline-flex items-center justify-center gap-2 text-sm font-medium cursor-pointer select-none transition-all duration-160 ease-out-expo focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-3 active:scale-[0.98]";

  let variantClasses = "";
  if (variant === "primary") {
    variantClasses =
      "h-11 sm:h-10 px-5 rounded-full bg-ink text-paper hover:-translate-y-px shadow-sm";
  } else if (variant === "outline") {
    variantClasses =
      "h-11 sm:h-10 px-5 rounded-full border border-line-strong bg-transparent text-ink hover:bg-paper-2 hover:-translate-y-px";
  } else if (variant === "ghost") {
    variantClasses = "h-10 px-3 rounded-md text-ink hover:bg-paper-2";
  }

  const combinedClasses = `${baseClasses} ${variantClasses} ${className}`;

  if (href) {
    const isInternal = href.startsWith("/") || href.startsWith("#");
    if (isInternal && !target) {
      return (
        <ViewLink href={href} className={combinedClasses}>
          {children}
        </ViewLink>
      );
    }

    const defaultRel = target === "_blank" ? "noopener noreferrer" : undefined;
    return (
      <a href={href} target={target} rel={rel || defaultRel} className={combinedClasses}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={combinedClasses} {...props}>
      {children}
    </button>
  );
}

