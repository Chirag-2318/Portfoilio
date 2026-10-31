import * as React from "react";

const STATS = [
  { label: "Hackathon wins", value: "1" },
  { label: "Hackathon finals reached", value: "3" },
  { label: "Validation rules built (ValidEDI)", value: "50+" },
  { label: "Relational entities modelled (SAR Generator)", value: "15+" },
];

export function NumbersPanel() {
  return (
    <div className="relative">
      {/* Centred eyebrow label on a background-coloured strip with py-4 */}
      <div className="py-4 text-center bg-[var(--background)] screen-line-bottom">
        <span className="text-sm/none font-medium tracking-wide uppercase text-muted-foreground">
          In numbers
        </span>
      </div>

      {/* Four rows with dotted leaders */}
      <div className="py-2 bg-[var(--background)]">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex items-baseline justify-between py-1.5 px-4 group"
          >
            <span className="text-sm text-foreground shrink-0 pr-2">
              {stat.label}
            </span>
            {/* 1px dotted bottom border var(--border) across the row */}
            <span
              className="flex-1 border-b border-dotted border-[var(--border)] mx-1 self-center"
              aria-hidden="true"
            />
            <span className="text-sm font-medium tabular-nums text-foreground pl-2 shrink-0 font-mono">
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

