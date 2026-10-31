# Blueprint Grid — Redesign Specification

## CONCEPT
"Blueprint Grid": one scrolling page designed like a technical drawing. A single centred column, max width 768px (Tailwind max-w-3xl) on desktop, bounded on the left and right by 1px vertical hairlines that run the full page height. Horizontal hairlines (1px) cross the entire viewport width at section boundaries and extend past the column edges to the screen edges. Between sections there are 32px hatched "stripe" bands (diagonal hairline hatching) also running full-bleed. Technical "dimension" annotations (tiny mono numbers with extension lines) mark the column width (768), the avatar diameter (Ø160), the stripe height (32) and an angle (30°). Small handwritten notes with hand-drawn arrows sit in the empty margins beside the column on wide screens. Everything is calm, monochrome, precise, with mono type for details and a medium-weight sans for headings. No scroll-jacking and no heavy animation.

## COLOUR TOKENS (CSS variables; dark is the primary theme and default; light must be equally refined)
Dark:
- `--background`: `#09090b`
- `--foreground`: `#fafafa`
- `--muted-foreground`: `#a1a1aa`
- `--muted`: `#18181b`
- `--border`: `#27272a`
- `--line`: `#1c1c1f` (hairlines)
- `--line-strong`: `#2a2a2f`
- `--dimension`: `#3a3a40`
- `--dimension-foreground`: `#6b6b75`
- `--accent-muted`: `rgba(255,255,255,0.03)` (row hover)
- `--info`: `#3b82f6` (status dot, dimension highlights)
- `--ring`: `rgba(250,250,250,0.35)`

Light:
- `--background`: `#ffffff`
- `--foreground`: `#09090b`
- `--muted-foreground`: `#71717a`
- `--muted`: `#f4f4f5`
- `--border`: `#e4e4e7`
- `--line`: `#ececef`
- `--line-strong`: `#dcdce0`
- `--dimension`: `#d4d4d8`
- `--dimension-foreground`: `#a1a1aa`
- `--accent-muted`: `rgba(0,0,0,0.03)`
- `--info`: `#2563eb`
- `--ring`: `rgba(9,9,11,0.3)`

Theme: class-based (html.dark / html.light), default dark, respects system on first visit, stored in localStorage (try/catch), no flash on load (inline script in head). Theme toggle swaps with a short crossfade (View Transitions API if available; else instant).

## TYPOGRAPHY
- Sans (headings and body): Geist Sans via the "geist" npm package (`GeistSans.variable`).
- Mono (details, meta, kbd, dates, tags): Geist Mono via the "geist" npm package (`GeistMono.variable`).
- Handwritten notes: Caveat (`next/font/google`), weight 500, rotated -6deg, text-xl/none, muted colour. No other fonts.
- Scale:
  - h1 (name): 2rem/1 (32px), weight 500, tracking-tight.
  - Panel title: 1.875rem (text-3xl), weight 500, tracking-tight, text-balance.
  - Item titles: 1.25rem/1.5rem weight 500 (experience) or base weight 500 (lists).
  - Body: text-sm (0.875rem) line-height 1.6, colour foreground; list markers muted.
  - Meta/mono: text-sm for overview rows, text-xs for tags, dimension values and kbd.
  - Section eyebrow labels (like "IN NUMBERS"): text-sm/none, weight 500, tracking-wide, uppercase, muted, centred.
- Font features: antialiased, tabular-nums for times and numbers.

## LAYOUT METRICS
- Page wrapper: relative isolate. Main has px-2 (8px side gutters on small screens); column is mx-auto md:max-w-3xl.
- `--header-height`: 3.5rem (56px). `--separator-height`: 2rem (32px).
- Every panel (section) is a `<section>` with border-x (1px `var(--line)`), and "screen lines": a 1px horizontal hairline at its top and bottom that spans the full viewport width (implemented as utilities `.screen-line-top` / `.screen-line-bottom` using a `::before` / `::after` with `position:absolute; left:50%; width:100vw; transform:translateX(-50%); height:1px; background:var(--line); pointer-events:none`). Adjacent panels must not double the line (`.screen-line-top-none` / `.screen-line-bottom-none`).
- Panel header: screen-line-bottom, px-4, contains the panel title. Panel body: p-4 (or px-4 with internal rows separated by 1px `var(--line)` lines).
- Stripe divider (`.stripe-divider`): height 32px, border-x `var(--line)`, background repeating diagonal hatching: `repeating-linear-gradient(315deg, var(--line) 0, var(--line) 1px, transparent 0, transparent 50%)` with `background-size: 6px 6px`, extended full-bleed to the viewport edges via a pseudo-element 100vw wide, with the same hatching.
- Dimension component: absolutely positioned, pointer-events-none, select-none, colour `var(--dimension)`; extension lines are 1px; the dimension line has a centred mono text-xs value in `var(--dimension-foreground)` with px-1 background-matched gap. Variants: horizontal (above hero, value "768", spans the column width, hidden below 49rem), vertical (left of avatar, value "Ø160", hidden below lg), vertical on the stripe (value "32", to the right of the column, hidden below lg), angle label "30°" with a small arc in the hero drawing.
- Handwritten notes: absolute, hidden below xl (1280px); sit outside the column (left-full or right-full with margin), width ~9rem, with a hand-drawn SVG arrow pointing at the related element.
- Mobile (<640px): the column becomes full width inside the 8px gutters; keep side hairlines; hide dimensions and handwritten notes; hero shrinks (320px).
- Scroll: single page with anchored sections; use scroll-margin-top = header height + separator height so anchored panels land correctly. Smooth scrolling honours prefers-reduced-motion.

