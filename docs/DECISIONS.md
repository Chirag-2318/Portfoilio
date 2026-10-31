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



## Prompt 2 — Global Shell, Navigation, Transitions, Command Menu

1. **Hydration and Client Detection Patterns**:
   - Used `React.useSyncExternalStore` for client-only mounting state (`useMounted`, `useIsMac`) to eliminate hydration warnings and avoid synchronous `setState` in `useEffect` (enforcing strict compliance with React 19 rules).

2. **Curtain Synchronization**:
   - Animated the curtain panel with `inset(100% 0 0 0)` to `inset(0 0 0 0)` for covering (wipe upwards from bottom) and `inset(0 0 0 0)` to `inset(0 0 100% 0)` for revealing.
   - Synchronized a physical 2px `--accent` leading edge line to the moving boundary during both cover and reveal stages.
   - Used `requestAnimationFrame` on initial hydration to establish `ready=true`, ensuring initial page reveals animate smoothly.

3. **Header Spacing & Responsive Fitting**:
   - On tablet viewport (768px), nav indices (`01`, `02`, etc.) are hidden to prioritize page labels and prevent header crowding, expanding to include index tags at `lg` (1024px+).
   - Clock displays `PUNE HH:MM` on desktop/tablet, concise `HH:MM` on medium-mobile, and gracefully hides below 480px.

4. **Custom SVG Registration Icon**:
   - Drew inline 24x24 SVG with a center circle (r=6), 4 crosshair lines extending 3px beyond the circle at N, S, W, and E, and an offset smaller circle (r=3) at (+2, +2) stroked with `var(--accent)`.
   - Added hover transform nudge (`group-hover:translate-x-px group-hover:translate-y-px`) to the offset accent circle.

5. **Placeholder View Architecture**:
   - Scaffolding `/work`, `/about`, `/resume`, and `/contact` with `ViewFrame` and `ComingTogether` editorial proof sheets (28pt grid, crop ticks, `PROOF PENDING` banner).



## Prompt 3 — The One-Screen Home View and the Signature ("Second Pass" Lens)

1. **Dual-Layer Lens Architecture**:
   - Stacked `<HeroContent variant="final" />` (interactive, base) and `<HeroContent variant="draft" />` (overlay, `aria-hidden="true"`, `inert`, `pointer-events: none`).
   - `useLens.ts` coordinates MotionValues (`x`, `y`, `r`) driven by spring physics (`stiffness: 420, damping: 38`), writing directly to `draftEl.style.clipPath = circle(${r}px at ${x - rect.left}px ${y - rect.top}px)` and translating the SVG Loupe ring (`LoupeRing.tsx`) via `requestAnimationFrame` without React re-renders.
   - Interactive radii targets: rest `0`, hover `120px` (fine pointer) / `96px` (touch), held `180px`, over interactive elements `36px` (`a, button, [data-lens-shrink]`).
   - One-time auto-sweep: Runs once per session via module-level `introPlayed` flag if pointer hasn't moved after entrance finish (~900ms), sweeping across the `[data-name]` element over 900ms with in-out-quart easing.

2. **Construction Guide Line Calibration**:
   - Calibrated against Fraunces 144opsz font metrics:
     - `--g-cap: 0.12em;`
     - `--g-xheight: 0.44em;`
     - `--g-baseline: 0.76em;`
   - Dashed rules with 10px JetBrains Mono uppercase labels (`CAP HEIGHT`, `X-HEIGHT`, `BASELINE`) and edge registration `+` ticks.

3. **Draft Layer Opacity and React 19 Inert Support**:
   - Initial entrance animation is strictly reserved for `variant="final"` (`isFirstIntro = !isDraft && ...`). Draft layer elements use `initial={false}`, rendering 100% visible at all times beneath the clip path.
   - Standardized `inert` to boolean attribute (`inert={true}` or `inert={isDraft ? true : undefined}`) for React 19 compliance, eliminating console warnings.

4. **CSS Cascade Layering for Button Typography**:
   - In Tailwind CSS v4, base resets (`a { color: inherit; }`) defined outside `@layer` took precedence over `@layer utilities` classes (`.text-paper`). Wrapped all base resets into `@layer base { ... }` in `src/app/globals.css`, ensuring `.text-paper` on `.bg-ink` primary buttons renders correctly in all viewports.

