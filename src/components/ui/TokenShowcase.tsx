"use client";

import * as React from "react";
import { useTheme } from "next-themes";

const TOKENS = [
  { name: "--paper", lightHex: "#F3F0E8", darkHex: "#12110E", desc: "page background" },
  { name: "--paper-2", lightHex: "#EAE6DB", darkHex: "#0C0B09", desc: "wells, curtain, hover fills" },
  { name: "--surface", lightHex: "#FAF8F3", darkHex: "#1A1914", desc: "panels, dialogs" },
  { name: "--ink", lightHex: "#15140F", darkHex: "#EEEADF", desc: "primary text" },
  { name: "--ink-2", lightHex: "#55514A", darkHex: "#A9A395", desc: "secondary text (AA on paper)" },
  { name: "--ink-3", lightHex: "#7A756B", darkHex: "#6F6A5F", desc: "decorative only (guides, marks)" },
  { name: "--line", lightHex: "#D8D3C6", darkHex: "#2C2A23", desc: "hairlines" },
  { name: "--line-strong", lightHex: "#B9B3A4", darkHex: "#444137", desc: "strong lines" },
  { name: "--accent", lightHex: "#C8321A", darkHex: "#FF6B4A", desc: "proof-red" },
  { name: "--accent-ink", lightHex: "#FFFFFF", darkHex: "#12110E", desc: "text on accent" },
];

