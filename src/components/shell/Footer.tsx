import * as React from "react";

export function Footer() {
  return (
    <footer className="hidden md:flex h-10 border-t border-line px-[var(--page-x)] bg-paper select-none items-center shrink-0">
      <div className="w-full max-w-[1760px] mx-auto flex items-center justify-between font-mono text-[11px] text-ink-2">
        <span>Designed and built by Chirag Patil</span>
        <span>Second Pass · Set in Fraunces, Instrument Sans & JetBrains Mono</span>
      </div>
    </footer>
  );
}
