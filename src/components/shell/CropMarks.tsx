import * as React from "react";

export function CropMarks() {
  return (
    <div
      data-print="hide"
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[5] hidden min-[480px]:block select-none"
    >
      {/* Top Left */}
      <div className="absolute top-[10px] left-[10px] w-[10px] h-[10px]">
        <div className="absolute top-0 left-0 w-[10px] h-[1px] bg-ink-3" />
        <div className="absolute top-0 left-0 w-[1px] h-[10px] bg-ink-3" />
      </div>

      {/* Top Right */}
      <div className="absolute top-[10px] right-[10px] w-[10px] h-[10px]">
        <div className="absolute top-0 right-0 w-[10px] h-[1px] bg-ink-3" />
        <div className="absolute top-0 right-0 w-[1px] h-[10px] bg-ink-3" />
      </div>

      {/* Bottom Left */}
      <div className="absolute bottom-[10px] left-[10px] w-[10px] h-[10px]">
        <div className="absolute bottom-0 left-0 w-[10px] h-[1px] bg-ink-3" />
        <div className="absolute bottom-0 left-0 w-[1px] h-[10px] bg-ink-3" />
      </div>

      {/* Bottom Right */}
      <div className="absolute bottom-[10px] right-[10px] w-[10px] h-[10px]">
        <div className="absolute bottom-0 right-0 w-[10px] h-[1px] bg-ink-3" />
        <div className="absolute bottom-0 right-0 w-[1px] h-[10px] bg-ink-3" />
      </div>
    </div>
  );
}

