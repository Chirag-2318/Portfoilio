"use client";

import * as React from "react";
import { PanelHeader } from "@/components/blueprint/PanelHeader";

export function AboutPanel() {
  const [greeting, setGreeting] = React.useState<string>("Hello.");

  React.useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good morning.");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good afternoon.");
    } else if (hour >= 17 && hour < 22) {
      setGreeting("Good evening.");
    } else {
      setGreeting("Good night.");
    }
  }, []);

  return (
    <div>
      <PanelHeader noBottomLine>
        <h2 className="text-3xl font-medium tracking-tight text-balance text-foreground min-h-[2.25rem]">
          {greeting}
        </h2>
      </PanelHeader>

      <div className="p-4 pt-2">
        <ul className="list-disc ps-3.5 space-y-2 text-sm text-foreground marker:text-muted-foreground leading-relaxed">
          <li>
            I&apos;m Chirag Patil, a developer from Pune studying Electronics and Telecommunication at PICT and Data Science at IIT Madras.
          </li>
          <li>
            Winner at COEP Inspiron, Top 7 at iQOO Hackathon, finalist at Barclays Hack-O-Hire, Tata Motors COEP MindSpark &apos;25 and PISB Techrush 2025.
          </li>
          <li>
            Barclays Summer Intern (upcoming), selected through Hack-O-Hire. I build Spring Boot and FastAPI backends and on-device Android apps.
          </li>
        </ul>
      </div>

      {/* Two 1px hairlines with a 16px gap between them (double rule ending the panel) */}
      <div className="relative pt-2" aria-hidden="true">
        <div className="w-full h-px bg-[var(--line)]" />
        <div className="w-full h-4" />
        <div className="w-full h-px bg-[var(--line)]" />
      </div>
    </div>
  );
}
