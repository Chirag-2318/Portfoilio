# PROJECT CONTEXT — Chirag Patil portfolio

## Who
Chirag Patil, 2nd-year engineering student and developer, Pune, Maharashtra, India.
Email: chirag23nzr@gmail.com · Phone: +91 8080645366 · LinkedIn and GitHub exist, URLs are placeholders in src/content/site.ts.

## Goal of the site
A portfolio that is not "just a portfolio". It presents Chirag as a creative person who, when he takes up a task, does it and then takes it to the next level. A visitor must understand within seconds who he is, what he does, what he has done and how to reach him, and must feel the care of a thoughtful graphic designer, not the output of an AI tool.

## Facts (the ONLY facts that may be used)
Education
- Pune Institute of Computer Technology (PICT), Pune. B.Tech, Electronics and Telecommunication Engineering, 2024–2028.
- Indian Institute of Technology Madras (IIT Madras). B.Sc, Data Science and Programming, 2024–2028.

Technical skills
- Languages: Java, Kotlin, Python, C++, SQL
- Frameworks: Spring Boot, Spring Framework, Spring Security, Servlets, JPA, FastAPI, Jetpack Compose, Hilt
- Databases: MySQL, PostgreSQL, Room, SQLCipher
- Cloud and tools: AWS S3, AWS RDS, Git, GitHub, Maven, Gradle, IntelliJ IDEA, Android Studio, Postman

Projects
1. SAR Generator with Audit Trails (hackathon project). Stack: Spring Boot, Java, PostgreSQL, AWS S3, JWT, Python (AI microservice).
 - Built a Spring Boot backend for automated Suspicious Activity Report (SAR) generation with RESTful APIs, JWT-based authentication and Role-Based Access Control (RBAC) for Analyst, Admin and Auditor roles.
 - Designed a scalable data ingestion pipeline for CSV and JSON files, integrating AWS S3 for secure storage and managing 15+ relational entities using PostgreSQL and JPA (Hibernate).
 - Integrated AI-powered analysis via a Python microservice for SAR narrative generation, typology detection and end-to-end compliance workflows; implemented audit logging and a DTO-based architecture for data integrity.
2. ValidEDI, Healthcare EDI Parser and Validator (2025, hackathon project). Stack: FastAPI, PostgreSQL, SQLAlchemy, Firebase, AWS S3, Groq LLM.
 - Built an async FastAPI platform to process X12 HIPAA EDI transactions (837/835/834) with custom parsing, loop hierarchy construction and 50+ validation rules.
 - Implemented Firebase JWT-based RBAC with 6 roles; integrated AWS S3 and PostgreSQL (JSONB, async ORM) for scalable storage and batch processing, with AI-powered EDI analysis via Groq Llama 3.3.
3. ARTHIX, Zero-Typing UPI Expense Tracker (2026, iQOO Hackathon 2026, FinTech and Commerce). Stack: Kotlin, Jetpack Compose, Room + SQLCipher, Hilt, ML Kit, Whisper (ONNX).
 - Built a fully on-device Android expense tracker that logs UPI spends with no typing: bank/UPI notifications (NotificationListenerService) supply the exact amount and payee, while a phone shake supplies the category.
 - Designed a nearest-neighbour reconciliation engine (120 s symmetric window) pairing shakes and notifications in either order; all amounts stored as Long paise to avoid floating-point errors.
 - Privacy-first design: no backend, AES-256 SQLCipher-encrypted Room DB, bounded accelerometer window for battery; LLM-phrased reports validated against deterministic math, plus offline Whisper voice splitting and ML Kit OCR.

Achievements and activities
- Barclays Summer Intern (upcoming): selected for Barclays' Internship Program after clearing the Hack-O-Hire hackathon round and the subsequent interview process.
- Hackathons: Winner at COEP Inspiron; Top 7 at iQOO Hackathon; Finalist at Barclays Hack-O-Hire, Tata Motors COEP MindSpark '25 and PISB Techrush 2025.
- NDA and SSB: cleared the National Defence Academy (NDA) written examination (UPSC) and Stage 1 of the Services Selection Board (SSB).
- National-level debater: represented his institution at national-level debate competitions.
- Member, Computer Society of India (CSI), PICT Pune: active in coding contests and workshops.

Do NOT claim a project won or placed anywhere unless stated above. Specifically do not link ARTHIX or any project to a hackathon RESULT; results appear only in the Hackathons achievement.

