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

export default function HomePage() {
  const assets = getAssets();
  const currentYear = new Date().getFullYear();

  return (
    <div className="relative isolate px-2">
      {/* 1. Hero Section (440px desktop, 300px mobile) */}
      <HeroBlueprint hasPhoto={assets.hasPhoto} />

      {/* 2. Plain 40px gap between sections */}
      <StripeDivider />

      {/* 3. Overview Panel (id=overview) */}
      <Panel id="overview" noTopLine noBottomLine>
        <OverviewPanel />
      </Panel>

      {/* 4. Social Panel (id=socials) */}
      <Panel id="socials" noTopLine noBottomLine>
        <SocialPanel />
      </Panel>

      {/* 5. GitHub Contributions (conditionally rendered if username configured) */}
      <ContributionsPanel />

      {/* 6. Gap before About */}
      <StripeDivider />

      {/* 7. About Panel (id=about) */}
      <Panel id="about" noTopLine noBottomLine>
        <AboutPanel />
      </Panel>

      {/* 8. Gap between About / Numbers */}
      <StripeDivider />

      {/* 9. The numbers (id=numbers) */}
      <Panel id="numbers" noTopLine noBottomLine>
        <NumbersPanel />
      </Panel>

      {/* 10. Gap between Numbers / Experience */}
      <StripeDivider />

      {/* 11. Experience (id=experience) */}
      <Panel id="experience" noTopLine>
        <ExperiencePanel />
      </Panel>

      {/* 12. Projects (id=projects) */}
      <Panel id="projects" noTopLine noBottomLine>
        <ProjectsPanel />
      </Panel>

      {/* 13. Gap between Projects / Achievements */}
      <StripeDivider />

      {/* 14. Achievements (id=achievements) */}
      <Panel id="achievements" noTopLine>
        <AchievementsPanel />
      </Panel>

      {/* 15. Education (id=education) */}
      <Panel id="education" noTopLine>
        <EducationPanel />
      </Panel>

      {/* 16. Stack (id=stack) */}
      <Panel id="stack" noTopLine noBottomLine>
        <StackPanel />
      </Panel>

      {/* 17. Gap between Stack / Resume */}
      <StripeDivider />

      {/* 18. Resume (id=resume) */}
      <Panel id="resume" noTopLine>
        <ResumePanel />
      </Panel>

      {/* 19. Contact (id=contact) */}
      <Panel id="contact" noTopLine noBottomLine>
        <ContactPanel />
      </Panel>

      {/* 20. Footer row */}
      <footer className="mx-auto max-w-3xl border-x border-[var(--line-soft)] screen-line-top relative bg-[var(--background)] px-5 py-5 flex items-center justify-between text-xs font-mono text-muted-foreground">
        <span>Designed and built by Chirag Patil</span>
        <span className="tabular-nums">{currentYear}</span>
      </footer>

      {/* 21. Closing gap */}
      <StripeDivider />
    </div>
  );
}
