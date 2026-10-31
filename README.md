# Chirag Patil Portfolio — "Second Pass"

A personal portfolio website for Chirag Patil, 2nd-year engineering student and developer in Pune, Maharashtra, India. Built with Next.js (App Router, static export), TypeScript, Tailwind CSS v4, and Motion.

## Commands

- `npm run dev`: Start the local development server at `http://localhost:3000`
- `npm run build`: Build and export the static site to the `out/` directory
- `npm run lint`: Run ESLint checks

## Three Hand-Supplied Items

The site is designed to look finished and fully functional out of the box, with built-in fallbacks. Before production deployment, provide:

1. **Portrait Photo**: Place an image at `public/images/chirag.jpg`. Detected at build time via `src/lib/assets.ts`.
2. **Resume PDF**: Place the resume file at `public/Chirag_Patil_Resume.pdf`. Detected at build time via `src/lib/assets.ts`.
3. **Social and Site URLs**: Update the placeholder URLs in `src/content/site.ts`:
   - `site.url`: The canonical production URL (e.g. `https://chiragpatil.dev`)
   - `site.socials.github.url`: GitHub profile link
   - `site.socials.linkedin.url`: LinkedIn profile link
