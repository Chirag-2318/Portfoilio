"use client";

import * as React from "react";
import { site } from "@/content/site";

function getPuneTime(): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: site.location.timeZone,
    }).format(new Date());
  } catch {
    return "--:--";
  }
}

const emptySubscribe = () => () => {};

export function Clock() {
  const isMounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [time, setTime] = React.useState<string>(getPuneTime);

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const scheduleNextMinute = () => {
      const now = new Date();
      const msUntilNextMinute =
        (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 50;

      timeoutId = setTimeout(() => {
        setTime(getPuneTime());
        scheduleNextMinute();
      }, msUntilNextMinute);
    };

    scheduleNextMinute();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div
      className="hidden min-[480px]:inline-flex items-center font-mono text-xs tabular text-ink-2 select-none whitespace-nowrap"
      title="Local time in Pune (IST)"
    >
      <span className="hidden sm:inline mr-1">PUNE</span>
      <span>{isMounted ? time : "--:--"}</span>
    </div>
  );
}
