# Chirag Patil — "Blueprint Grid" Portfolio

A technical, single-page portfolio for Chirag Patil (Engineering student and developer in Pune, India). Built like a technical drawing: 768px central column bounded by full-bleed 1px hairlines, diagonal hatched 32px stripe dividers, dimension annotations (768, Ø160, 32, 30°), handwritten margin notes, and an integrated canvas mini-game.

Frontend-only, zero backend dependencies, zero environment secrets required, and Vercel-ready.

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 16 (App Router, Turbopack, Static Export)
- **Library**: React 19
- **Language**: TypeScript 5 (Strict)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (`@theme inline`, custom CSS variables for light & dark)
- **Typography**: Geist Sans, Geist Mono (`geist`), Caveat (Google Fonts for handwritten notes)
- **Components & Command Palette**: `cmdk`, Motion, custom SVG icons & artwork
- **Deployment**: Static HTML/CSS/JS export (`output: "export"`), deployable anywhere (Vercel, GitHub Pages, Cloudflare Pages)

---

## Quickstart

```bash
# Install dependencies
npm install

# Run dev server (http://localhost:3000)
npm run dev

# Production build and static export to out/
npm run build
```

---

## Customization Checklist (Zero-Friction Drop-ins)

All content is cleanly centralized in `src/content/site.ts` and `public/`. To personalize the portfolio with your personal assets:

1. **Avatar Photo** (`public/images/chirag.jpg`):
   - Drop your 1:1 square photo here.
   - If absent, the site automatically renders the technical blueprint avatar drawing (`AvatarBadge`) with the `Ø160` dimension callout.
2. **Resume PDF** (`public/Chirag_Patil_Resume.pdf`):
   - Drop your PDF resume in `public/`.
   - The Resume panel detects file existence via `HEAD` request. If missing, it gracefully displays `// Resume file coming soon.` with disabled action buttons.
3. **GitHub Username & Live Contribution Graph** (`src/content/site.ts`):
   - In `src/content/site.ts`, set `site.home.githubUsername = "your-actual-github-username"`.
   - The site will automatically fetch and render your live 52-week contribution activity grid from the GitHub API. While set to `PLACEHOLDER_GITHUB_USERNAME`, this section is cleanly omitted with zero broken elements.
4. **Social & Contact Links** (`src/content/site.ts`):
   - Set `site.url` to your production domain (e.g. `https://chiragpatil.dev`).
   - Set `site.socials.github.url` and `site.socials.linkedin.url`.
   - Set `site.email` and `site.phone` as desired.

---

## Structure & Architecture

```
├── public/
│   ├── images/chirag.jpg            # Optional avatar photo
│   └── Chirag_Patil_Resume.pdf      # Optional resume download
├── docs/
│   ├── PROJECT_CONTEXT.md           # Source of truth for factual information
│   └── REDESIGN_SPEC.md             # Blueprint Grid visual specification
├── src/
│   ├── app/
│   │   ├── globals.css              # Blueprint Grid CSS variables & full-bleed lines
│   │   ├── layout.tsx               # Root layout, Geist + Caveat fonts, theme script
│   │   ├── page.tsx                 # Blueprint single-page composition
│   │   ├── not-found.tsx            # 404 page featuring inline Registration game
│   │   ├── opengraph-image.tsx      # Blueprint drawing OG image (1200x630)
│   │   ├── twitter-image.tsx        # Twitter card mirror
│   │   ├── icon.tsx                 # 32x32 CP pixel monogram icon
│   │   ├── apple-icon.tsx           # 180x180 CP pixel monogram apple touch icon
│   │   ├── robots.ts                # Production robots.txt generator
│   │   └── sitemap.ts               # Production sitemap.xml generator
│   ├── components/
│   │   ├── blueprint/               # Blueprint Grid UI components
│   │   │   ├── Panel.tsx            # 768px bounded column with screen-wide hairlines
│   │   │   ├── PanelHeader.tsx      # Eyebrow + title with bottom hairline
│   │   │   ├── StripeDivider.tsx    # 32px full-bleed hatched stripe divider
│   │   │   ├── Dimension.tsx        # Technical dimension annotations with arrows
│   │   │   ├── HandwrittenNote.tsx  # Caveat margin notes with hand-drawn SVG arrows
│   │   │   ├── SiteHeader.tsx       # Pixel CP monogram + nav + search + theme toggle
│   │   │   ├── HeroBlueprint.tsx    # Blueprint hero with avatar, angle, dimensions
│   │   │   ├── NumbersPanel.tsx     # Hackathon & architecture metrics
│   │   │   ├── ExperiencePanel.tsx  # Barclays summer internship & timeline
│   │   │   ├── ProjectsPanel.tsx    # SAR Generator, ValidEDI, ARTHIX
│   │   │   ├── AchievementsPanel.tsx# 9 recognitions with expandable toggle
│   │   │   ├── EducationPanel.tsx   # PICT Pune and IIT Madras entries
│   │   │   ├── StackPanel.tsx       # Grouped skill cells with hairline grid
│   │   │   ├── ContributionsPanel.tsx # 52-week client-side GitHub contribution grid
│   │   │   ├── ResumePanel.tsx      # View / download with dynamic status check
│   │   │   ├── ContactPanel.tsx     # Email copy button + direct mail + socials
│   │   │   └── CommandMenu.tsx      # cmdk search palette for sections & actions
│   │   └── game/topping-out/        # "Topping Out V2" isometric stacking game
│   │       ├── engine.ts            # Slicing physics, combos, regrowth, state machine
│   │       ├── render.ts            # Isometric canvas renderer (solid blocks, windows, crane, landmarks)
│   │       ├── palettes.ts          # Color palettes (Rainbow, Dusk, Mint, Mono) & unlock thresholds
│   │       ├── landmarks.ts         # Real-world landmark heights & humorous lines
│   │       ├── audio.ts             # Web Audio API sound synthesizer (tones, whoosh, chords)
│   │       ├── constants.ts         # Physics, dimensions, timings, storage keys
│   │       ├── ToppingOutOverlay.tsx# Full-screen overlay playing over website with 30% dim layer
│   │       └── ToppingOut.tsx       # Game component, solid HUD chips, game over card, Web Share
│   └── content/
│       └── site.ts                  # Typed site configuration and resume facts
```

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `⌘ K` or `Ctrl + K` | Open the command palette |
| `/` | Quick-search sections and actions |
| `G` | Toggle "Topping Out" isometric stacking game |
| `Space` / `Click` | Drop slab in Topping Out |
| `P` | Pause / Resume game |
| `M` | Toggle game audio mute |
| `ESC` | Close overlay dialogs / command palette |

---

## Deployment to Vercel

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. The build settings are auto-detected (`npm run build`, output directory `out`).
4. Zero environment variables required. Click **Deploy**.
