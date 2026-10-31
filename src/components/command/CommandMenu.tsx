"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Command } from "cmdk";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Kbd } from "@/components/ui/Kbd";
import { site } from "@/content/site";
import { getSocials } from "@/lib/socials";
import { useCommand } from "@/components/command/CommandProvider";
import { useViewTransition } from "@/components/transition/ViewTransitionProvider";
import { useGame } from "@/components/shell/GameProvider";
import { useDraft } from "@/components/home/DraftContext";
import { useAssets } from "@/lib/AssetsContext";
import { useCopy } from "@/lib/useCopy";

export function CommandMenu() {
  const { open, setOpen } = useCommand();
  const { navigate } = useViewTransition();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { openGame } = useGame();
  const { draft, toggle: toggleDraft } = useDraft();
  const { hasResume } = useAssets();
  const { copy } = useCopy();

  const handleSelect = React.useCallback((action: () => void) => {
    setOpen(false);
    // Small tick to ensure menu is closed before triggering transition
    setTimeout(action, 40);
  }, [setOpen]);

  const visibleSocials = getSocials().filter((s) => s.visible);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command Menu"
      className="fixed top-[12vh] left-1/2 -translate-x-1/2 w-[min(560px,calc(100vw-32px))] bg-surface rounded-lg border border-line-strong shadow-xl overflow-hidden z-50 focus:outline-none"
      overlayClassName="fixed inset-0 z-50 bg-[color-mix(in_srgb,var(--ink)_40%,transparent)]"
    >
      <div className="flex items-center px-4 border-b border-line">
        <Icon name="search" size={16} className="text-ink-2 shrink-0 mr-3" />
        <Command.Input
          placeholder="Type a command or search…"
          className="w-full h-[52px] bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
        />
        <Kbd className="shrink-0 text-[10px]">ESC</Kbd>
      </div>

      <Command.List className="max-h-[360px] overflow-y-auto p-2 space-y-1 focus:outline-none">
        <Command.Empty className="py-6 text-center text-xs font-mono text-ink-3">
          No results found.
        </Command.Empty>

        {/* GO TO */}
        <Command.Group heading="Go to" className="[&_[cmdk-group-heading]]:label [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:block">
          <CommandItem
            id="nav-home"
            icon="arrow-right"
            label="Home"
            hint="01"
            onSelect={() => handleSelect(() => navigate("/"))}
          />
          <CommandItem
            id="nav-work"
            icon="arrow-right"
            label="Work"
            hint="02"
            onSelect={() => handleSelect(() => navigate("/work"))}
          />
          <CommandItem
            id="nav-about"
            icon="arrow-right"
            label="About"
            hint="03"
            onSelect={() => handleSelect(() => navigate("/about"))}
          />
          <CommandItem
            id="nav-education"
            icon="arrow-right"
            label="Education"
            hint="About"
            onSelect={() => handleSelect(() => navigate("/about#education"))}
          />
          <CommandItem
            id="nav-skills"
            icon="arrow-right"
            label="Skills"
            hint="About"
            onSelect={() => handleSelect(() => navigate("/about#skills"))}
          />
          <CommandItem
            id="nav-highlights"
            icon="arrow-right"
            label="Highlights"
            hint="About"
            onSelect={() => handleSelect(() => navigate("/about#highlights"))}
          />
          <CommandItem
            id="nav-resume"
            icon="arrow-right"
            label="Resume"
            hint="04"
            onSelect={() => handleSelect(() => navigate("/resume"))}
          />
          <CommandItem
            id="nav-contact"
            icon="arrow-right"
            label="Contact"
            hint="05"
            onSelect={() => handleSelect(() => navigate("/contact"))}
          />
        </Command.Group>

        {/* PROJECTS */}
        <Command.Group heading="Projects" className="[&_[cmdk-group-heading]]:label [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:block">
          <CommandItem
            id="proj-sar"
            icon="arrow-up-right"
            label="SAR Generator with Audit Trails"
            hint="Spring Boot"
            keywords={["spring", "java", "compliance"]}
            onSelect={() => handleSelect(() => navigate("/work#sar"))}
          />
          <CommandItem
            id="proj-validedi"
            icon="arrow-up-right"
            label="ValidEDI — Healthcare EDI Parser"
            hint="FastAPI"
            keywords={["hipaa", "python", "x12"]}
            onSelect={() => handleSelect(() => navigate("/work#validedi"))}
          />
          <CommandItem
            id="proj-arthix"
            icon="arrow-up-right"
            label="ARTHIX — Zero-Typing UPI Tracker"
            hint="Android"
            keywords={["kotlin", "upi", "jetpack"]}
            onSelect={() => handleSelect(() => navigate("/work#arthix"))}
          />
        </Command.Group>

        {/* ACTIONS */}
        <Command.Group heading="Actions" className="[&_[cmdk-group-heading]]:label [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:block">
          <CommandItem
            id="act-copy-email"
            icon="copy"
            label="Copy email"
            hint={site.email}
            onSelect={() => handleSelect(() => copy(site.email))}
          />
          <CommandItem
            id="act-send-email"
            icon="mail"
            label="Send email"
            onSelect={() =>
              handleSelect(() => {
                window.location.href = `mailto:${site.email}?subject=Hello%20Chirag`;
              })
            }
          />
          <CommandItem
            id="act-toggle-theme"
            icon={resolvedTheme === "dark" ? "sun" : "moon"}
            label={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} theme`}
            onSelect={() =>
              handleSelect(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))
            }
          />
          {pathname === "/" && (
            <CommandItem
              id="act-draft-toggle"
              icon="registration"
              label={draft ? "Back to final" : "Show first draft"}
              hint="Home only"
              onSelect={() => handleSelect(toggleDraft)}
            />
          )}
          {pathname.startsWith("/resume") && (
            <CommandItem
              id="act-print-resume"
              icon="printer"
              label="Print resume"
              onSelect={() =>
                handleSelect(() => {
                  window.print();
                })
              }
            />
          )}
          {hasResume && (
            <CommandItem
              id="act-download-resume"
              icon="download"
              label="Download resume (PDF)"
              onSelect={() =>
                handleSelect(() => {
                  const a = document.createElement("a");
                  a.href = site.assets.resume;
                  a.download = "Chirag_Patil_Resume.pdf";
                  a.click();
                })
              }
            />
          )}
          <CommandItem
            id="act-play-game"
            icon="registration"
            label="Play Registration"
            hint="Mini-game"
            onSelect={() => handleSelect(openGame)}
          />
        </Command.Group>

        {/* ELSEWHERE */}
        {visibleSocials.length > 0 && (
          <Command.Group heading="Elsewhere" className="[&_[cmdk-group-heading]]:label [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:block">
            {visibleSocials.map((s) => (
              <CommandItem
                key={s.key}
                id={`link-${s.key}`}
                icon={s.key}
                label={s.label}
                hint={s.placeholder ? "Placeholder" : "External"}
                onSelect={() =>
                  handleSelect(() => window.open(s.url, "_blank", "noopener,noreferrer"))
                }
              />
            ))}
          </Command.Group>
        )}
      </Command.List>

      {/* Footer hint */}
      <div className="px-4 py-2 border-t border-line hairline border-x-0 border-b-0 flex items-center justify-between text-[11px] font-mono text-ink-2 select-none bg-paper">
        <span>↑↓ navigate · ↵ select · esc close</span>
        <span className="tabular">Ctrl/Cmd + K</span>
      </div>
    </Command.Dialog>
  );
}

function CommandItem({
  id,
  icon,
  label,
  hint,
  keywords,
  onSelect,
}: {
  id: string;
  icon: IconName;
  label: string;
  hint?: string;
  keywords?: string[];
  onSelect: () => void;
}) {
  return (
    <Command.Item
      id={id}
      value={`${label} ${hint || ""} ${keywords?.join(" ") || ""}`}
      onSelect={onSelect}
      className="relative h-11 px-3 rounded-md flex items-center justify-between text-sm font-medium text-ink cursor-pointer select-none transition-colors duration-160 data-[selected=true]:bg-paper-2 data-[selected=true]:before:content-[''] data-[selected=true]:before:absolute data-[selected=true]:before:left-0 data-[selected=true]:before:top-1.5 data-[selected=true]:before:bottom-1.5 data-[selected=true]:before:w-[2px] data-[selected=true]:before:bg-accent"
    >
      <div className="flex items-center gap-2.5 truncate">
        <Icon name={icon} size={16} className="text-ink-2 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      {hint && (
        <span className="font-mono text-[11px] text-ink-3 ml-2 shrink-0">
          {hint}
        </span>
      )}
    </Command.Item>
  );
}
