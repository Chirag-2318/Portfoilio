import * as React from "react";
import { cn } from "@/lib/cn";

interface TagProps {
  children: React.ReactNode;
  className?: string;
}

export function Tag({ children, className }: TagProps) {
  return (
    <span
      className={cn(
        "tag-badge inline-flex items-center rounded-full px-2 py-0.5",
        "font-mono text-xs select-none",
        "bg-[#18181b] text-[#a1a1aa] border border-[#27272a]",
        "light:bg-[#f4f4f5] light:text-[#52525b] light:border-[#e4e4e7] [.light_&]:bg-[#f4f4f5] [.light_&]:text-[#52525b] [.light_&]:border-[#e4e4e7]",
        className
      )}
    >
      {children}
    </span>
  );
}
