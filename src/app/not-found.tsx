import { Panel } from "@/components/blueprint/Panel";
import { StripeDivider } from "@/components/blueprint/StripeDivider";
import { InlineGame } from "@/components/game/InlineGame";

export const metadata = {
  title: "404 — Not Found — Chirag Patil",
};

export default function NotFound() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="relative isolate px-2 py-8">
      <StripeDivider />

      <Panel noTopLine noBottomLine className="py-6 px-4">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="text-center space-y-1">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block">
              // 404 — Page Not Found
            </span>
            <h1 className="text-2xl font-medium tracking-tight text-foreground">
              Off the blueprint.
            </h1>
          </div>

          <InlineGame />
        </div>
      </Panel>

      <footer className="mx-auto max-w-3xl border-x border-[var(--line)] screen-line-top relative bg-[var(--background)] px-4 py-4 flex items-center justify-between text-xs font-mono text-muted-foreground">
        <span>Designed and built by Chirag Patil</span>
        <span className="tabular-nums">{currentYear}</span>
      </footer>

      <StripeDivider />
    </div>
  );
}