## MUST
- Minimalist and clean like a well-designed editorial/print piece.
- Restrained, purposeful animation. Respect prefers-reduced-motion everywhere.
- Very little scrolling: home fits one viewport on desktop with no scroll; other content is reached through navigation, tabs, panels. Any view that scrolls is at most ~1.5–2 screens.
- Typography does the heavy lifting; strict grid; generous white space; one background, one ink, one accent used sparingly; designed (not inverted) dark mode.
- One signature idea: "Second Pass" (see DESIGN.md).
- Frontend only (Next.js App Router + TypeScript + Tailwind + Motion), static export, Vercel.
- Content lives in src/content/site.ts. Social URLs, photo path, resume path are placeholders defined once there.
- Responsive 320px to large desktop, keyboard accessible, visible focus, semantic HTML, WCAG AA in both themes, no layout shift.
- Lighthouse 95+ (Performance, Accessibility, Best Practices, SEO).

## MUST NOT
- Never theme the site or the game on Chirag's projects or interests (no UPI/finance, healthcare, compliance, military, debate, etc.). Projects are CONTENT, not the concept.
- Not futuristic, sci-fi, neon, cyberpunk or "funky".
- No AI-site clichés: purple-blue gradients, glowing blobs, glassmorphism, emoji as icons, "Hi, I'm..." wave hero, three identical feature cards, stock illustrations, everything centred, floating orbs, heavy shadows, lorem ipsum, fake testimonials/statistics/skill-percentage bars.
- No backend, auth, API keys, or analytics.
- No invented facts.

## Things the owner supplies by hand (single placeholders)
1. Photo at /public/images/chirag.jpg (detected at build time; site looks finished without it)
2. Resume at /public/Chirag_Patil_Resume.pdf (detected at build time)
3. Social URLs (GitHub, LinkedIn) and the site URL in src/content/site.ts


## Redesign
The site is now the Blueprint Grid single-page design described in /docs/REDESIGN_SPEC.md.
All earlier visual decisions in /docs/DESIGN.md are superseded by /docs/REDESIGN_SPEC.md.

### Prompt 2: Complete Implementation
- Fully implemented all sections: Pre-hero 768 Dimension Bar, Hero Blueprint, Overview, Socials, Contributions (conditional), About, IN NUMBERS, Experience, Projects, Achievements, Education, Stack, Resume, Contact, and Footer.
- Full-bleed 32px StripeDividers placed between section groups per specification.
- Handwritten Caveat notes with SVG arrows on wide screens pointing inwards at grid hairlines.
- 404 page created featuring the playable Registration mini-game inline with hatched border frame and return link.
- Command menu (`cmdk`) wired to all single-page anchors, external links, and actions.
- Original CP pixel monogram and blueprint drawing utilized for `icon.tsx`, `apple-icon.tsx`, and `opengraph-image.tsx`.
- Responsive layout verified across mobile (390px), tablet (768px), and desktop (1440px) in both dark and light modes.
- Static export build passes cleanly with zero errors.

### Originality Pass (branch: `design/originality`)
- Overhauled the Blueprint Grid layout with 11 signature details establishing a distinct identity for Chirag Patil.
- Added Instrument Serif typography for all titles and headings; Geist Sans and Mono retained for text and meta.
- Added warm redline `--accent` token (`#ff5a2c` dark, `#e8441a` light, `#ffd166` blueprint) used strictly for drawing marks, pins, crosshairs, active states, and selection.
- Built engineer's ruler dividers (32px, 0–768 numerals) replacing diagonal stripe bands.
- Added 9px registration crosshairs (`RegMark.tsx`) at vertical-horizontal hairline intersections.
- Added 160px square ID-frame avatar badge with drafting corner crop marks and dimension.
- Enhanced hero with interactive CAD crosshairs, live coordinates, 1–5 callout pins, Web Audio synthesized blips, and drafting title block.
- Converted "In numbers" into a formal technical drawing "Bill of materials" table.
- Added drawing sheet numbers (`SHEET 01 / 09` through `SHEET 09 / 09`), project indexing (`P-01` to `P-03`), and a fixed left-gutter scroll ruler.
- Added dynamic header breadcrumb `"/ [section]"` opening cmdk, and redline accent handwritten notes.
- Added full third theme "Blueprint" (`#0a2b5c` cyanotype background, `#ffd166` gold accent) with 3-state cycling toggle.
- Formatted greeting as a technical cover note with self-drawing accent underline.

