import { getAssets } from "@/lib/assets";
import { Panel } from "@/components/blueprint/Panel";
import { StripeDivider } from "@/components/blueprint/StripeDivider";
import { HeroBlueprint } from "@/components/blueprint/HeroBlueprint";
import { OverviewPanel } from "@/components/blueprint/OverviewPanel";
import { SocialPanel } from "@/components/blueprint/SocialPanel";
import { ContributionsPanel } from "@/components/blueprint/ContributionsPanel";
import { AboutPanel } from "@/components/blueprint/AboutPanel";
import { NumbersPanel } from "@/components/blueprint/NumbersPanel";
import { ExperiencePanel } from "@/components/blueprint/ExperiencePanel";
import { ProjectsPanel } from "@/components/blueprint/ProjectsPanel";
import { AchievementsPanel } from "@/components/blueprint/AchievementsPanel";
import { EducationPanel } from "@/components/blueprint/EducationPanel";
import { StackPanel } from "@/components/blueprint/StackPanel";
import { ResumePanel } from "@/components/blueprint/ResumePanel";
import { ContactPanel } from "@/components/blueprint/ContactPanel";
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

      {/* 4. Overview Panel (id=overview) */}
      <Panel id="overview" noTopLine noBottomLine>
        <OverviewPanel />
      </Panel>

      {/* 5. Social Panel (id=socials) */}
      <Panel id="socials" noTopLine noBottomLine>
        <SocialPanel />
      </Panel>

      {/* 6. GitHub Contributions (conditionally rendered if username configured) */}
      <ContributionsPanel />

      {/* 7. Stripe Divider before About */}
      <StripeDivider />

      {/* 8. About Panel (id=about) */}
      <Panel id="about" noTopLine noBottomLine>
        <AboutPanel />
      </Panel>

      {/* 9. Stripe Divider between About / Numbers */}
      <StripeDivider />

      {/* 10. In Numbers (id=numbers) */}
      <Panel id="numbers" noTopLine noBottomLine>
        <NumbersPanel />
      </Panel>

      {/* 11. Stripe Divider between Numbers / Experience */}
      <StripeDivider />

      {/* 12. Experience (id=experience) */}
      <Panel id="experience" noTopLine>
        <ExperiencePanel />
      </Panel>

      {/* 13. Projects (id=projects) */}
      <Panel id="projects" noTopLine noBottomLine>
        <ProjectsPanel />
      </Panel>

      {/* 14. Stripe Divider between Projects / Achievements */}
      <StripeDivider />

      {/* 15. Achievements (id=achievements) */}
      <Panel id="achievements" noTopLine>
        <AchievementsPanel />
      </Panel>

      {/* 16. Education (id=education) */}
      <Panel id="education" noTopLine>
        <EducationPanel />
      </Panel>

      {/* 17. Stack (id=stack) */}
      <Panel id="stack" noTopLine noBottomLine>
        <StackPanel />
      </Panel>

      {/* 18. Stripe Divider between Stack / Resume */}
      <StripeDivider />

      {/* 19. Resume (id=resume) */}
      <Panel id="resume" noTopLine>
        <ResumePanel />
      </Panel>

      {/* 20. Contact (id=contact) */}
      <Panel id="contact" noTopLine noBottomLine>
        <ContactPanel />
      </Panel>

      {/* 21. Footer row: panel-like row with mono text-xs muted "Designed and built by Chirag Patil" and current year */}
      <footer className="mx-auto max-w-3xl border-x border-[var(--line)] screen-line-top relative bg-[var(--background)] px-4 py-4 flex items-center justify-between text-xs font-mono text-muted-foreground">
        <span>Designed and built by Chirag Patil</span>
        <span className="tabular-nums">{currentYear}</span>
      </footer>

      {/* 22. Closing Stripe */}
      <StripeDivider />
    </div>
  );
}