5. **Single Viewport No-Scroll Constraint (Heights ≥ 640px)**:
   - On `< 768px`, calibrated `--name-vw: 24vw`, `font-size: clamp(3.25rem, min(var(--name-vw), 18svh), 14rem)`, mobile portrait dimensions to `60x75px`, and container vertical padding to `0.5rem 0`.
   - Verified that viewports from 360x740 up to 1440x900 have `docScroll: false` and `contentScroll: false`.



## Prompt 4 — The Work View (Projects)

1. **Hydration-Safe Hash Synchronization via `useSyncExternalStore`**:
   - Implemented `useProjectHash.ts` with `React.useSyncExternalStore` subscribing to `"hashchange"` and custom `"cp:hash"` events.
   - `getServerSnapshot()` returns `DEFAULT_PROJECT_ID` (`"sar"`), guaranteeing zero hydration mismatch between SSR and client.
   - `getSnapshot()` dynamically resolves the current valid hash on client, preventing cascading `useEffect` renders.
   - Selection updates URL hash via `window.history.replaceState(null, "", "#id")` (avoiding scroll jumps and curtain triggers).

2. **Compact Viewport Fitting at 1366x768 & 768x1024**:
   - Added `compactHeader?: boolean` support to `ViewFrame` to cap the title block height to <= 120px on `/work`.
   - Tuned `ProjectDetail` padding (`p-4 sm:p-5 lg:p-5 xl:p-8`), typography line-heights, and row min-heights (`84px / 88px`) to ensure the 12-column layout fits within 1366x768 and 768x1024 viewports with `contentScroll: false` and `docScroll: false`.

3. **Roving Tabindex & Native Button Semantics**:
   - Maintained native `<button>` semantics within a semantic `<ul>` list.
   - Roving tabindex ensures only the selected row has `tabIndex={0}`, with ArrowUp/Down navigating both selection and focus, and Home/End jumping to first/last projects.
   - Sliding 2px accent bar rendered with Motion `layoutId="work-bar"` (`260ms in-out-quart`).

4. **Mobile Single-Column Accordion**:
   - Below 768px, projects render as an accordion with `aria-expanded` and `aria-controls` bindings.
   - Animated height transitions via Motion `height: "auto"` (300ms `out-expo`), falling back to instant transitions when `prefers-reduced-motion` is active.
   - Only one row is open at a time; total length at 390x844 measures 1.47 screens (<= ~1.5 screens).
   - Direct arrivals to `/work#arthix` smoothly scroll the active item into view.



## Prompt 5 — About View: Profile, Education, Skills, Highlights

1. **Hydration-Safe Tab Hash Synchronization via `useSyncExternalStore`**:
   - Implemented `useTabHash.ts` using `React.useSyncExternalStore` for stable SSR matching (`DEFAULT_TAB = "profile"`), listening to `"hashchange"` and custom `"cp:hash"` events.
   - Tab selection triggers `history.replaceState(null, "", "#id")` without curtain wipes or page scroll jumps.
   - Invalid hashes cleanly default to `"profile"`.

