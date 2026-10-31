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


