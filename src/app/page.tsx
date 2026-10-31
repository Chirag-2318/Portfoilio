import { getAssets } from "@/lib/assets";
import { Panel } from "@/components/blueprint/Panel";
import { PanelHeader } from "@/components/blueprint/PanelHeader";
import { StripeDivider } from "@/components/blueprint/StripeDivider";
import { HeroBlueprint } from "@/components/blueprint/HeroBlueprint";
import { OverviewPanel } from "@/components/blueprint/OverviewPanel";
import { SocialPanel } from "@/components/blueprint/SocialPanel";
import { AboutPanel } from "@/components/blueprint/AboutPanel";
import { Dimension } from "@/components/blueprint/Dimension";

export default function HomePage() {
  const assets = getAssets();
  const currentYear = new Date().getFullYear();

  return (
    <div className="relative isolate px-2">
      {/* 1. Pre-hero 32px tall strip with horizontal 768 dimension line (desktop only, hidden below 49rem / md) */}
      <div className="hidden md:flex items-center h-8 mx-auto max-w-3xl border-x border-[var(--line)] px-4 screen-line-top screen-line-bottom relative bg-[var(--background)]">
        <Dimension label="768" variant="horizontal" className="w-full" />
      </div>

      {/* 2. Hero Section (500px desktop, 320px mobile) */}
      <HeroBlueprint hasPhoto={assets.hasPhoto} />

      {/* 3. 32px Stripe divider with vertical 32 dimension annotation to the right (hidden below lg) */}
      <div className="relative">
        <StripeDivider />
        <div className="hidden lg:block absolute left-[calc(100%+0.75rem)] top-1/2 -translate-y-1/2 w-6 h-8">
          <Dimension label="32" variant="vertical" className="h-full" />
        </div>
      </div>

      {/* 4. Overview Panel (sr-only h2 "Overview", screen lines not doubled) */}
      <Panel id="overview" noTopLine noBottomLine>
        <OverviewPanel />
      </Panel>

      {/* 5. Social Panel (sr-only h2 "Social links", screen lines suppressed against neighbours) */}
      <Panel id="socials" noTopLine noBottomLine>
        <SocialPanel />
      </Panel>

      {/* 6. Stripe Divider between Social and About */}
      <StripeDivider />

      {/* 7. About Panel (time-aware greeting header + resume facts + double rule) */}
      <Panel id="about" noTopLine noBottomLine>
        <AboutPanel />
      </Panel>

      {/* 8. Temporary "Coming together" placeholder panel for sections Prompt 2 will build */}
      <Panel id="projects" noTopLine noBottomLine className="mt-8">
        <PanelHeader
          eyebrow="BLUEPRINT GRID · PROMPT 2"
          title="Experience, Projects &amp; Credentials"
        />
        <div className="p-4 py-8 flex flex-col items-center justify-center text-center gap-2">
          <div className="size-8 rounded-md border border-dashed border-[var(--border)] flex items-center justify-center text-muted-foreground font-mono text-xs">
            §
          </div>
          <p className="font-mono text-xs text-muted-foreground max-w-sm mt-1">
            Experience timeline, project case studies, credentials and interactive game overlay will be assembled in Prompt 2.
          </p>
        </div>
      </Panel>

      {/* 9. Footer row: panel-like row with mono text-xs muted "Designed and built by Chirag Patil" and current year */}
      <div className="mx-auto max-w-3xl border-x border-[var(--line)] screen-line-top screen-line-bottom relative bg-[var(--background)] px-4 py-4 flex items-center justify-between text-xs font-mono text-muted-foreground">
        <span>Designed and built by Chirag Patil</span>
        <span className="tabular-nums">{currentYear}</span>
      </div>

      {/* 10. Closing Stripe */}
      <StripeDivider />
    </div>
  );
}
