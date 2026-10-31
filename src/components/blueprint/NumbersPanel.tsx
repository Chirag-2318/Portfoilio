import * as React from "react";
import { PanelHeader } from "./PanelHeader";

interface MaterialItem {
  no: string;
  item: string;
  qty: string;
}

const BOM_DATA: MaterialItem[] = [
  { no: "01", item: "Hackathon wins", qty: "1" },
  { no: "02", item: "Hackathon finals reached", qty: "3" },
  { no: "03", item: "Validation rules built (ValidEDI)", qty: "50+" },
  { no: "04", item: "Relational entities modelled (SAR Generator)", qty: "15+" },
];

export function NumbersPanel() {
  return (
    <div className="relative">
      <PanelHeader title="Bill of materials" sheet="SHEET 02 / 09" />

      {/* Drawing-sheet table */}
      <div className="bg-[var(--background)]">
        {/* Table Header Row */}
        <div className="flex items-center text-xs font-mono uppercase tracking-wider text-muted-foreground border-b border-[var(--line-strong)] bg-[var(--muted)]/30">
          <div className="w-12 px-4 py-2 border-r border-dashed border-[var(--line)] shrink-0">
            NO.
          </div>
          <div className="flex-1 px-4 py-2 border-r border-dashed border-[var(--line)] min-w-0">
            ITEM
          </div>
          <div className="w-20 px-4 py-2 text-right shrink-0">
            QTY
          </div>
        </div>

        {/* Table Body Rows */}
        <div className="divide-y divide-[var(--line)]">
          {BOM_DATA.map((row) => (
            <div
              key={row.no}
              className="flex items-center text-sm hover:bg-[var(--accent-muted)] transition-colors duration-150 group"
            >
              <div className="w-12 px-4 py-2.5 font-mono text-xs text-muted-foreground border-r border-dashed border-[var(--line)] shrink-0 tabular-nums">
                {row.no}
              </div>
              <div className="flex-1 px-4 py-2.5 text-foreground font-sans border-r border-dashed border-[var(--line)] min-w-0 truncate">
                {row.item}
              </div>
              <div className="w-20 px-4 py-2.5 text-right font-mono font-medium tabular-nums text-foreground shrink-0">
                {row.qty}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Export BillOfMaterialsPanel alias
export { NumbersPanel as BillOfMaterialsPanel };
