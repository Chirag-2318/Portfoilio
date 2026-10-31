"use client";

import * as React from "react";

const emptySubscribe = () => () => {};

function checkIsMac(): boolean {
  if (typeof navigator === "undefined") return false;
  const platform =
    (navigator as unknown as { userAgentData?: { platform?: string } })
      ?.userAgentData?.platform || navigator.platform || navigator.userAgent;
  return /Mac|iPhone|iPod|iPad/i.test(platform);
}

export function useIsMac(): boolean {
  return React.useSyncExternalStore(
    emptySubscribe,
    checkIsMac,
    () => false
  );
}
