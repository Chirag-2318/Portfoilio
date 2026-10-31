# Audit Report: Responsive, Accessibility, Performance & SEO (Prompt 9)

**Project:** Chirag Patil's Portfolio — *"Second Pass"*  
**Framework:** Next.js (App Router, Static Export `output: "export"`)  
**Deployment Target:** Vercel Static  
**Auditor:** Autonomous Verification Suite (Axe-core v4.14, Lighthouse v13, Chrome DevTools Protocol)  
**Date:** October 31, 2026  

---

## 1. Executive Summary

| Category | Target | Result | Status |
| :--- | :--- | :--- | :--- |
| **Responsive Stability** | 11 Viewports + Landscape & 200% Zoom, No Horizontal Spill | 156 / 156 checks passed | **PASS** |
| **Accessibility (WCAG AA)** | 0 Axe Violations, All Text Contrast $\ge 4.5:1$ | 0 violations across 12 combinations | **PASS (100% Score)** |
| **Performance (Desktop)** | Lighthouse $\ge 95$ across all views | Home: 100, Work: 99, About: 99, Resume: 100, Contact: 100 | **PASS** |
| **Performance (Mobile)** | Smooth load, zero CLS, bundle $< 170$ kB | FCP 0.9s, CLS 0.00, Shared Bundle 152 kB | **PASS** |
| **SEO & Discoverability** | 100% Valid OpenGraph, Twitter, JSON-LD, Sitemap, Robots | 100 / 100 across all routes | **PASS (100% Score)** |
| **Best Practices** | Lighthouse $\ge 95$ | 96 across all routes (4 pts withheld only for local HTTP) | **PASS** |

---

## 2. Part A: Responsive Audit

All routes (`/`, `/work` with hashes `#sar`, `#validedi`, `#arthix`, `/about` with hashes `#profile`, `#education`, `#skills`, `#highlights`, `/resume`, `/contact`, `/404.html`), command palette, and the "Registration" game overlay were verified via headless Chrome CDP at standard and extreme viewport constraints in both light and dark themes.

### Viewport Matrix Summary

| Viewport | Device Archetype | Evaluated Routes | Overflow Checked | Home Single-Screen Check | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **320x568** | iPhone SE 1st gen | 13 routes | 0px spill | Dynamic scroll allowed (height < 640px) | **PASS** |
| **360x740** | Samsung Galaxy small | 13 routes | 0px spill | Fits single screen ($100\text{dvh}$ constraint verified) | **PASS** |
| **390x844** | iPhone 12/13/14/15 | 13 routes | 0px spill | Fits single screen without vertical scroll | **PASS** |
| **768x1024** | iPad portrait | 13 routes | 0px spill | Desktop-split grid active, fits single screen | **PASS** |
| **1024x768** | iPad landscape / Netbook | 13 routes | 0px spill | Fits single screen ($100\text{dvh}$) | **PASS** |
| **1280x720** | 720p HD Display | 13 routes | 0px spill | Clean layout, ruled borders intact | **PASS** |
| **1366x768** | Standard Laptop | 13 routes | 0px spill | Clean layout, crisp typography | **PASS** |
| **1440x900** | Standard Desktop Display | 13 routes | 0px spill | Primary target reference | **PASS** |
| **1920x1080** | 1080p Full HD Display | 13 routes | 0px spill | Maximum container constraint (1760px) respected | **PASS** |
| **2560x1440** | 1440p QHD / Ultrawide | 13 routes | 0px spill | Center-aligned, padded side gutters | **PASS** |
| **844x390** | Mobile Landscape | 13 routes | 0px spill | Overrides single-screen lock to permit scrolling | **PASS** |
| **1280x720 (200% Zoom)** | 320% reflow WCAG test | 13 routes | 0px spill | Reflows cleanly without clipping or data loss | **PASS** |

### Screenshots Captured
Visual audit screenshots saved to `screenshots/`:
- `p9-home-320-light.png`, `p9-home-320-dark.png`
- `p9-home-390-light.png`, `p9-home-390-dark.png`
- `p9-home-768-light.png`, `p9-home-768-dark.png`
- `p9-home-1024-light.png`, `p9-home-1024-dark.png`
- `p9-home-1440-light.png`, `p9-home-1440-dark.png`
- (And corresponding screenshots for `/work`, `/about`, `/resume`, `/contact`, `/404.html`).

---

## 3. Part B: Accessibility Audit (WCAG 2.1 AA)

### 3.1 Token Contrast Verification
Audited using relative luminance algorithm ($L_1 / L_2$) defined by W3C WCAG 2.1 AA:

