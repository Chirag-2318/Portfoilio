"use client";

import * as React from "react";
import { site } from "@/content/site";

export type ProjectId = (typeof site.projects)[number]["id"];

const VALID_PROJECT_IDS: ProjectId[] = site.projects.map((p) => p.id);
export const DEFAULT_PROJECT_ID: ProjectId = VALID_PROJECT_IDS[0] || "sar";

function isValidProjectId(id: string): id is ProjectId {
  return (VALID_PROJECT_IDS as readonly string[]).includes(id);
}

function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  window.addEventListener("cp:hash", callback);

  return () => {
    window.removeEventListener("hashchange", callback);
    window.removeEventListener("cp:hash", callback);
  };
}

function getSnapshot(): ProjectId {
  if (typeof window === "undefined") return DEFAULT_PROJECT_ID;
  const hash = window.location.hash.replace(/^#/, "").toLowerCase();
  return isValidProjectId(hash) ? hash : DEFAULT_PROJECT_ID;
}

function getServerSnapshot(): ProjectId {
  return DEFAULT_PROJECT_ID;
}

export function useProjectHash() {
  const selectedId = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const selectProject = React.useCallback((id: string) => {
    if (!isValidProjectId(id)) return;
    if (typeof window !== "undefined") {
      const current = window.location.hash.replace(/^#/, "");
      if (current !== id) {
        window.history.replaceState(null, "", `#${id}`);
        window.dispatchEvent(new CustomEvent("cp:hash", { detail: `#${id}` }));
      }
    }
  }, []);

  return {
    selectedId,
    selectProject,
    validIds: VALID_PROJECT_IDS,
  };
}
