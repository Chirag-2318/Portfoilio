"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from "@/components/ui/Icon";

export type ToasterContextType = {
  toast: (message: string) => void;
};

const ToasterContext = React.createContext<ToasterContextType>({
  toast: () => {},
});

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = React.useState<string | null>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const toast = React.useCallback((msg: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setMessage(msg);
    timerRef.current = setTimeout(() => {
      setMessage(null);
      timerRef.current = null;
    }, 1600);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <ToasterContext.Provider value={{ toast }}>
      {children}
      <Toaster message={message} />
    </ToasterContext.Provider>
  );
}

export function useToaster(): ToasterContextType {
  return React.useContext(ToasterContext);
}

export function Toaster({ message }: { message?: string | null }) {
  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 bottom-[calc(56px+env(safe-area-inset-bottom,0px)+24px)] md:bottom-[64px] z-50 pointer-events-none"
      aria-live="polite"
      role="status"
    >
      <AnimatePresence>
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface hairline text-sm text-ink shadow-sm"
          >
            <Icon name="check" size={14} className="text-accent" />
            <span>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