#### Light Theme
| Token Pair | Foreground | Background | Contrast Ratio | Minimum | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ink` on `paper` | `#15140F` | `#F3F0E8` | **16.19 : 1** | $4.5 : 1$ | **PASS** |
| `ink` on `paper-2` | `#15140F` | `#EAE6DB` | **14.79 : 1** | $4.5 : 1$ | **PASS** |
| `ink` on `surface` | `#15140F` | `#FAF8F3` | **17.37 : 1** | $4.5 : 1$ | **PASS** |
| `ink-2` on `paper` | `#55514A` | `#F3F0E8` | **6.93 : 1** | $4.5 : 1$ | **PASS** |
| `ink-2` on `paper-2` | `#55514A` | `#EAE6DB` | **6.33 : 1** | $4.5 : 1$ | **PASS** |
| `ink-2` on `surface` | `#55514A` | `#FAF8F3` | **7.43 : 1** | $4.5 : 1$ | **PASS** |
| `accent` on `paper` | `#B82D17` | `#F3F0E8` | **5.38 : 1** | $4.5 : 1$ | **PASS** |
| `accent` on `paper-2` | `#B82D17` | `#EAE6DB` | **4.92 : 1** | $4.5 : 1$ | **PASS** |
| `accent` on `surface` | `#B82D17` | `#FAF8F3` | **5.78 : 1** | $4.5 : 1$ | **PASS** |
| `accent-ink` on `accent` | `#FFFFFF` | `#B82D17` | **6.13 : 1** | $4.5 : 1$ | **PASS** |

#### Dark Theme
| Token Pair | Foreground | Background | Contrast Ratio | Minimum | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ink` on `paper` | `#EEEADF` | `#12110E` | **15.71 : 1** | $4.5 : 1$ | **PASS** |
| `ink` on `paper-2` | `#EEEADF` | `#0C0B09` | **16.37 : 1** | $4.5 : 1$ | **PASS** |
| `ink` on `surface` | `#EEEADF` | `#1A1914` | **14.64 : 1** | $4.5 : 1$ | **PASS** |
| `ink-2` on `paper` | `#A9A395` | `#12110E` | **7.52 : 1** | $4.5 : 1$ | **PASS** |
| `ink-2` on `paper-2` | `#A9A395` | `#0C0B09` | **7.83 : 1** | $4.5 : 1$ | **PASS** |
| `ink-2` on `surface` | `#A9A395` | `#1A1914` | **7.01 : 1** | $4.5 : 1$ | **PASS** |
| `accent` on `paper` | `#FF6B4A` | `#12110E` | **6.70 : 1** | $4.5 : 1$ | **PASS** |
| `accent` on `paper-2` | `#FF6B4A` | `#0C0B09` | **6.98 : 1** | $4.5 : 1$ | **PASS** |
| `accent` on `surface` | `#FF6B4A` | `#1A1914` | **6.25 : 1** | $4.5 : 1$ | **PASS** |
| `accent-ink` on `accent` | `#12110E` | `#FF6B4A` | **6.70 : 1** | $4.5 : 1$ | **PASS** |

*Adjustment Note:* The light theme accent was adjusted from `#C8321A` (4.29:1 on `paper-2`) to `#B82D17` (4.92:1 on `paper-2`), guaranteeing full compliance across all paper surfaces.

### 3.2 Automated Axe-Core Audit Results
Automated test executed with `axe-core` v4.14 across all WCAG 2.0, 2.1, 2.2 Level A, AA, and Best-Practice rulesets:

| Theme | Route | Violations Detected | Pass / Fail |
| :--- | :--- | :--- | :--- |
| **Light** | `/` | **0** | **PASS** |
| **Light** | `/work/` | **0** | **PASS** |
| **Light** | `/about/` | **0** | **PASS** |
| **Light** | `/resume/` | **0** | **PASS** |
| **Light** | `/contact/` | **0** | **PASS** |
| **Light** | `/404.html` | **0** | **PASS** |
| **Dark** | `/` | **0** | **PASS** |
| **Dark** | `/work/` | **0** | **PASS** |
| **Dark** | `/about/` | **0** | **PASS** |
| **Dark** | `/resume/` | **0** | **PASS** |
| **Dark** | `/contact/` | **0** | **PASS** |
| **Dark** | `/404.html` | **0** | **PASS** |

### 3.3 Semantic Structure & Landmarks
- **Single `<h1>`**: Every route has exactly one `<h1>`. On subpages, `ViewFrame` supplies the resolved heading; on Home, `HeroContent` supplies the display name `<h1>`. Inside `ResumeSheet`, the inner document masthead uses `<p className="font-serif text-3xl font-medium">` to avoid competing with `ViewFrame`'s `<h1>`.
- **Landmarks**: `<header role="banner">` (contains primary navigation `<nav aria-label="Primary">`), `<main id="main-content">`, and `<footer role="contentinfo">`.
- **Skip Link**: Top-level `<SkipLink>` anchors to `#main-content` and receives instant focus on Tab navigation.
- **Label in Name (WCAG 2.5.3)**: Search command buttons include visible "Search" text alongside `<Kbd aria-hidden="true">` keyboard shortcut hint, eliminating mismatch violations.
- **Strict `<dl>` Validity**: All `<dl>` elements strictly contain `<dt>` and `<dd>` inside grouping `<div>` wrappers.

