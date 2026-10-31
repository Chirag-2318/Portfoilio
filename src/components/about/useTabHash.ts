"use client";

import * as React from "react";

export const VALID_TABS = ["profile", "education", "skills", "highlights"] as const;
export type TabId = (typeof VALID_TABS)[number];
export const DEFAULT_TAB: TabId = "profile";

function isValidTab(id: string): id is TabId {
  return (VALID_TABS as readonly string[]).includes(id);
}

function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  window.addEventListener("cp:hash", callback);

  return () => {
    window.removeEventListener("hashchange", callback);
    window.removeEventListener("cp:hash", callback);
  };
}

function getSnapshot(): TabId {
  if (typeof window === "undefined") return DEFAULT_TAB;
  const hash = window.location.hash.replace(/^#/, "").toLowerCase();
  return isValidTab(hash) ? hash : DEFAULT_TAB;
}

function getServerSnapshot(): TabId {
  return DEFAULT_TAB;
}

export function useTabHash() {
  const activeTab = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const selectTab = React.useCallback((id: string) => {
    if (!isValidTab(id)) return;
    if (typeof window !== "undefined") {
      const current = window.location.hash.replace(/^#/, "").toLowerCase();
      if (current !== id) {
        window.history.replaceState(null, "", `#${id}`);
        window.dispatchEvent(new CustomEvent("cp:hash", { detail: `#${id}` }));
      }
    }
  }, []);

  return {
    activeTab,
    selectTab,
    validTabs: VALID_TABS,
  };
}
