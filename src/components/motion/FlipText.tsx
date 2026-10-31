"use client";

import * as React from "react";
import { FlipTextReveal } from "@/components/pp/FlipTextReveal";

export interface FlipTextProps {
  children: string;
  className?: string;
  trigger?: "self" | "parent";
}

export function FlipText({
  children,
  className = "",
  trigger = "parent",
}: FlipTextProps) {
  return (
    <FlipTextReveal
      text={children}
      className={className}
      trigger={trigger}
    />
  );
}
