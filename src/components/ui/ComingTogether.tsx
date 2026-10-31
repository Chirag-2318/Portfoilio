import * as React from "react";

export interface ComingTogetherProps {
  title?: string;
  note: React.ReactNode;
}

export function ComingTogether({ title, note }: ComingTogetherProps) {
  return (
    <div className="relative w-full max-w-[880px] rounded-lg border border-line-strong bg-surface p-6 sm:p-10 md:p-12 overflow-hidden shadow-sm aspect-[4/3] sm:aspect-[1.414/1] flex flex-col justify-between">
      {/* Ruled lines pattern (28px pitch) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent, transparent 27px, var(--line) 27px, var(--line) 28px)",
        }}
        aria-hidden="true"
      />

      {/* Corner Crop Ticks */}
      <div aria-hidden="true" className="pointer-events-none select-none">
        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-ink-3" />
        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-ink-3" />
        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-ink-3" />
        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-ink-3" />
      </div>

      {/* Top Header: Mono label */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="label text-[11px] font-mono text-ink-3 tracking-widest">
          PROOF PENDING
        </span>
        {title && (
          <span className="label text-[10px] text-ink-3 tabular uppercase">
            {title}
          </span>
        )}
      </div>

      {/* Centred-left note in Fraunces xl */}
      <div className="relative z-10 max-w-xl py-6">
        <div className="font-serif text-xl sm:text-2xl md:text-3xl text-ink leading-snug">
          {note}
        </div>
      </div>

      {/* Bottom corner note */}
      <div className="relative z-10 flex justify-between items-end text-[10px] font-mono text-ink-3 uppercase tracking-wider">
        <span>Second Pass · Chirag Patil</span>
        <span>Grid 28pt</span>
      </div>
    </div>
  );
}
