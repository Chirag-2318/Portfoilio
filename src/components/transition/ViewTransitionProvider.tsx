"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMotionOK } from "@/components/motion/ease";
import { site } from "@/content/site";

export type TransitionPhase = "idle" | "covering" | "revealing";

export type CurtainActions = {
  cover: (label: string) => Promise<void>;
  uncover: () => Promise<void>;
};

export type ViewTransitionContextValue = {
  navigate: (href: string) => Promise<void>;
  ready: boolean;
  phase: TransitionPhase;
  curtainLabel: string;
  registerCurtain: (actions: CurtainActions) => () => void;
};

const ViewTransitionContext = React.createContext<ViewTransitionContextValue | null>(null);

export function ViewTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const motionOK = useMotionOK();

  const [ready, setReady] = React.useState(false);
  const [phase, setPhase] = React.useState<TransitionPhase>("idle");
  const [curtainLabel, setCurtainLabel] = React.useState<string>("");

  const curtainActionsRef = React.useRef<CurtainActions | null>(null);
  const pendingRouteRef = React.useRef<{
    targetPathname: string;
    resolve: () => void;
  } | null>(null);

  const registerCurtain = React.useCallback((actions: CurtainActions) => {
    curtainActionsRef.current = actions;
    return () => {
      if (curtainActionsRef.current === actions) {
        curtainActionsRef.current = null;
      }
    };
  }, []);

  // Initial mount: ready becomes true after hydration
  React.useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setReady(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Detect route change completion
  React.useEffect(() => {
    if (pendingRouteRef.current) {
      if (pathname === pendingRouteRef.current.targetPathname) {
        pendingRouteRef.current.resolve();
        pendingRouteRef.current = null;
      }
    }
  }, [pathname]);

  const navigate = React.useCallback(
    async (href: string) => {
      const [pathPart, hashPart] = href.split("#");
      const targetPath = pathPart || "/";
      const normalizedCurrent = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
      const normalizedTarget = targetPath.endsWith("/") && targetPath !== "/" ? targetPath.slice(0, -1) : targetPath;

      // Same route with hash change
      if (normalizedCurrent === normalizedTarget) {
        if (hashPart !== undefined) {
          window.location.hash = hashPart;
          window.dispatchEvent(new CustomEvent("cp:hash", { detail: `#${hashPart}` }));
        }
        return;
      }

      // If reduced motion or no curtain actions registered, navigate immediately
      if (!motionOK || !curtainActionsRef.current) {
        router.push(href);
        return;
      }

      // Find destination label from site.nav
      const navItem = site.nav.find((n) => n.href === targetPath || (n.href === "/" && targetPath === ""));
      const label = navItem
        ? `${navItem.index} — ${navItem.label}`
        : targetPath.replace(/^\//, "").toUpperCase();

      setCurtainLabel(label);
      setPhase("covering");
      setReady(false);

      // Play curtain cover animation
      await curtainActionsRef.current.cover(label);

      // Trigger Next.js route change and wait for pathname to match
      const routeChangePromise = new Promise<void>((resolve) => {
        pendingRouteRef.current = {
          targetPathname: targetPath,
          resolve,
        };

        // Fallback timeout in case pathname matching stalls
        setTimeout(() => {
          if (pendingRouteRef.current) {
            pendingRouteRef.current = null;
            resolve();
          }
        }, 1500);
      });

      router.push(href);
      await routeChangePromise;

      // Route has changed, now reveal
      setPhase("revealing");
      await curtainActionsRef.current.uncover();

      setPhase("idle");
      setReady(true);
    },
    [pathname, router, motionOK]
  );

  return (
    <ViewTransitionContext.Provider
      value={{
        navigate,
        ready,
        phase,
        curtainLabel,
        registerCurtain,
      }}
    >
      {children}
    </ViewTransitionContext.Provider>
  );
}

export function useViewTransition(): ViewTransitionContextValue {
  const context = React.useContext(ViewTransitionContext);
  if (!context) {
    throw new Error("useViewTransition must be used within a ViewTransitionProvider");
  }
  return context;
}