## COMPONENT SPECS
- **IconTile**: 24px square (size-6), rounded-md, 1px border muted-foreground/15, bg `var(--muted)`, icon colour muted-foreground, centred, ring-1 ring-inset foreground/5 (very subtle), select-none. Used in overview rows, project rows, experience positions, achievements.
- **Link (`.link`)**: inherits colour, underline with decoration `var(--border)`, underline-offset 4px, decoration-thickness 1px; on hover the decoration colour becomes foreground; transition 150ms.
- **Tag/pill**: inline-flex, rounded-full, 1px border, px-1.5 py-0.5, font-mono text-xs, muted-foreground, bg zinc-50 in light and zinc-900 (#18181b) in dark.
- **Buttons (icon)**: size-8, rounded-[10px], transparent, muted-foreground; hover bg `var(--muted)` and foreground; active scale .98; focus-visible ring 3px `var(--ring)`. Bordered variant for social buttons: 1px border `var(--border)`, rounded-lg, size-8, same hover.
- **Kbd**: h-5, px-1, rounded-sm, font-sans text-sm/none, muted-foreground, bg black/5 (light) or white/10 (dark), inset 1px shadow.
- **Status dot ("current/upcoming")**: 6px dot `var(--info)` inside a 10px ping ring (animate-ping, opacity .5), disabled under reduced motion.
- **Collapsible**: height animates 200ms ease-out; chevron rotates 180deg; keyboard accessible; aria-expanded.
- **Copy button**: appears on row hover/focus (opacity 0 -> 1, translate-x -10px -> 0, 150ms ease-out; always visible on coarse pointers); icon crossfades copy -> check with blur-in (opacity, blur 4px -> 0, scale .9 -> 1, 200ms) for 1.5s.
- **Text entrance (hero only)**: opacity 0, blur 4px, y 4px -> opacity 1, blur 0, y 0; 400ms ease-out; 60ms stagger. Everything else enters without animation. All motion disabled under prefers-reduced-motion.

## HEADER
Sticky top-0 z-50, height 56px, bg `var(--background)`, px-2 pt-1. Inner bar: mx-auto md:max-w-3xl, h-full, flex items-center gap-2 sm:gap-4, border-x `var(--line)`, pl-4 pr-2, with screen-line-top and screen-line-bottom hairlines. Left: logo mark (original 28px "CP" monogram built from square pixel blocks, currentColor, links to #top). Then flex-1 spacer. Nav (hidden below sm): text-sm font-medium tracking-wide, muted-foreground, hover/current foreground, gap-4, items: Experience, Projects, Education, Resume (anchor links; the current section is highlighted via IntersectionObserver). Then a 1px x 20px vertical separator (hidden below sm). Then a "Search…" ghost button (h-8, px-1.5, rounded-[10px], muted-foreground) with the kbd group showing "⌘ K" on macOS and "Ctrl K" elsewhere (md and up; on mobile only the search icon). Then a gamepad icon button (opens the game overlay, see Prompt 2), then the theme toggle (half-filled circle icon).

## HERO (the signature)
Container: inside the column, border-x, a CSS grid grid-cols-[auto_1fr] grid-rows-[1fr_auto], overflow-y clip, screen-line-bottom. Desktop height 500px; on mobile 320px. Preceded (desktop only, above the hero) by a 32px tall strip with the horizontal "768" dimension line.
Background: an original isometric blueprint drawing (SVG, viewBox 768x500, preserveAspectRatio xMidYMid slice) filling the hero: a monogram "CP" built from extruded isometric slabs on 30-degree axes. Strokes 1px `var(--line-strong)`; the top faces filled with fine 45-degree hatching (SVG pattern, 1px lines every 4px, opacity .55); two very long faint construction diagonals crossing the hero corner to corner and running beyond the column to the screen edges; a "30°" angle label with a small arc at one slab corner. The drawing sits behind everything (z-0) at low contrast.
Cursor follow: render a second copy of the drawing on top with stroke `var(--foreground)` at ~.55 opacity, masked by a radial gradient (`radial-gradient(180px circle at var(--mx) var(--my), black, transparent)`) so only the area near the pointer lights up. Update `--mx` / `--my` on pointermove using requestAnimationFrame; fade the mask out (opacity transition 300ms) on pointerleave; disabled on coarse pointers and reduced motion.
Click: clicking anywhere on the hero plays a very soft short "tick" (Web Audio API, a 40ms sine blip around 520-640Hz, gain 0.04, generated in code, no audio files). A small speaker icon button next to the name toggles sound on/off (persist in localStorage with try/catch, default on, plays only on explicit click).
Handwritten note (right side, outside the column, bottom-20): "follows your cursor" / "click for a sound" with a small curved arrow pointing into the hero.
Avatar block (left grid cell, bottom aligned): a circle size-30 (120px) < 384px wide, size-32 (128px) up to sm, size-40 (160px) from sm; image `/images/chirag.jpg`, object-cover, rendered grayscale with slightly raised contrast in dark mode; a 1px inset ring (foreground/20 in dark); the avatar sits on a hairline: its wrapper has screen-line-top and border-r `var(--line)`, and -mx-px alignment so the circle overlaps the column line. Vertical "Ø160" dimension to its left (desktop). If the image is missing or fails to load, render a muted circle with the mono monogram "CP" so the layout never breaks.
Name block (right grid cell, bottom aligned): row 1 has border-t `var(--line)`, pl-4, flex items-center gap-2: the h1 "Chirag Patil" (2rem/1, weight 500, tracking-tight) and the speaker icon button. Row 2 has border-t `var(--line)`, h-12.5 on mobile and h-9 on sm+, py-1 pl-4: one mono text-sm text-balance muted-foreground tagline: "Backend and Android developer. Hackathon winner." (text only, entering with the blur-in). 
Below the hero: a 32px stripe divider with the vertical "32" dimension on the right.

## OVERVIEW PANEL (sr-only h2 "Overview")
Panel body p-4, grid gap-x-4 gap-y-2.5, sm:grid-cols-2, with a 1px dashed vertical line `var(--line)` centred between the two columns (sm and up). Rows are flex items-center gap-4 font-mono text-sm, each with an IconTile:
1. (spans both columns) briefcase icon: "Summer Intern @ Barclays (upcoming)" where "Barclays" is a `.link` to the experience anchor (`#experience`).
2. map-pin icon: "Pune, Maharashtra, India" (link to a maps search).
3. clock icon: live local time in Asia/Kolkata formatted hh:mm AM/PM, tabular-nums, updates each second without layout shift, followed by a muted "// same time zone" or "// Xh ahead/behind" computed from the visitor's own time zone.
4. mail icon: `chirag23nzr@gmail.com` as a `.link` (mailto) with a hover-revealed copy button.
5. phone icon: `+91 8080645366` as a `.link` (tel) with a hover-revealed copy button.
6. graduation-cap icon: "B.Tech E&TC at PICT + B.Sc at IIT Madras".

Then a "Social links" panel (sr-only h2), screen lines suppressed against neighbours, p-4, a flex-wrap gap-2 list of bordered icon buttons (GitHub, LinkedIn; URLs from config; render a button only if its URL is set, otherwise skip it). Handwritten note "follow me" with an arrow on the left outside the column (xl and up).

## ABOUT PANEL
Panel header: the title is a time-aware greeting (Good morning/afternoon/evening/night from the visitor's local time, resolved on the client after hydration without layout shift) in panel-title style. Body p-4: a bulleted list (text-sm, muted bullets, ps-3.5), three bullets built only from resume facts:
- "I'm Chirag Patil, a developer from Pune studying Electronics and Telecommunication at PICT and Data Science at IIT Madras."
- "Winner at COEP Inspiron, Top 7 at iQOO Hackathon, finalist at Barclays Hack-O-Hire, Tata Motors COEP MindSpark '25 and PISB Techrush 2025."
- "Barclays Summer Intern (upcoming), selected through Hack-O-Hire. I build Spring Boot and FastAPI backends and on-device Android apps."
Below the body: two 1px hairlines with a 16px gap between them (the "double rule" ending the panel).

## REFERENCE MAP (what was taken from each inspiration site)
- **chanhdai.com**: the whole structure above (column, hairlines, stripes, dimensions, hero, overview rows, panels, command palette, handwritten notes, collapsibles, dotted-leader numbers, grid lists, footer feel).
- **abhi.at**: the small bordered action chips with an icon (GitHub, Email), the compact pill-shaped dark/light toggle feel, the live clock idea, the calm one-page rhythm.
- **ramx.in**: compact lists with "Show all" pill buttons, the Ctrl+K search pill in the header, concise resume access.
- **vanshnagar.com**: the small floating utility buttons at the bottom right (scroll to top) and the optional playable game opened from a tiny header icon.
- **pixel-perfect.space / iconspace.dev**: small crafted micro-interactions and icons (use sparingly, matching the monochrome palette).

## ORIGINALITY PASS (Signature Identity Overhaul)
The site's underlying skeleton retains the narrow centered column (max-w-3xl), full-bleed hairlines, and technical drafting aesthetic, but introduces 11 signature details that make it unmistakably Chirag Patil's personal portfolio.

### 1. Redline Accent Colour
Introduces `--accent` and `--accent-foreground` tokens:
- **Dark theme**: `--accent: #ff5a2c` (warm cadmium redline)
- **Light theme**: `--accent: #e8441a` (deep drafting red)
- **Blueprint theme**: `--accent: #ffd166` (drafting amber/gold)

**Strict Usage Boundaries**:
The accent colour is used exclusively for:
1. Text selection background (`rgba(accent, 0.25)`).
2. Keyboard `:focus-visible` outline rings.
3. Active navigation item underline (2px height, offset 6px).
4. Link hover underline decoration.
5. Status dot core & pulsing ping ring (Experience upcoming indicator).
6. Hero CAD crosshairs & coordinates readout balloon.
7. Dropped callout pin balloons and leader lines.
8. Handwritten notes and hand-drawn SVG indicator arrows.
9. Scroll ruler active progress triangle marker.
10. Command palette (`cmdk`) active item 2px left indicator bar.
11. Inline game target highlights and timer countdown line.
*Accent colour is never used for body typography or large decorative fills.*

### 2. Serif Display Type
Added **Instrument Serif** (`Instrument_Serif` via `next/font/google`, regular and italic, weight 400).
- **Hero H1 name**: 3.25rem/1 (sm+) and 2.5rem/1 (mobile), tracking `-0.01em`, weight 400.
- **Panel Titles**: 2.25rem/1.05, weight 400, tracking `-0.005em`, text-balance.
- **Greeting Heading**: Instrument Serif with the final word in italic (e.g., *"Good afternoon"*).
- **Game Headings**: Title and overlay headings in Instrument Serif.
- *Geist Sans and Geist Mono are retained for all body text, metadata, labels, and code.*

### 3. Engineer's Ruler Dividers
Replaced 32px diagonal hatch stripes with a precision 32px engineer's ruler band:
- 1px baseline along bottom edge (`var(--line-strong)`).
- Minor ticks every 8px (6px tall), mid ticks every 40px (10px tall), and major ticks every 80px (14px tall) in `var(--dimension)`.
- Full-bleed outer gradient (`repeating-linear-gradient`) spanning 100vw beyond the column.
- Centered inline SVG ruler inside column measuring 0 to 768 with tiny 9px mono numerals at each 80px interval.

### 4. Registration Marks (`RegMark.tsx`)
At hairline intersection junctions where the 768px vertical column boundaries intersect panel horizontal hairlines, 9px crosshairs with a centered 5px circle in `var(--dimension)` are rendered:
- Positioned absolutely at top-left, top-right, bottom-left, and bottom-right.
- Automatically suppressed on adjoining boundaries to prevent duplicate stacking.
- Hidden below 640px (sm) where the column edges align with the viewport margins.

### 5. Square ID-Frame Avatar with Crop Marks
Replaced circular avatar badge with a precision square portrait:
- 160px × 160px square tile (128px on mobile), `rounded-[4px]`.
- Grayscale contrast-105 filtering with 1px inset ring (`foreground/20`).
- Four L-shaped drafting crop marks (10px arms, 1px `foreground/60`, 6px gap from tile corners).
- Horizontal dimension annotation `"160 × 160"` centered below tile.

### 6. Hero CAD Crosshairs, Callout Pins & Drawing Block
- **Interactive Crosshairs**: Moving fine pointers inside the hero draws 1px accent horizontal and vertical hair crosshairs with an 80ms smoothed lag and live coordinate badge (`"x 412  y 188"`).
- **Callout Pins**: Clicking within the hero drops numbered callout pin balloons (1 through 5, 6th click clears pins) with leader lines.
- **Web Audio Blip**: Dropping pins triggers a synthesized 40ms sine blip (520Hz to 640Hz rising, gain 0.03), accompanied by a toggleable sound icon button with persistent state.
- **Desktop Title Block**: Lower-right drafting title block detailing:
  - `DRAWN BY`: `C.P.`
  - `SHEET`: `01 OF 01`
  - `REV`: `2026`
  - `SCALE`: `1:1`
- **Handwritten Redline**: Accent handwritten note `"measure me, click to pin"` with SVG arrow.

### 7. Bill of Materials Panel
Replaced dotted leader numbers with a formal technical drawing Bill of Materials:
- Panel Title: *"Bill of materials"* (Instrument Serif).
- Header row: `NO.` (mono 3ch), `ITEM`, `QTY` (right-aligned mono).
- Items (strict facts from context):
  - `01`: Hackathon wins / `1`
  - `02`: Hackathon finals reached / `3`
  - `03`: Validation rules built (ValidEDI) / `50+`
  - `04`: Relational entities modelled (SAR Generator) / `15+`

### 8. Sheet Indexing & Left Gutter Scroll Ruler
- **Sheet Numbers**: Every panel header features a right-aligned mono sheet indicator (`SHEET 01 / 09` through `SHEET 09 / 09`).
- **Project Indexing**: Project rows prefixed with mono index badges (`P-01`, `P-02`, `P-03`).
- **Vertical Scroll Ruler (`ScrollRuler.tsx`)**: Fixed in left gutter at 1280px+ viewports:
  - 24px tick marks with height proportional to page height.
  - Accent triangle marker tracking active scroll percentage.
  - Mono active section name label indicator.

### 9. Header Breadcrumb & Redline Annotations
- **Header Breadcrumb**: Logo accompanied by dynamic `"/ [activeSection]"` breadcrumb (hidden <640px) that triggers the command palette on click.
- **Handwritten Redline Notes**: All Caveat notes switched to accent color with 90% opacity, -5° rotation, and 1.5px stroke accent SVG arrows:
  - Hero: `"measure me, click to pin"`
  - Socials: `"find me here"`
  - Contact: `"say hi"`

### 10. Third Theme: "Blueprint"
Added a full third theme alongside Dark and Light, cycling Dark → Light → Blueprint → Dark via `ThemeToggle` (Moon, Sun, Set-Square icons):
- `--background`: `#0a2b5c` (classic cyanotype blueprint blue)
- `--foreground`: `#eaf2ff` (crisp white ink)
- `--muted-foreground`: `#9db8e0` (soft cobalt tone)
- `--muted`: `#0f3470`
- `--border`: `#2a5190`
- `--line`: `#1d437f`
- `--line-strong`: `#2f5ea8`
- `--dimension`: `#3a6bb5`
- `--dimension-foreground`: `#8ab4f8`
- `--accent`: `#ffd166` (drafting yellow-gold)
- Fully supported in inline anti-flash script and cmdk theme selection.

### 11. Greeting as a Technical Cover Note
- About section greets visitor with time-aware greeting title (Instrument Serif with italicized final word and a self-drawing SVG accent underline).
- Narrative formatted as concise technical cover bullets:
  - `"Hello. I'm Chirag, a developer from Pune."`
  - Dual-degree education details (PICT + IIT Madras).
  - Hackathon finalist and winner accolades.
  - Upcoming Barclays internship role and primary stack expertise.

---

## CALM PASS (Supersedes Earlier Decisions)

Following an architectural review to eliminate visual anxiety, reduce grid clutter, and remove blue cast in dark mode, the following design decisions supersede previous sections:

### 1. Theme Fix: Neutral Dark & Pure Light (Blueprint Theme Removed)
- **Two Themes Only**: `dark` and `light`. Default theme is strictly `dark` regardless of system settings on first visit.
- **Blueprint Theme Removed**: Completely excised from CSS variables, theme toggle cycle, command palette, and documentation.
- **Stale State Sanitization**: Inline anti-flash script and NextThemes provider safely overwrite any legacy `"blueprint"` localStorage values to `"dark"`.
- **Pure Neutral Dark Mode**:
  - `--background`: `#09090b` (pure neutral near-black, zero blue tint)
  - `--foreground`: `#fafafa`
  - `--line-soft`: `#141417`
  - `--line`: `#1c1c1f`
  - `--line-strong`: `#27272a`
  - Light mode: `--background`: `#ffffff`, `--line-soft`: `#f0f0f2`, `--line`: `#e4e4e7`.

### 2. Grid Clutter Reduction & Line Softening
- **No Full-Bleed Lines**: `.screen-line-top` and `.screen-line-bottom` now span strictly the column width (max 768px). All `100vw` pseudo-elements and bleed bands are eliminated.
- **Softened Side Rails**: Column side borders updated from `--line` to `--line-soft` (`#141417` dark / `#f0f0f2` light), providing a subtle visual rail instead of an architectural cage.
- **Section Dividers**: Replaced all hatched full-bleed ruler dividers with a clean 40px gap (`h-10`, `border-x border-[var(--line-soft)]`, transparent background).
- **Registration Marks Removed**: Deleted all `RegMark` corner crosshairs and related CSS.
- **Left Scroll Ruler Removed**: Deleted `ScrollRuler.tsx` and unmounted it from `AppShell`.
- **Dimensions Removed**: Removed all technical dimension text (`768`, `Ø160`, `32`, `30°`) and extension lines across the site.
- **Avatar Badge Cleaned**: Removed technical cross-lines and `"160 x 160"` dimension label; placeholder is a clean muted square with mono "CP".
- **Internal Spacing & Layout Breathing Room**:
  - Panel headers: `px-5 py-5`.
  - Panel bodies: `p-5 sm:p-6`.
  - List rows: `py-4 px-5`.
  - Overview panel: removed dashed vertical divider, expanded grid spacing to `gap-x-8 gap-y-4`.
  - Projects panel: replaced hatched index tiles with plain mono text `P-01`, `P-02`, `P-03` in `--muted-foreground`.
  - Sheet tags: dimmed to 60% opacity (`opacity-60`).

### 3. Hero Artwork: "Construction Sheet Monogram"
- **Clean 2D Vector Drafting**: Replaced the 3D isometric slab block drawing with `ConstructionMonogram.tsx` in a 768x400 viewBox.
- **Precise Geometry**:
  - Letter **C**: arc with outer radius $R = 100$, inner radius $r = 76$ (stroke width 24), open mouth at 30°.
  - Letter **P**: vertical stem (stroke width 24) spanning $y = 90$ to $y = 290$, semicircular bowl with radius $r = 56$ matching C's cap height.
  - Centered horizontally at $x = 384$ via $+4\text{px}$ alignment shift.
  - Underlying construction lines in 1px `var(--line-strong)`: tangents, concentric reference circles, center marks, and exactly two callout labels (`R = 100`, `r = 56`).
- **Placement & Animation**:
  - Placed in the upper hero zone (`bottom-[148px] sm:bottom-[160px]`), ensuring $>32\text{px}$ breathing room above the avatar and name block.
  - 1.8s draw-in animation with traveling pen tips, settling at 45% opacity, interactive hover brightening to 80%.
  - Reduced hero height: `h-[340px] sm:h-[440px]`.

### 4. Rotating Humour Tagline
- Replaced static hero tagline with `RotatingTagline.tsx`.
- Cycles 10 developer humour taglines every 4.5 seconds with a smooth blur and fade transition.
- **Zero Layout Shift**: Invisible CSS grid stacking reserves the exact height of the longest tagline (`col-start-1 row-start-1 invisible`).
- **Accessibility & Controls**: Pauses rotation on mouse hover, keyboard `focus-within`, and when browser tab is inactive (`visibilitychange`). Provides an `sr-only` description and static single line on `prefers-reduced-motion`.

### 5. "The Numbers" Strip
- Replaced the "Bill of Materials" table with a clean 4-column strip (`NumbersPanel.tsx`).
- Responsive: 4 columns on desktop, 2 columns below 640px.
- Features large Instrument Serif numerals (`3.5rem` desktop, `2.75rem` mobile) that smoothly count up from 0 on viewport intersection over 700ms.
- 4 resume facts:
  1. `1` — Hackathon win
  2. `3` — Hackathon finals
  3. `3` — Hackathon projects built
  4. `2` — Degrees in progress

### 6. Tag Contrast & Experience Entry Clean-up
- **WCAG AA Compliance**: Updated `.blueprint-tag` and `.tag-badge` styles:
  - Light mode: bg `#f4f4f5`, text `#52525b`, border `#e4e4e7` (contrast ratio $> 5:1$).
  - Dark mode: bg `#18181b`, text `#a1a1aa`, border `#27272a` (contrast ratio $> 5:1$).
- **Experience Entry De-clutter**: Under Barclays "Summer Intern", removed redundant pill badges ("Hack-O-Hire", "Internship"). Kept only the company title, "Upcoming" status dot, and single bullet point fact.

---

## Polish Pass 3 (Tighter Hero, Mosaic Reveals, Project Covers, Activity Calendar, Compact Chips, Note Alignment, FrameCell)

Documenting the refinements implemented in Polish Pass 3:

### 1. Removal of "The Numbers" & Automatic Sheet Renumbering
- **Deleted**: `NumbersPanel.tsx` removed from DOM; command menu entry `#numbers` removed.
- **Dynamic Context**: Created `SheetContext.tsx` with `<SheetProvider>` and `useSheet(panelId)`.
- Automatically renumbers panels based on active mounting state (e.g., handles conditional mounting of the GitHub activity panel).
- Renumbered from `SHEET 01 / 08` through `SHEET 08 / 08` cleanly without hardcoded strings.
- Exactly one 40px `StripeDivider` retained between About and Experience.

### 2. Tighter Hero (40% Gap Reduction with Letter Geometry Preserved)
- **Monogram Letters Bounding Box**: Kept unchanged within $<0.01\text{px}$ tolerance:
  - 1440px desktop: $151.18\text{px} \times 105.00\text{px}$ (baseline: $151.19\text{px} \times 105.00\text{px}$).
  - 390px mobile: $100.79\text{px} \times 70.00\text{px}$ (baseline: $100.79\text{px} \times 70.00\text{px}$).
- **Gap A (Header bottom to top of monogram letters)**:
  - 1440px: Reduced from $82.25\text{px}$ to $49.35\text{px}$ (exact $40\%$ reduction, $A' = 0.6A$).
  - 390px: Reduced from $57.50\text{px}$ to $34.50\text{px}$ (exact $40\%$ reduction, $A' = 0.6A$).
- **Gap B (Bottom of monogram letters to top of name/avatar row)**:
  - 1440px: Reduced from $68.75\text{px}$ to $41.25\text{px}$ (exact $40\%$ reduction, $B' = 0.6B$).
  - 390px: Reduced from $64.50\text{px}$ to $38.69\text{px}$ (exact $40\%$ reduction, $B' = 0.6B$).
- **Hero Height**:
  - 1440px: Reduced by $(32.90 + 27.50) = 60.40\text{px}$ from $440.00\text{px}$ to $379.60\text{px}$.
  - 390px: Reduced by $(23.00 + 25.80) = 48.80\text{px}$ from $340.00\text{px}$ to $291.20\text{px}$.

### 3. MosaicReveal Component
- **Component**: `src/components/ui/MosaicReveal.tsx`.
- **Canvas-Based Reveal**: Subdivides image into an $8 \times 8$ grid of cells; animates with GSAP `scale: 0`, `opacity: 0` to full visibility with subtle rotation and randomized stagger.
- **Trigger**: Triggers at $35\%$ viewport intersection via IntersectionObserver (or on mount if already in view).
- **Interactivity & A11y**: Click-to-replay animation; instant reveal on `prefers-reduced-motion`; zero-flash preload phase; accessible `role="img"` with descriptive `aria-label`.
- **Applied to**: Avatar portrait (`AvatarBadge.tsx`) and featured Project covers (`ProjectsPanel.tsx`).

### 4. Projects Panel Upgrade
- **Category Filter Pills**: Interactive filter pills ("All", "Backend", "Android") with Framer Motion `layoutId="project-filter-pill"` animated sliding indicator.
- **Original Vector Cover Art**: Created technical blueprint SVGs (`sar-generator.svg`, `validedi.svg`, `arthix.svg`) stored in `/public/projects/`.
- **Live GitHub Star Counts**: Client-side fetch with 30-minute sessionStorage caching; displays star pill when repository exists.
- **Conditional Action Buttons**: "Source", "Live", and "Case Study" action buttons appear only when links are defined; hides cleanly when `null`.
- **Compact Tech Chips**: Integrated `TechChip` (size `sm`) displaying authentic brand icons.

### 5. GitHub Contributions / Activity Panel
- **Component**: `src/components/blueprint/ContributionsPanel.tsx`.
- **Conditional Visibility**: Only mounts when `site.links.githubUsername` is a non-null valid string; hides with zero residual gap or layout jump when null.
- **Calendar Matrix**: 7 rows $\times$ 53 columns rendering contribution intensity levels 0–4 (level 4 uses accent token `#ff5a2c` / `#e8441a`).
- **Interactive Tooltip**: Solid floating popover on hover/focus displaying date and contribution count; supports keyboard roving tabindex (`ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`, `Home`, `End`).
- **Entrance Animation**: Smooth column-by-column staggered fade.

### 6. Compact TechChips & Stack Panel Height Reduction
- **Component**: `src/components/tech/TechChip.tsx` replacing previous large tiles.
- **Design**: Rounded-[6px] compact pill with dashed hairline border, brand icon via Iconify, and crisp mono/sans typography. Available in `sm` ($28\text{px}$) and `md` ($32\text{px}$).
- **Stack Panel Height**:
  - Baseline height: $504.30\text{px}$.
  - Polish Pass 3 height: $309.80\text{px}$.
  - Reduction: $38.57\%$ ($\ge 35\%$ required target of $\le 327.79\text{px}$).

### 7. Precise Note Alignment
- **"Find Me Here" Note**:
  - Arrow tip positioned exactly $8\text{px}$ to the left of the first social button.
  - Vertically aligned with the button midline ($Y_{\text{tip}} \in [Y_{\text{top}}, Y_{\text{bottom}}]$).
- **"Say Hi" Note**:
  - Arrow tip positioned exactly $8\text{px}$ to the left of the email action block.
  - Vertically aligned with the email block midline.
- **Responsive Display**: Hidden below $1280\text{px}$ (`hidden xl:flex`) to eliminate overlap on tablet and mobile viewports.

### 8. FrameCell Pattern
- **Component**: `src/components/ui/FrameCell.tsx`.
- **Design**: Repeating $45^\circ$ diagonal linear hatch lines (`var(--pattern-fg)`) faded with an organic radial edge mask.
- **Strict Usage**: Used strictly in two designated locations:
  1. Contact CTA framing (`py-10 px-4 sm:px-6`).
  2. 404 Not Found inline game frame (`p-2 sm:p-3`).

---

## Interface Sound System (Curated & Restrained)

Documenting the subtle audio system implemented in Prompt 9:

### 1. Engine & Foundation
- **Package**: `@web-kits/audio` providing Web Audio synthesis via custom synthesized patches (sine, triangle, filtered noise).
- **Component**: `src/components/sound/sound-effects.tsx` exporting `<SoundEffects>`, `<SoundToggle>`, `playSound()`, `useSoundMuted()`, `isSoundMuted()`, `setSoundMuted()`.
- **Global Storage**: Centralized in `localStorage`:
  - `cp-sound-muted`: `"1"` for muted, `"0"` for active.
  - `cp-sound-volume`: float string, default `0.4`.
  - Deleted legacy storage keys (`hero_muted` and `topping-out-muted`).
- **SSR Safety**: Safe reads via `useSyncExternalStore` with fallback snapshots; zero access to `window` or `localStorage` during prerendering.
- **Silence Baseline**: Strict rule ensuring silence on page load, hover, scroll, navigation links, social links, and panel entrances. Audio unlocks only after genuine user interaction (`navigator.userActivation`).

### 2. The Sound Map
| Control / Interaction | Trigger Mechanism | Sound |
| :--- | :--- | :--- |
| **Theme Toggle (Switch to Light)** | `ThemeToggle` onClick | `toggleOn` |
| **Theme Toggle (Switch to Dark)** | `ThemeToggle` onClick | `toggleOff` |
| **Header Search Button** | `data-sound="open"` | `open` |
| **Command Palette Shortcut (`Ctrl+K`, `/`)** | Shortcut keydown handler | `open` |
| **Command Palette Close (`Esc`, Backdrop click)** | `Command.Dialog` onOpenChange / Esc | `close` |
| **Command Palette Item Selection** | `.command-overlay .command-option` | `command` |
| **Project Row Collapsible** | `data-slot="collapsible-trigger"` | `close` (open $\to$ closed) / `open` (closed $\to$ open) |
| **Experience Position Collapsible** | `data-slot="collapsible-trigger"` | `close` (open $\to$ closed) / `open` (closed $\to$ open) |
| **Achievements 'Show All' Collapsible** | `data-slot="collapsible-trigger"` | `open` |
| **Copy Buttons (Email, Phone)** | `data-sound="copy"` on `<CopyButton />` | `copy` |
| **Project Filter Pills (All, Backend, Android)** | `data-sound="select"` / Arrow navigation | `select` |
| **Hero Crosshair Pins** | Click handler with detune formula (`pinIndex * 90`) | `select` (`detune: 0, 90, 180, ...`) |
| **Resume View & Download** | `data-sound="select"` (or `blocked` on `[aria-disabled="true"]`) | `select` / `blocked` |
| **Header Gamepad Button (Launch Game)** | `openGame()` in `GameProvider` | `open` |
| **Game HUD Palette Button** | `data-sound="select"` | `select` |
| **Game Close Button & Esc** | `closeGame()` in `GameProvider` | `close` |
| **Global SoundToggle Unmute** | Unmute event listener in `SoundEffectListener` | `swoosh` |

### 3. SoundToggle Visual Token
- Micro-animated SVG speaker with sound waves and an angled slash line controlled by `[data-muted='true']`.
- Smooth stroke-dashoffset transitions respecting `prefers-reduced-motion`.
- Placed in the hero next to the name heading and in the Topping Out game HUD.




