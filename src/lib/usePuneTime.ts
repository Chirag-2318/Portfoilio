"use client";

import * as React from "react";
import { site } from "@/content/site";

function formatPuneTime(): string {
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

let currentTime = formatPuneTime();
const listeners = new Set<() => void>();
let timerId: NodeJS.Timeout | null = null;

function scheduleNextMinute() {
  const now = new Date();
  const msUntilNextMinute =
    (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 50;

  timerId = setTimeout(() => {
    currentTime = formatPuneTime();
    listeners.forEach((listener) => listener());
    scheduleNextMinute();
  }, msUntilNextMinute);
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  if (listeners.size === 1) {
    currentTime = formatPuneTime();
    scheduleNextMinute();
  }

  return () => {
    listeners.delete(callback);
    if (listeners.size === 0 && timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };
}

function getSnapshot(): string {
  return currentTime;
}

function getServerSnapshot(): null {
  return null;
}

export function usePuneTime(): string | null {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
