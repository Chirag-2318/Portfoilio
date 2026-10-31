# DESIGN — "Second Pass"

## 1. Concept
The site is a finished printed page with its first draft hidden underneath. Chirag does the task (first pass) and then takes it further (second pass). Visual language: print production and type design (paper, ink, proof-red, crop marks, construction guides). It is a metaphor of craft, not of any project.

**Signature idea (one line):** on the home view a small circular lens follows the cursor and shows the FIRST PASS beneath the finished page (outlined letters with type-construction guides, a grey photo, an unfinished sentence); everywhere else the page is finished.

Everything else supports this quietly: crop marks, hairlines, a paper wipe between views, and headings that "resolve" from outline to filled ink on entry.

## 2. Principles
Calm over clever. Type first. One accent, used sparingly. Hairlines instead of shadows. Every motion has a job. The finished page must be complete and good without hover, without motion, without photo.

## 3. Sitemap and views (static routes, no long scroll)
- `/` Home — one viewport, no scroll (at viewport heights >= 640px).
- `/work` — three projects, master-detail (desktop) / accordion (mobile).
- `/about` — tabs: Profile, Education, Skills, Highlights (hash: #profile #education #skills #highlights).
- `/resume` — in-site resume sheet + PDF download (built in prompt 6; placeholder until then).
- `/contact` — email, copy, links (built in prompt 6; placeholder until then).
- `not-found` — "Page not in this proof."
Global chrome on every view: header (logo, nav, Pune clock, theme toggle, game icon slot, command-menu trigger), footer (desktop) / bottom tab bar (mobile), crop marks, page curtain.

### Home — desktop (>= 1024px), 12-col grid, fits 100dvh minus header/footer
- Left (cols 1–8): kicker (mono caps) / the name in two lines "Chirag" "Patil." (display, period in accent) / tagline "I do the task. Then I take it further." / intro line / two buttons ("See the work" primary, "Get in touch" outline) + small "Show first draft" toggle.
- Right (cols 9–12): portrait (4:5) above a ruled index list (NOW, BUILT, WON, STUDY, BASED, REACH).
- The lens (draft layer) works across the whole home stage.
### Home — mobile (< 768px)
Kicker + small portrait on one row; name large (two lines, ~27vw); tagline; intro; index list shows NOW, BUILT, WON, REACH only; buttons; bottom tab bar. Fits one screen at 390x844. Touch-drag moves the lens.

### Work
Title "Work" + one-line sub. Desktop: left list (cols 1–5) of 3 rows (index, title, meta); right panel (cols 6–12) with details of the selected project (summary, 3 bullets, stack chips, context). Mobile: accordion rows, one open at a time.
### About
Title "About" + tablist. Profile: paragraph + facts list (left), portrait (right). Education: two large ruled entries. Skills: 2x2 groups of inline dot-separated lists (no bars, no chips grid). Highlights: 5 ruled rows (label / title / detail).

## 4. Design tokens
### Colour (CSS variables; Tailwind names in brackets)
Light (paper):
- --paper #F3F0E8 [paper] page background
- --paper-2 #EAE6DB [paper-2] wells, curtain, hover fills
- --surface #FAF8F3 [surface] panels, dialogs
- --ink #15140F [ink] text
- --ink-2 #55514A [ink-2] secondary text (AA on paper)
- --ink-3 #7A756B [ink-3] decorative only (guides, crop marks), never body text
- --line #D8D3C6 [line] hairlines
- --line-strong #B9B3A4 [line-strong]
- --accent #C8321A [accent] proof-red (AA on paper)
- --accent-ink #FFFFFF [accent-ink]
Dark ("night proof", warm black, designed not inverted):
- --paper #12110E, --paper-2 #0C0B09, --surface #1A1914, --ink #EEEADF, --ink-2 #A9A395, --ink-3 #6F6A5F, --line #2C2A23, --line-strong #444137, --accent #FF6B4A, --accent-ink #12110E
Paper grain: a fixed, static SVG-noise overlay at 3.5% opacity (light) / 4.5% (dark), pointer-events none. No other textures. No gradients.
Accent is used ONLY for: the period in the name, the active-nav underline, the lens ring, focus rings, primary hover accents, selection tint, the game's plate.

### Type
- Display: Fraunces (variable; axes opsz, SOFT, WONK). Name: weight 500, opsz 144, SOFT 30, WONK 0, tracking -0.03em, line-height 0.86. View titles: weight 500, opsz 72.
- Text/UI: Instrument Sans 400/500/600.
- Labels/details: JetBrains Mono 400/500, uppercase, tracking 0.08em for labels.
Scale (size/line-height):
- 2xs 11/14 mono caps · xs 12/16 · sm 14/20 · base 16/24 · lg 18/26 · xl 24/30 (Fraunces for item titles) · 2xl clamp(2rem, 3.2vw + 0.5rem, 3.25rem)/1.02 (Fraunces, view titles) · display clamp(4rem, min(var(--name-vw), 25svh), 14rem)/0.86, where --name-vw = 27vw below 768px, 18vw at 768–1023px, 13.5vw at >= 1024px.
### Spacing (4px base)
4, 8, 12, 16, 24, 32, 48, 64, 96. Page margin: 20px mobile, 32px md, 40px lg+. Grid gutter: 16px mobile, 24px lg+. Max content width 1760px, centred.
### Radii / borders / strokes
Radius: sm 6px (chips, tags), md 10px (buttons, inputs, icon buttons), lg 16px (panels, dialogs), pill 999px. Border: 1px solid var(--line). Icon stroke 1.5px everywhere. Focus ring: 2px solid var(--accent), offset 3px.
### Breakpoints
sm 480, md 768, lg 1024, xl 1280, 2xl 1536. Header height 64px (>= md) / 56px (< md). Mobile tab bar 56px + safe-area inset. Footer 40px.
### Z-index
content 0 · lens ring 20 · header 30 · popovers 40 · command menu 50 · curtain 60 · game overlay 70.

## 5. Motion spec (Motion library; GSAP only if truly needed)
Easings: out-expo cubic-bezier(0.16,1,0.3,1) (default entrances/hover), in-out-quart cubic-bezier(0.76,0,0.24,1) (curtain, tabs). Spring: { type:"spring", stiffness:380, damping:34, mass:0.8 }. Lens spring: stiffness 420, damping 38.
Durations: hover/focus 160ms; small UI 260ms; entrance 600–700ms; curtain 360ms in / 380ms out.
Budget (nothing else animates):
1. First load of home (once per session, module-level flag): header fades 400ms; name lines translateY 24→0 + fade, 700ms out-expo, 90ms stagger, 150ms delay; index rows 450ms, 60ms stagger; then the lens auto-sweeps across the name once (r 0→110 in 200ms, travel 900ms in-out-quart, r→0 in 200ms) unless the user moves the pointer first.
2. View change: the page curtain (paper-2 panel, clip-path inset wipe from bottom to top, thin accent leading edge, mono label like "02 — Work") 360ms in, route change, 380ms out; then the new view's content enters (translateY 12→0, fade, 450ms, 60ms stagger). Repeat visits to home use a plain 300ms fade, not the long intro.
3. Hover/focus: 160ms colour/transform changes, no layout shift. Buttons translateY(-1px) on hover, scale(0.98) on press.
4. Headings "resolve": outline text with an ink fill revealed left to right, 700ms out-expo, on view entry.
5. Tab/selection indicators slide (layoutId) 260ms in-out-quart; panes crossfade + 8px shift 220ms.
6. The lens (signature). 7. Toast (copy confirmation) 200ms in, 1600ms hold, 200ms out.
prefers-reduced-motion: no curtain (instant route change), no auto-sweep, no entrances, no springs; opacity-only 120ms where a change must be visible; the lens follows the pointer without spring; the "Show first draft" toggle switches instantly.

## 6. The signature: the lens (spec)
- Home stage contains two stacked copies of the hero: FINAL (normal, interactive) and DRAFT (overlay, aria-hidden, inert, pointer-events none, opaque paper background, clipped with clip-path: circle(r at x y)).
- Draft differs only by paint (never layout): name = transparent fill + 1px --ink-3 text-stroke, plus construction guides (baseline, x-height, cap-height as 1px dashed --ink-3 lines with tiny mono labels at the left edge, and + registration ticks at the name corners); photo = grayscale + contrast, with a faint 1px dot grid overlay; body text colour --ink-2; tagline second sentence hidden and replaced by a mono note "// next: take it further"; accent period drawn as outline.
- Ring: 1px accent circle with 4 outward ticks (N,E,S,W, 6px) and a 10px mono label "1st pass" under it. Lens radius 120px (96px on touch). Over interactive elements (a, button, [role=button], input) it shrinks to 36px (200ms). Pointer down on empty stage: grows to 180px while held. Pointer leaves: radius to 0 in 200ms.
- "Show first draft" toggle (aria-pressed): expands the lens to cover the stage from its current centre (600ms in-out-quart) = whole view in draft; toggling back collapses. Also in the command menu.
- Touch: lens hidden until touch; drag moves it; the intro auto-sweep also demonstrates it.
- Reduced motion or no JS: the finished page only (plus the toggle works instantly).
- Resolve headings on other views are a quiet echo of the same idea.

## 7. Components
Shell: AppShell, Header, NavLinks, Clock, ThemeToggle, GameSlot, MobileTabs, Footer, CropMarks, Curtain/ViewTransitionProvider, CommandMenu, Toaster.
Motion primitives: Reveal, Stagger, ResolveText, RollText.
Views: HomeStage, LoupeProvider, LoupeRing, HeroContent, Portrait, IndexList, DraftToggle; WorkView, ProjectRow, ProjectDetail; AboutView, Tabs, ProfilePane, EducationPane, SkillsPane, HighlightsPane.
UI: Icon, Button, Chip, CopyButton, Kbd, ComingTogether, ViewFrame.
From Pixel Perfect (installed in prompt 7, only these): Flip Text Reveal (nav links and the email on the contact view), Inertia Arrow Card (magnetic arrow pill used for primary buttons and "next project"). Keep MIT notices. Until prompt 7, RollText (own CSS implementation) stands in. Do not use other Pixel Perfect components.
## 8. Icons
All icons through src/components/ui/Icon.tsx (name -> svg). Prompts 1–6: lucide-react under the hood (plus hand-written inline SVG for github, linkedin, and the registration mark). Prompt 7 swaps to IconSpace where the CLI works (npx iconspace add <name>), falling back to lucide. Icons needed: sun, moon, copy, check, arrow-up-right, arrow-right, github, linkedin, mail, phone, download, command/search, x, chevron-down, external, registration (custom: circle + crosshair + offset accent circle).

## 9. Command menu (Ctrl/Cmd+K; cmdk)
Groups and items: Go to: Home, Work, About, Education, Skills, Highlights, Resume, Contact. Projects: SAR Generator, ValidEDI, ARTHIX. Actions: Copy email, Send email, Toggle theme, Show first draft / Back to final (home only), Download resume (only if the PDF exists), Play Registration (game). Elsewhere: GitHub, LinkedIn (hidden when URLs are placeholders in production). Footer hint: "↑↓ navigate · ↵ select · esc close". Dialog: 560px, radius lg, surface, hairline border, scrim ink at 40%, no blur.

## 10. Resume view (prompt 6)
/resume: a paper "sheet" (HTML, built from site.ts, never hand-typed copy) at the left with sections: header, education, skills, projects (one line each), achievements; sheet scrolls inside itself if needed (<= 2 screens). Right: actions: Download PDF (href /Chirag_Patil_Resume.pdf, shown only if the file exists), Print. Mobile: sheet full width, actions pinned above it.
## 11. Contact (prompt 6)
No form. Large email address in Fraunces with Copy (toast "Copied") and "Write an email" (mailto:chirag23nzr@gmail.com?subject=Hello%20Chirag), phone as tel: link, location, GitHub/LinkedIn (hidden if placeholder), local Pune time.

## 12. Game — "Registration" (prompt 8)
Idea: a one-screen game of alignment, taken from print registration. Each "sheet" shows an outlined target shape in ink. Your accent-red plate (same shape) wanders; steer it onto the target and hold within tolerance for 1.0s to "print" it (plate snaps, stamp, sheet slides away, +1 print). Plate uses mix-blend-mode multiply, so overlap visibly darkens as you align.
- Rules: 3 sheets (lives). Each sheet has a timer (12s, shrinking 0.3s per print to a 7s minimum). Timer out = sheet spoiled, lose one. Tolerance starts 14px, shrinks 0.6px per print to 5px. Wander strength +4% per print. Shapes cycle: circle, square, triangle, ring, cross, rounded-rect, plus a glyph from the name's initials (C, P) as simple SVG paths.
- Controls: arrows/WASD accelerate the plate; pointer/touch drag moves the plate relative to drag start; P or Space pauses; Esc exits. On-screen Pause and Close buttons. Mobile: full-screen, safe-area padding, no page scroll behind.
- Visuals: full-screen paper background, crop marks, tokens only (works in both themes), HUD in mono: "Registration", sheets left (3 small rectangles), prints, best (localStorage in try/catch). No sound.
- Open/close: the registration icon in the header (or command menu "Play Registration") opens a lazily loaded overlay with a circular reveal from the icon (450ms); Esc/Close reverses it; focus trapped and restored. Reduced motion: fade; wander off, pointer/keys only. Single canvas 2D, DPR-aware, rAF loop paused when hidden. Never themed on projects.

## 13. Accessibility
Semantic landmarks (header, nav, main, footer), skip link, one h1 per view, visible focus everywhere, 44px touch targets, aria-pressed/expanded/selected where relevant, tablist keyboard model (arrows, Home/End), roving focus in the project list, aria-live toast, lens overlay aria-hidden+inert, AA contrast in both themes, alt text for the photo ("Portrait of Chirag Patil"), no content only in the lens, reduced-motion respected.
## 14. SEO
Title "Chirag Patil — Developer in Pune", meta description from facts, Open Graph + Twitter cards with a generated OG image (opengraph-image.tsx, static), favicon + app icons, sitemap.ts + robots.ts (force-static), JSON-LD Person (name, jobTitle "Student and software developer", address Pune, email, sameUrl from non-placeholder socials, alumniOf PICT and IIT Madras). Canonical from site.url.
## 15. Deploy (Vercel)
Static export (`output: "export"`), no env vars. Import repo on Vercel: framework Next.js, defaults. README documents the three hand-supplied items.
## 16. Placeholders that later prompts replace
Resume and Contact views (prompt 6), GameSlot popover "arriving soon" (prompt 8), RollText and button hover (prompt 7), lucide icons (prompt 7), temporary /dev/tokens page (removed in prompt 10).
## 17. Copy rules
Short lines. Plain, warm, first person. No exclamation marks, no buzzwords, no emojis. All copy lives in src/content/site.ts.