const emptySubscribe = () => () => {};
function useMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function TokenShowcase() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const [currentTheme, setCurrentTheme] = React.useState<string>("light");

  React.useEffect(() => {
    const update = () => {
      const attr = document.documentElement.getAttribute("data-theme");
      setCurrentTheme(attr || resolvedTheme || "light");
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, [resolvedTheme]);

  const isDark = mounted && currentTheme === "dark";

  return (
    <main className="min-h-screen px-5 py-8 md:px-8 md:py-12 lg:px-10 max-w-[1200px] mx-auto space-y-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 hairline border-t-0 border-x-0 border-b gap-4">
        <div>
          <span className="label block mb-1">00 — Design Tokens & Verification</span>
          <h1 className="title-2xl font-serif">Chirag Patil — Second Pass</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="label tabular">
            Theme: {mounted ? (isDark ? "Dark (Night Proof)" : "Light (Paper)") : "Loading..."}
          </span>
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="px-3 py-1.5 rounded-md hairline bg-surface hover:bg-paper-2 transition-colors text-sm font-medium"
          >
            Toggle {mounted && isDark ? "Light" : "Dark"}
          </button>
        </div>
      </div>

      {/* Colour Swatches */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="title-2xl text-2xl font-serif">Colour Tokens</h2>
          <span className="label">10 Variables · Calibrated for contrast</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {TOKENS.map((t) => {
            const currentHex = isDark ? t.darkHex : t.lightHex;
            return (
              <div
                key={t.name}
                className="rounded-lg hairline overflow-hidden bg-surface flex flex-col"
              >
                <div
                  className="h-20 w-full flex items-end p-2.5 transition-colors"
                  style={{ backgroundColor: `var(${t.name})` }}
                >
                  <span
                    className="label text-[10px] px-1.5 py-0.5 rounded-sm"
                    style={{
                      backgroundColor: "var(--surface)",
                      color: "var(--ink)",
                    }}
                  >
                    {t.name}
                  </span>
                </div>
                <div className="p-3 text-xs space-y-1 bg-surface">
                  <div className="font-mono font-medium tabular text-ink">{currentHex}</div>
                  <div className="text-ink-2 text-[11px] leading-tight">{t.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Typography Specimens */}
      <section className="space-y-6 pt-6 hairline border-t border-x-0 border-b-0">
        <div>
          <span className="label block mb-1">Typography</span>
          <h2 className="title-2xl text-2xl font-serif">Type Scale & Families</h2>
        </div>

        <div className="p-6 rounded-lg bg-surface hairline space-y-8">
          <div>
            <span className="label block mb-2">Display (Fraunces — opsz 144, SOFT 30)</span>
            <div className="display text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight">
              Chirag Patil<span className="text-accent">.</span>
            </div>
          </div>

          <div className="hairline border-t border-x-0 border-b-0 pt-6">
            <span className="label block mb-2">Title-2XL (Fraunces — opsz 72)</span>
            <div className="title-2xl">
              I do the task. Then I take it further<span className="text-accent">.</span>
            </div>
          </div>

          <div className="hairline border-t border-x-0 border-b-0 pt-6">
            <span className="label block mb-2">Body / Text (Instrument Sans 16px/24px)</span>
            <p className="text-base leading-relaxed text-ink max-w-2xl">
              Second-year at PICT and IIT Madras. I build backends, Android apps and the occasional
              hackathon prototype. A visitor must understand within seconds who he is, what he
              does, what he has done and how to reach him.
            </p>
          </div>

          <div className="hairline border-t border-x-0 border-b-0 pt-6">
            <span className="label block mb-2">Label (JetBrains Mono 11px/14px Uppercase)</span>
            <div className="space-y-1">
              <div className="label">01 — SUSPICIOUS ACTIVITY REPORT GENERATOR · SPRING BOOT</div>
              <div className="label">02 — VALIDEDI · FASTAPI · HIPAA COMPLIANT</div>
              <div className="label">03 — ARTHIX · ZERO-TYPING UPI EXPENSE TRACKER · KOTLIN</div>
            </div>
          </div>
        </div>
      </section>

      {/* Radii, Hairlines & Controls */}
      <section className="space-y-6 pt-6 hairline border-t border-x-0 border-b-0">
        <div>
          <span className="label block mb-1">Geometry & Controls</span>
          <h2 className="title-2xl text-2xl font-serif">Radii, Hairlines & Focus Ring</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Radii */}
          <div className="p-5 rounded-lg bg-surface hairline space-y-4">
            <span className="label block">Radii</span>
            <div className="space-y-3">
              <div className="p-3 bg-paper rounded-sm hairline text-xs flex justify-between items-center">
                <span>sm (6px)</span>
                <span className="label">chips / tags</span>
              </div>
              <div className="p-3 bg-paper rounded-md hairline text-xs flex justify-between items-center">
                <span>md (10px)</span>
                <span className="label">buttons / inputs</span>
              </div>
              <div className="p-3 bg-paper rounded-lg hairline text-xs flex justify-between items-center">
                <span>lg (16px)</span>
                <span className="label">panels / dialogs</span>
              </div>
              <div className="p-3 bg-paper rounded-full hairline text-xs flex justify-between items-center px-4">
                <span>pill (999px)</span>
                <span className="label">badges / pills</span>
              </div>
            </div>
          </div>

          {/* Hairlines */}
          <div className="p-5 rounded-lg bg-surface hairline space-y-4">
            <span className="label block">Hairlines & Rules</span>
            <div className="space-y-4 text-xs text-ink-2">
              <div className="hairline p-3 bg-paper text-ink">
                1px solid var(--line)
              </div>
              <div className="border border-line-strong p-3 bg-paper text-ink">
                1px solid var(--line-strong)
              </div>
              <p className="text-[11px] leading-normal">
                Hairlines are used instead of drop shadows across all views, maintaining the print-production aesthetic.
              </p>
            </div>
          </div>

          {/* Focus ring */}
          <div className="p-5 rounded-lg bg-surface hairline space-y-4">
            <span className="label block">Interactive & Focus Ring</span>
            <div className="space-y-3">
              <p className="text-xs text-ink-2 leading-relaxed">
                Test keyboard navigation (Tab) to verify visible focus ring (2px solid var(--accent), offset 3px):
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-accent text-accent-ink font-medium text-xs hover:opacity-90 transition-opacity"
                >
                  Primary Accent
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-surface hairline text-xs font-medium hover:bg-paper-2 transition-colors"
                >
                  Outline Button
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-8 pb-4 hairline border-t border-x-0 border-b-0 flex justify-between items-center text-xs text-ink-2">
        <span className="label">Prompt 1 of 10 · Scaffold & Verification</span>
        <span className="tabular">Pune, India (Asia/Kolkata)</span>
      </footer>
    </main>
  );
}
