# Motion Audit — "Second Pass" Portfolio

*Audit performed for Prompt 7 — Motion and Micro-interaction Polish.*  
*Reference Motion Budget: `docs/DESIGN.md` §5 and §16.*

## Allowed Motion Categories (Budget Strictness)
1. **First-load entrance of Home** (once per session / page load).
2. **Curtain wipe between views** (bidirectional cover / uncover).
3. **Per-view content entrance** (`Reveal` / `Stagger`).
4. **Hover / focus / press feedback** (160ms `EASE_OUT_EXPO`).
5. **Heading "resolve"** (`ResolveText` randomised character settling).
6. **Tab / selection indicator slide** (`layoutId` 220ms `EASE_OUT_EXPO`).
7. **Command menu open / close** (modal dialog fade and scale).
8. **Game Slot drawer** (sliding console tray).
9. **Micro-interaction feedback** (Copy button checkmark swap, theme fade).
10. **Pixel Perfect micro-interactions** (`FlipText` character roll, `MagneticArrow` inertia pull).

> **Rule Verification**: Zero continuous rotations, zero floating background elements, zero looping shimmers, zero idle pulses, zero sound anywhere.

---

## Codebase Motion Inventory

| Where | What animates | Duration | Easing | Trigger | Reduced-motion behaviour | In budget |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `src/components/home/HeroContent.tsx` | Hero tags, titles, bio, CTA & portrait entrance | 450–700ms (staggered) | `EASE_OUT_EXPO` (0.16, 1, 0.3, 1) | First page mount (`sessionStorage` flag check) | Instant render (`opacity: 1`, `y: 0`, delay: 0) | **Yes** |
| `src/components/home/IndexList.tsx` | Secondary home index rows entrance | 450ms (stagger 40ms) | `EASE_OUT_EXPO` | First page mount | Instant render | **Yes** |
| `src/components/home/IndexList.tsx` | Copy button icon swap (Copy ➔ Checkmark) | 200ms | `EASE_OUT_EXPO` | Pointer click on copy | Instant icon swap, resets after 1600ms | **Yes** |
| `src/components/home/useLens.ts` | Signature lens circle mask radius & position | Pointer tracked (raf) / 600ms toggle | `EASE_OUT_EXPO` | Pointer move on desktop; toggle button | Instant radius snap (0 or full) | **Yes** |
| `src/components/transition/Curtain.tsx` | Full-screen paper wipe & 2px accent leading edge | Cover: 360ms / Uncover: 380ms | `EASE_IN_OUT_QUART` (0.76, 0, 0.24, 1) | Route navigation via `ViewLink` | Skipped entirely; instant route navigation | **Yes** |
| `src/components/motion/Reveal.tsx` | Page view wrapper entrance | 450ms | `EASE_OUT_EXPO` | Route mount | Instant opacity 1, no y translation | **Yes** |
| `src/components/motion/Stagger.tsx` | Sequential entry of list / card items | 40ms stagger offset | `EASE_OUT_EXPO` | Parent mount | Children display instantly without delay | **Yes** |
| `src/components/motion/ResolveText.tsx` | Heading glyph shuffling & settling | 400ms max | Linear shuffle interval (40ms) | Mount / viewport reveal | Displays final target string immediately | **Yes** |
| `src/components/about/AboutView.tsx` | Tab panel switch crossfade & subtle y nudge | 220ms | `EASE_OUT_EXPO` | User selects tab (Profile, Edu, Skills, Highlights) | Instant content switch, zero translation | **Yes** |
| `src/components/about/Tabs.tsx` | Active tab background pill indicator (`layoutId`) | 220ms | `EASE_OUT_EXPO` | Tab selection or Arrow key navigation | Instant placement without sliding | **Yes** |
| `src/components/shell/NavLinks.tsx` | Active nav link pill (`layoutId="nav-active-pill"`) | 220ms | `EASE_OUT_EXPO` | Route transition | Instant placement without sliding | **Yes** |
| `src/components/shell/NavLinks.tsx` | Navigation link character flip (`FlipText`) | 300ms | Custom cubic-bezier per character | Pointer hover on nav link | Instant static text; no vertical flip | **Yes** |
| `src/components/shell/MobileTabs.tsx` | Mobile bottom bar active indicator (`layoutId`) | 220ms | `EASE_OUT_EXPO` | Route transition | Instant placement | **Yes** |
| `src/components/shell/ThemeToggle.tsx` | Theme icon swap (Sun ➔ Moon) | 200ms | `EASE_OUT_EXPO` | Toggle button click | Instant icon swap | **Yes** |
| `src/app/globals.css` (`html.theme-fade`) | Color & surface crossfade on theme change | 200ms | `EASE_OUT_EXPO` | Theme toggle clicked (active for 240ms) | Skipped via `prefers-reduced-motion` | **Yes** |
| `src/components/shell/GameSlot.tsx` | Drawer tray slide-in & backdrop fade | 260ms | `EASE_OUT_EXPO` | Game toggle button click / Esc key | Instant modal display / dismiss | **Yes** |
| `src/components/command/CommandMenu.tsx` | Command palette backdrop fade & dialog scale | 220ms | `EASE_OUT_EXPO` | `Cmd+K` / click on command button | Instant modal display / dismiss | **Yes** |
| `src/components/ui/Toaster.tsx` | Toast notification slide & fade in/out | 240ms | `EASE_OUT_EXPO` | Copy action / trigger toast | Instant fade in and out | **Yes** |
| `src/components/work/ProjectRow.tsx` | Mobile accordion collapse / expand | 260ms | `EASE_OUT_EXPO` | Mobile accordion tap | Instant expand / collapse | **Yes** |
| `src/components/work/ProjectDetail.tsx` | Desktop project detail panel crossfade | 200ms | `EASE_OUT_EXPO` | Selecting a different project | Instant detail change | **Yes** |
| `src/components/ui/MagneticArrow.tsx` | Inertia arrow cursor pull (max ±6px) | Clamped to pointer; 300ms spring settle | GSAP `quickTo` spring curve | Pointer move over CTA buttons / Next pill | Disabled (`transform: none`); static arrow | **Yes** |
| `src/components/contact/EmailLink.tsx` | Email address character flip (`FlipText`) | 300ms | Custom cubic-bezier per character | Pointer hover over email link | Instant static text; no vertical flip | **Yes** |
| `src/components/contact/EmailLink.tsx` | Expanding 2px accent underline | 220ms | `EASE_OUT_EXPO` | Pointer hover / focus | Instant underline | **Yes** |
| `src/components/ui/Button.tsx` | Button hover lift (`-translate-y-px`) & active press (`scale-98`) | 160ms | `EASE_OUT_EXPO` | Pointer hover & mousedown | Instant static state | **Yes** |
| `src/components/home/IndexList.tsx` / `ProjectRow.tsx` | Registration mark offset on hover | 160ms | `EASE_OUT_EXPO` | Pointer hover on row | Offset applied without transition | **Yes** |

---

## Motion Budget Compliance Summary
- **Total Initial Bundle Overhead for GSAP**: 0 KB (loaded via on-demand dynamic `await import("gsap")` on first pointer hover).
- **Reduced Motion Support**: Complete. Tested with `prefers-reduced-motion: reduce`. All `framer-motion` components inspect `useMotionOK()` / `motionOK` and disable transforms and delays. Global CSS disables all animations (`0.01ms !important`).
- **Maximum Entrance Duration**: 700ms (Hero cascade on first view).
- **Standard UI Transitions**: 160ms (feedback) to 260ms (drawer / accordion).
- **Forbidden Elements Checked**: No floating circles, no looping canvas animations, no continuous spinners, no audio components.
- **Budget Status**: **100% IN BUDGET**.
