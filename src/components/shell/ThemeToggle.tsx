"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { useMotionOK } from "@/components/motion/ease";

const emptySubscribe = () => () => {};
function useMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const motionOK = useMotionOK();
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!mounted) {
    return <button type="button" aria-hidden="true" className="w-9 h-9 rounded-md" />;
  }

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    if (motionOK) {
      document.documentElement.classList.add("theme-fade");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        document.documentElement.classList.remove("theme-fade");
        timeoutRef.current = null;
      }, 240);
    }
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="relative w-9 h-9 flex items-center justify-center rounded-md hover:bg-paper-2 active:scale-[0.96] transition-all duration-160 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-3 cursor-pointer select-none [@media(pointer:coarse)]:after:content-[''] [@media(pointer:coarse)]:after:absolute [@media(pointer:coarse)]:after:-inset-1"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "sun" : "moon"}
          initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center"
        >
          <Icon name={isDark ? "sun" : "moon"} size={18} />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
