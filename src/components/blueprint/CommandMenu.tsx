"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Command } from "cmdk";
import { site } from "@/content/site";
import { useCommand } from "@/components/command/CommandProvider";
import { useGame } from "@/components/shell/GameProvider";
import { useCopy } from "@/lib/useCopy";

export function CommandMenu() {
  const { open, setOpen } = useCommand();
  const { theme, setTheme } = useTheme();
  const { openGame } = useGame();
  const { copy } = useCopy();

  // Listen for "/" key to open palette (when not already typing in an input/textarea)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setOpen]);

  const navigate = React.useCallback((hash: string) => {
    setOpen(false);
    setTimeout(() => {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.location.hash = hash;
      }
    }, 40);
  }, [setOpen]);

  const handleAction = React.useCallback((action: () => void) => {
    setOpen(false);
    setTimeout(action, 40);
  }, [setOpen]);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command Palette"
      className="fixed top-[12vh] left-1/2 -translate-x-1/2 w-[min(560px,calc(100vw-32px))] rounded-xl border border-[var(--line)] shadow-2xl overflow-hidden z-50 focus:outline-none bg-[var(--background)] text-foreground"
      overlayClassName="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
    >
      {/* Input */}
      <div className="flex items-center px-4 border-b border-[var(--line)]">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground mr-3 shrink-0"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <Command.Input
          placeholder="Type a command or search…"
          className="w-full h-13 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-sans"
        />

        <kbd className="kbd shrink-0 text-[10px]">ESC</kbd>
      </div>

      <Command.List className="max-h-[360px] overflow-y-auto p-2 space-y-2 focus:outline-none">
        <Command.Empty className="py-8 text-center text-xs font-mono text-muted-foreground">
          No matching results.
        </Command.Empty>

        {/* Group: Navigate */}
        <Command.Group
          heading="Navigate"
          className="[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:block"
        >
          <CommandRow
            label="Hero / Top"
            hint="#top"
            onSelect={() => navigate("#top")}
          />
          <CommandRow
            label="Overview"
            hint="#overview"
            onSelect={() => navigate("#overview")}
          />
          <CommandRow
            label="About"
            hint="#about"
            onSelect={() => navigate("#about")}
          />
          <CommandRow
            label="Bill of materials"
            hint="#numbers"
            onSelect={() => navigate("#numbers")}
          />
          <CommandRow
            label="Experience"
            hint="#experience"
            onSelect={() => navigate("#experience")}
          />
          <CommandRow
            label="Projects"
            hint="#projects"
            onSelect={() => navigate("#projects")}
          />
          <CommandRow
            label="Achievements"
            hint="#achievements"
            onSelect={() => navigate("#achievements")}
          />
          <CommandRow
            label="Education"
            hint="#education"
            onSelect={() => navigate("#education")}
          />
          <CommandRow
            label="Stack"
            hint="#stack"
            onSelect={() => navigate("#stack")}
          />
          <CommandRow
            label="Resume"
            hint="#resume"
            onSelect={() => navigate("#resume")}
          />
          <CommandRow
            label="Contact"
            hint="#contact"
            onSelect={() => navigate("#contact")}
          />
        </Command.Group>

        {/* Group: Links */}
        <Command.Group
          heading="Links"
          className="[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:block"
        >
          {site.socials.github.url && (
            <CommandRow
              label="GitHub"
              hint="External"
              onSelect={() => handleAction(() => window.open(site.socials.github.url, "_blank"))}
            />
          )}
          {site.socials.linkedin.url && (
            <CommandRow
              label="LinkedIn"
              hint="External"
              onSelect={() => handleAction(() => window.open(site.socials.linkedin.url, "_blank"))}
            />
          )}
          <CommandRow
            label="Send email"
            hint={site.email}
            onSelect={() => handleAction(() => { window.location.href = `mailto:${site.email}`; })}
          />
          <CommandRow
            label="Copy email"
            hint="Clipboard"
            onSelect={() => handleAction(() => copy(site.email, "Email copied"))}
          />
          <CommandRow
            label="Resume (PDF)"
            hint="Download"
            onSelect={() => handleAction(() => {
              const a = document.createElement("a");
              a.href = site.assets.resume;
              a.download = "Chirag_Patil_Resume.pdf";
              a.click();
            })}
          />
        </Command.Group>

        {/* Group: Theme */}
        <Command.Group
          heading="Theme"
          className="[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:block"
        >
          <CommandRow
            label="Dark"
            hint={theme === "dark" ? "Active" : undefined}
            onSelect={() => handleAction(() => setTheme("dark"))}
          />
          <CommandRow
            label="Light"
            hint={theme === "light" ? "Active" : undefined}
            onSelect={() => handleAction(() => setTheme("light"))}
          />
          <CommandRow
            label="Blueprint"
            hint={theme === "blueprint" ? "Active" : undefined}
            onSelect={() => handleAction(() => setTheme("blueprint"))}
          />
        </Command.Group>

        {/* Group: Fun */}
        <Command.Group
          heading="Fun"
          className="[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:block"
        >
          <CommandRow
            label="Play the game"
            hint="Registration mini-game"
            onSelect={() => handleAction(() => openGame())}
          />
        </Command.Group>
      </Command.List>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[var(--line)] bg-[var(--muted)] flex items-center justify-between text-[11px] font-mono text-muted-foreground select-none">
        <span>↑↓ navigate · ↵ select · esc close</span>
        <span className="tabular-nums">⌘ K / /</span>
      </div>
    </Command.Dialog>
  );
}

function CommandRow({
  label,
  hint,
  onSelect,
}: {
  label: string;
  hint?: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      value={`${label} ${hint ?? ""}`}
      onSelect={onSelect}
      className="relative h-9 px-3 rounded-md flex items-center justify-between text-sm font-medium text-foreground cursor-pointer select-none transition-colors data-[selected=true]:bg-[var(--muted)] data-[selected=true]:text-foreground data-[selected=true]:before:content-[''] data-[selected=true]:before:absolute data-[selected=true]:before:left-0 data-[selected=true]:before:top-1.5 data-[selected=true]:before:bottom-1.5 data-[selected=true]:before:w-0.5 data-[selected=true]:before:bg-[var(--accent)] data-[selected=true]:before:rounded-full"
    >
      <span className="truncate">{label}</span>
      {hint && (
        <span className="font-mono text-xs text-muted-foreground ml-2 shrink-0">
          {hint}
        </span>
      )}
    </Command.Item>
  );
}