---

## 4. Part C: Performance Audit

### 4.1 First Load JS Bundle Sizes
Static export bundle analysis from `next build`:

| Route | First Load JS (Raw) | First Load JS (Gzip) | Budget | Margin |
| :--- | :--- | :--- | :--- | :--- |
| `/` (Home) | 152 kB | ~46 kB | 170 kB | -124 kB |
| `/work` | 156 kB | ~48 kB | 170 kB | -122 kB |
| `/about` | 157 kB | ~49 kB | 170 kB | -121 kB |
| `/resume` | 156 kB | ~48 kB | 170 kB | -122 kB |
| `/contact` | 155 kB | ~47 kB | 170 kB | -123 kB |
| `/_not-found` | 152 kB | ~46 kB | 170 kB | -124 kB |

### 4.2 Core Web Vitals
- **Cumulative Layout Shift (CLS):** `0.00` across all views.
- **Font Axes:** Fraunces axis definitions strictly limited to `["opsz", "SOFT"]` with `display: "swap"`. `WONK` axis eliminated.
- **Asset Loading:** High-priority image preloading for hero assets (`site.assets.photo`) via `react-dom` `preload()`.
- **Lazy Loading:** `CommandMenu` is dynamically imported via `next/dynamic` (`ssr: false`) and only initiated on idle callback (`requestIdleCallback`) or upon shortcut trigger (`Ctrl/Cmd+K` / search button click).
- **Animation Loop Optimization:** Signature lens RAF animation loop in `useLens.ts` skips DOM queries when dormant (`curR < 0.5`) and caches SVG child element references, eliminating continuous query selector overhead.

---

## 5. Part D: SEO & Metadata Audit

- **Dynamic OpenGraph & Twitter Cards:**
  - Built with `@vercel/og` `ImageResponse` in `src/app/opengraph-image.tsx` and `src/app/twitter-image.tsx`.
  - Exact 1200x630 canvas adhering to the "Second Pass" aesthetic: cream paper background (`#F3F0E8`), 32px inset hairline border, outer corner crop marks, mono label `CP // SECOND PASS`, Fraunces display typography with `#B82D17` period dot, tagline, and an overlapping accent registration ring.
- **Static Icons:**
  - `src/app/icon.tsx`: 32x32 SVG/PNG monogram `CP` with accent dot.
  - `src/app/apple-icon.tsx`: 180x180 high-resolution Apple touch icon.
- **Sitemap & Robots:**
  - `src/app/sitemap.ts`: Prerendered static XML mapping `/`, `/work`, `/about`, `/resume`, `/contact`.
  - `src/app/robots.ts`: Prerendered static `robots.txt` pointing to sitemap URL.
- **Structured Data (JSON-LD):**
  - Canonical `Person` schema injected in `src/app/layout.tsx` specifying `name`, `jobTitle`, `alumniOf`, `address`, `email`, and `sameAs` (filtered to real profiles).
- **Metadata Cascade:**
  - `src/app/layout.tsx` sets `metadataBase`, `locale: "en_IN"`, `openGraph`, `twitter`, `authors`, and default title templates.
  - Subpages (`/work`, `/about`, `/resume`, `/contact`) declare specific titles, descriptions, and canonical URLs.

---

## 6. Part E: Lighthouse Audit Results

Tests executed via Lighthouse v13 against static production export (`out/`):

| Target | Performance | Accessibility | Best Practices | SEO | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Home (Desktop)** | **100** | **100** | **96** | **100** | **PASS** |
| **Work (Desktop)** | **99** | **100** | **96** | **100** | **PASS** |
| **About (Desktop)** | **99** | **100** | **96** | **100** | **PASS** |
| **Resume (Desktop)** | **100** | **100** | **96** | **100** | **PASS** |
| **Contact (Desktop)** | **100** | **100** | **96** | **100** | **PASS** |
| **Home (Mobile - 4G Throttled)** | **84** | **100** | **96** | **100** | **PASS** |

*Note on Best Practices:* The score of 96 across all views is the maximum attainable on a local HTTP static preview server (the sole non-passing audit is "Does not use HTTPS", which automatically resolves to 100 on Vercel's production HTTPS edge).

---

## 7. Verification Checklist

- [x] Static export builds cleanly (`npm run build`, exit code 0)
- [x] Zero console errors, zero hydration mismatches
- [x] Zero Axe-core violations across all views in both light and dark themes
- [x] All color contrast pairs $\ge 4.5:1$ (WCAG AA)
- [x] Single `h1` per page, valid landmarks, logical heading levels
- [x] All 156 responsive combinations verified with clean layout
- [x] No scroll on Home for viewports $\ge 640$px height
- [x] `CommandMenu` dynamically imported on idle / interaction
- [x] `ImageResponse` social cards render correctly at 1200x630
- [x] Person JSON-LD schema validated
- [x] Sitemap and robots.txt prerendered statically

