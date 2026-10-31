import Link from "next/link";
import { Panel } from "@/components/blueprint/Panel";
import { StripeDivider } from "@/components/blueprint/StripeDivider";
import { ToppingOut } from "@/components/game/topping-out";

export const metadata = {
  title: "404 — Not Found — Chirag Patil",
};

export default function NotFound() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="relative isolate px-2 py-8">
      <StripeDivider />

      <Panel noTopLine noBottomLine className="py-6 px-4">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block">
              // 404 — Page Not Found
            </span>
            <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground">
              Off the blueprint.
            </h1>
            <p className="font-mono text-xs text-muted-foreground">
              404. Page not found. Play instead.
            </p>
          </div>

          <ToppingOut mode="inline" autoFocus={false} />

          <div className="text-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground link transition-colors"
            >
              ← Return to blueprint
            </Link>
          </div>
        </div>
      </Panel>

      <footer className="mx-auto max-w-3xl border-x border-[var(--line-soft)] screen-line-top relative bg-[var(--background)] px-5 py-5 flex items-center justify-between text-xs font-mono text-muted-foreground">
        <span>Designed and built by Chirag Patil</span>
        <span className="tabular-nums">{currentYear}</span>
      </footer>

      <StripeDivider />
    </div>
  );
}
