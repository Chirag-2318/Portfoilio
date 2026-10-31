"use client";

import * as React from "react";
import { usePuneTime } from "@/lib/usePuneTime";

export function Clock() {
  const puneTime = usePuneTime();

  return (
    <div
      className="hidden min-[480px]:inline-flex items-center font-mono text-xs tabular text-ink-2 select-none whitespace-nowrap"
      title="Local time in Pune (IST)"
    >
      <span className="hidden sm:inline mr-1">PUNE</span>
      <span>{puneTime ?? "--:--"}</span>
    </div>
  );
}