2. **Accessible Tabs Pattern with Roving Tabindex**:
   - Implemented `Tabs.tsx` with W3C tabs pattern (`role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `id`, `role="tabpanel"`, `tabIndex={0}`).
   - Arrow Left/Right navigate both focus and active tab selection automatically; Home/End jump to first/last tabs.
   - Underline indicator animated across tabs with Motion `layoutId="about-tab"` (`260ms in-out-quart`).

3. **Compact Viewport Fitting at 1366x768 & 768x1024**:
   - Kept title row compact using `ViewFrame compactHeader` so all 4 panes fit within a single viewport without document or container scrolling (`contentScroll: false`).
   - Fixed CSS min-height on tabpanel container (`min-h-[380px] lg:min-h-[400px]`) eliminates height jumps during pane switching.

4. **320px Viewport Tabs Fitting**:
   - Tuned tab typography scale to `text-[9.5px]` on `< 360px`, `text-[11px]` on `360px+`, and `text-xs` on `sm+`, combined with `tracking-tight` and `gap-1 min-[360px]:gap-3`.
   - Verified that at 320px width, all 4 tabs fit on one line with `fitsWidth: true` and `allSameTop: true` with zero horizontal overflow.

5. **Screen Reader Separation for Skills List**:
   - Mid-dot separators (`·`) in the Skills inline lists are rendered via CSS `::after` on `<li>` elements, ensuring screen readers hear a clean sequence of terms rather than punctuation symbols.

6. **Highlights Hackathons Two-Column Desktop Grid**:
   - Rendered the 5 hackathon placements into a 2-column inline grid on desktop/tablet to keep row height <= 110px.
   - Placed a subtle 6px `var(--accent)` square marker before "Winner" as the single accent focal point in the list.



## Prompt 6 — Resume View and Contact View

1. **Hydration-Safe Real-Time Clock via `useSyncExternalStore` (`src/lib/usePuneTime.ts`)**:
   - Extracted Pune local time formatted with `Intl.DateTimeFormat` into a reusable hook `usePuneTime`.
   - Uses `React.useSyncExternalStore` with shared external subscription, returning `null` during SSR and `"14:32"` upon client mount.
   - Updates accurately on exact minute boundaries via `setTimeout` without continuous polling intervals, eliminating React 19 `set-state-in-effect` warnings.
   - Reused across Header `Clock.tsx` and Contact `ContactRows.tsx` without timer duplication or UI layout shift.

2. **Socials Single-Source Configuration (`src/lib/socials.ts`)**:
   - Centralized social links retrieval with `getSocials()`, distinguishing development from production builds.
   - In production (`process.env.NODE_ENV === "production"`), placeholder URLs are automatically filtered out (`visible = false`).
   - In development, placeholder entries are retained (`visible = true`), showing an explicit `PLACEHOLDER` tag and setup prompt on `/contact`, plain text labels on `/resume`, and placeholder hints in `CommandMenu`.

3. **Resume View Internal Scrolling & Screen-Budget Fitting**:
   - On desktop (≥ 1024px), configured 12-column layout with `ViewFrame compactHeader` and `min-h-0 flex-1 items-stretch`. The outer `#content` container remains non-scrolling (`contentScroll: false`), while the `#resume-sheet` `<article>` scrolls internally with a thin scrollbar.
   - Implemented dynamic 28px bottom fade mask (`linear-gradient(to bottom, black calc(100% - 28px), transparent 100%)`) that automatically removes itself when scrolled to the end (`data-at-end="true"`).
   - Tuned row padding and margins across the 4 sections (Education, Skills, Projects, Highlights) so that total content length on mobile (390×844) measures 2.01 screens (comfortably <= ~2 screens).

4. **Print Stylesheet Isolation (`resume.css`)**:
   - Configured print stylesheet with `@page { size: A4; margin: 14mm }` and `data-print="hide"` attributes across Header, Footer, MobileTabs, CropMarks, Curtain, Toaster, SkipLink, ViewFrame title row, and ResumeActions.
   - Forced pure white background, solid black ink, visible overflow, and `break-inside: avoid` on resume rows.
   - Emulated print test confirmed that only the resume sheet renders cleanly without clipped sections or UI chrome.

5. **Robust Clipboard Fallback in `useCopy.ts`**:
   - Wrapped `navigator.clipboard.writeText` in a nested try/catch falling back to `document.execCommand("copy")`.
   - Allows clipboard actions to complete cleanly even in restricted headless Chrome testing environments without throwing unhandled permission rejections.

6. **Interactive Actions & Feedback**:
   - Contact "Copy address" button triggers toast confirmation and updates button label to "Copied" with animated check icon for 1600ms (`aria-live="polite"`).
   - Resume "Download PDF" checks `getAssets().hasResume`: when absent, renders an outline button with toast "The PDF is being set"; when present, downloads the PDF file.
   - Desktop "Jump to" buttons smoothly scroll the resume sheet container directly to each respective section with visible focus outlines.



## Prompt 7 — Motion and Micro-interaction Polish, Pixel Perfect Components, IconSpace Icons

1. **IconSpace Registry Testing & Routing**:
   - Ran `npx iconspace add` with the full candidate set (`sun`, `moon`, `copy`, `check`, `download`, `search`, `x`, `printer`, `arrow`, `email`, `call`).
   - Confirmed that in version 0.1.1, the registry contains 39 icons; only `arrow`, `email`, and `call` matched our portfolio's needs.
   - Vendored `ArrowIcon`, `EmailIcon`, and `CallIcon` into `src/components/icons/`.
   - In `src/components/ui/Icon.tsx`, mapped `mail` -> `EmailIcon`, `phone` -> `CallIcon`, and excluded `ref` from generic SVG props (`Omit<React.SVGProps<SVGSVGElement>, "ref">`) to ensure full TypeScript type-safety with `IconHandle`.
   - Remaining icon names (`sun`, `moon`, `copy`, `check`, `download`, `search`, `x`, `printer`, `chevron-down`, `external`) fall back cleanly to `lucide-react`, while `github`, `linkedin`, and `registration` use hand-tuned SVGs.

2. **Pixel Perfect UI Integration & Lazy GSAP Loading**:
   - Vendored two components from Pixel Perfect UI (`vansh-nagar/Pixel-Perfect`):
     - `FlipTextReveal` in `src/components/pp/FlipTextReveal.tsx`
     - `InertiaArrowCard` in `src/components/pp/InertiaArrowCard.tsx`
   - Added full third-party MIT license attribution in `THIRD_PARTY_NOTICES.md` with copyright `Copyright (c) 2026 Vansh Nagar`.
   - Created accessible adapters: `src/components/motion/FlipText.tsx` and `src/components/ui/MagneticArrow.tsx`.
   - Replaced `RollText` in `NavLinks.tsx` and plain text in `EmailLink.tsx` with `<FlipText>`.
   - Replaced plain button arrows with `<MagneticArrow>` on the primary CTA ("See the work"), Contact CTA ("Write an email"), and desktop "Next project" button in `ProjectDetail.tsx`.
   - **Zero Initial Chunk Overhead for GSAP**: GSAP is loaded dynamically via `await import("gsap")` strictly inside pointer hover handlers (`handleMouseEnter`). As verified by the Next.js production build, GSAP is completely absent from all initial page load bundles.

3. **Motion Budget & Micro-interaction Polish**:
   - Added `html.theme-fade` 200ms transition class during theme toggles for 240ms, providing smooth paper/ink transition.
   - Enforced 44px coarse hit targets (`[@media(pointer:coarse)]:-inset-1`) on icon buttons (`ThemeToggle`, `GameSlot`, `Header` command button, `IndexList` copy button).
   - Created `docs/MOTION_AUDIT.md` verifying 100% compliance across all 25 animated interactions with zero continuous loops, zero idle pulses, and zero audio.

4. **Curtain Motion Syntax Fix**:
   - Corrected `motion/react` numeric animation syntax in `Curtain.tsx` from `animate((p) => { ... }, opts)` to `animate(0, 1, { duration, ease, onUpdate: (p) => { ... } })`, eliminating unhandled rejection errors during view navigation.


## Prompt 8 — The Optional Game: "Registration"

1. **Dynamic Code Splitting & Zero-Cost Bundle Strategy**:
   - `GameOverlay` is lazy-loaded with `next/dynamic(() => import("@/components/game/GameOverlay"), { ssr: false })` within `GameProvider.tsx`.
   - Next.js webpack splits the canvas engine and overlay into an isolated dynamic chunk (`1o9a072u9-4-e.js`), adding 0 KB to all route initial bundles.
   - Added hover/focus preloading via `preloadGame()` on the `[data-game-slot]` button to eliminate perceived loading latency.

2. **Accessible Dialog Lifecycle and Focus Management**:
   - Configured `GameOverlay` as a standard modal dialog (`role="dialog"`, `aria-modal="true"`, `aria-labelledby="reg-title"`).
   - `#app-root` is set to `inert` and `document.body.style.overflow = "hidden"` locks scrolling.
   - Roving focus trap with auto-focus on start/play-again buttons and Esc key listener restores focus back to the trigger button on exit.

3. **Composite Blend Modes Across Light and Dark Themes**:
   - Light Theme: Uses `globalCompositeOperation = "multiply"` to replicate genuine offset lithography printing ink darkening paper.
   - Dark Theme: On dark paper (`#12110E`), `"multiply"` produces near-black invisibility. The engine dynamically switches to `"screen"` in dark mode, allowing the red accent plate to glow cleanly over the dark target shape.

4. **Performance Isolation via Direct DOM Ref**:
   - The 60fps game loop and physics updates run decoupled from React's render tree.
   - The remaining-time line indicator is updated directly via DOM manipulation on `timerLineRef.current.style.transform`, preventing React reconciliation overhead during gameplay.
   - State notifications (`sheets`, `prints`, `best`, status alerts) only trigger React updates during discrete game state events.

5. **Strict Reduced-Motion Adherence**:
   - Subscribed to `(prefers-reduced-motion: reduce)` via `useReducedMotionFlag.ts`.
   - Circular clip-path curtain transitions switch to subtle opacity fades.
   - Target wander acceleration is set to zero; sheet transitions and snap alignment animations swap instantly without motion.

## Prompt 9 — Responsive Polish, Accessibility, Performance, SEO

1. **Light Accent Token Refinement for WCAG AA Compliance (#B82D17)**:
   - Automated relative luminance contrast audit via scripts/contrast.mjs revealed that the initial light accent token #C8321A achieved 4.29:1 against --paper-2 (#EAE6DB), narrowly missing the WCAG AA 4.5:1 threshold for normal text.
   - Refined light --accent to #B82D17 (preserving exact hue while stepping down lightness), achieving:
     - 4.92:1 against --paper-2 (#EAE6DB) [PASS]
     - 5.38:1 against --paper (#F3F0E8) [PASS]
     - 5.78:1 against --surface (#FAF8F3) [PASS]
     - 6.13:1 for --accent-ink (#FFFFFF) against --accent [PASS]
   - Switched all real text using --ink-3 (which is reserved exclusively for decorative rules, guides, and crop marks) to --ink-2, guaranteeing universal WCAG AA compliance across both themes.

2. **Fraunces Axis Pruning (`WONK` removed)**:
   - Pruned Fraunces configuration in `src/app/layout.tsx` from `axes: ["opsz", "WONK", "SOFT"]` to `axes: ["opsz", "SOFT"]`, matching the variable font specification and removing unnecessary font file overhead.

3. **Dynamic Import for Command Palette (`CommandMenu`)**:
   - Refactored `CommandMenu` in `CommandProvider.tsx` using `next/dynamic(() => import("@/components/command/CommandMenu"), { ssr: false })`.
   - Preloaded on first idle callback (`requestIdleCallback` with 2s timeout) or immediately upon shortcut (`Ctrl/Cmd+K`) or search button trigger, completely removing its bundle from the initial critical rendering path.

4. **WCAG 2.5.3 (Label in Name) Compliance in Header**:
   - Monogram "CP" container marked `aria-hidden="true"` so the logo link accessible name matches visible "Chirag Patil" text.
   - Removed conflicting `aria-label="Search"` on the desktop command trigger button; the button directly presents visible "Search" text, and the shortcut badge is marked `<Kbd aria-hidden="true">`.

5. **Strict Semantic `<dl>` and `<list>` Content Models**:
   - Grouping in `IndexList.tsx` updated so `<ViewLink>` is nested inside `<dd>`, ensuring `<dl>` contains exclusively `<div>` with `<dt>` and `<dd>`.
   - Contact rows action button wrapper converted to `<dd>`.
   - `WorkView` desktop container assigned `role="list"` and `ProjectRow` desktop item assigned `role="listitem"`, satisfying Axe-core semantic list hierarchy.

6. **Signature Lens RAF Loop Dormancy & Element Caching**:
   - `useLens.ts` enhanced to check `curR < 0.5 && prevR < 0.5`. When the lens is closed/dormant, DOM clip-path and SVG operations are bypassed, eliminating idle CPU consumption.
   - SVG child elements in `ringRef` (`.loupe-circle`, ticks, label) are cached on first mount, eliminating 6 `querySelector` queries per frame.
   - Auto-sweep intro timer scheduled for 1800ms, ensuring zero interference with initial paint and hydration metrics.
