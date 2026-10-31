# Architectural & Design Decisions

This document logs decisions, trade-offs, and verification results across all implementation prompts.

## Prompt 1 — Scaffold, Docs, Content, Tokens, Fonts

1. **Scaffolding into Temporary Folder**:
   - `create-next-app` rejected `.`, `./Portfoilio`, and `./_tmp` because of npm package naming rules (no uppercase characters, no leading underscores).
   - Scaffolded into `./tmp-scaffold`, moved all files (including hidden/dotfiles) to the workspace root, deleted `tmp-scaffold`, and renamed package in `package.json` to `chirag-patil-portfolio`.

2. **Tailwind Version**:
   - Tailwind v4 (`^4`) installed with `@tailwindcss/turbopack`.
   - Used CSS-first token architecture in `src/app/globals.css`: `@import "tailwindcss"`, `@custom-variant dark`, and `@theme inline` mapping all design tokens, font variables, radii, and easings directly to CSS custom properties.

3. **IconSpace CLI Capability**:
   - Tested `npx iconspace --help`.
   - Result: Successful execution (version 0.1.1).
   - CLI command syntax:
     - `npx iconspace add <icon...>` (with options `-d, --dir <path>`, `-y, --yes`, `--no-install`)
     - `npx iconspace list`
     - `npx iconspace mcp`
   - Lucide-react remains the active fallback icon library for Prompts 1–6.

4. **Next.js Static Configuration**:
   - `next.config.ts` configured with `output: "export"`, `images: { unoptimized: true }`, `trailingSlash: true`, and `reactStrictMode: true`.

5. **Google Fonts Configuration**:
   - `Fraunces` configured with variable axes `["opsz", "SOFT", "WONK"]`, display `swap`.
   - `Instrument_Sans` configured with weights `["400", "500", "600"]`.
   - `JetBrains_Mono` configured with weights `["400", "500"]`.
   - All fonts exposed as CSS variables (`--font-fraunces`, `--font-instrument`, `--font-jetbrains`) on `<html>`.

6. **Content & Facts Integrity**:
   - Verified that `docs/PROJECT_CONTEXT.md` does not specify a city for IIT Madras.
   - Removed `place` field completely from both education entries in `src/content/site.ts` to strictly adhere to documented facts.

7. **Token Verification Page**:
   - Built `TokenShowcase` component displaying all 10 color swatches (with light/dark hex values), typography specimens (display, title-2xl, base, label), radii samples, hairline rules, interactive focus ring test, and a theme switcher using `next-themes`.
   - Mounted at `/` (temporary) and `/dev/tokens` (with `robots: { index: false, follow: false }`).
