import type { TechId } from "@/lib/tech-icons";

export const PLACEHOLDER_HOST = "replace-me.invalid";
export const isPlaceholder = (url: string) => url.includes(PLACEHOLDER_HOST);

export type ProjectCategory = "Full-stack" | "Backend" | "Android";
export type ProjectPatternType = "dither" | "braille" | "contour";

export type Project = {
  id: "brackit" | "qa" | "arthix" | "validedi" | "sar";
  name: string;
  title: string;
  subtitle: string;
  category: ProjectCategory;
  period?: string;
  year?: string;
  context?: string;
  summary: string;
  bullets: string[];
  techs: TechId[];
  stack?: string[];
  image: string;
  monogram: string;
  pattern: ProjectPatternType;
  cover?: string;
  coverAlt?: string;
  links: {
    github: string | null;
    live: string | null;
  };
};

export const site = {
  url: "https://chiragpatil.dev",
  name: { full: "Chirag Patil", first: "Chirag", last: "Patil" },
  role: "Engineering student & developer",
  location: { city: "Pune", region: "Maharashtra", country: "India", timeZone: "Asia/Kolkata" },
  email: "chirag23nzr@gmail.com",
  phone: { display: "+91 80806 45366", href: "tel:+918080645366" },
  links: {
    githubUsername: "Chirag-2318",
    linkedinUrl: "https://www.linkedin.com/in/chirag-patil-593972374",
    seeMoreProjects: "https://github.com/Chirag-2318?tab=repositories",
    brackit: {
      github: "https://github.com/Chirag-2318/hackathon-os",
      live: "https://brackitos.vercel.app/",
    },
    qa: {
      github: "https://github.com/Aeterio04/vithackie",
      live: null as string | null,
    },
    arthix: {
      github: "https://github.com/Chirag-2318/ARTHIX",
      live: null as string | null,
    },
    validedi: {
      github: "https://github.com/Chirag-2318/Valid_EDI",
      live: null as string | null,
    },
    sarGenerator: {
      github: "https://github.com/Chirag-2318/SAR_Generator",
      live: null as string | null,
    },
  },
  socials: {
    github: { label: "GitHub", url: "https://github.com/Chirag-2318" },
    linkedin: { label: "LinkedIn", url: "https://www.linkedin.com/in/chirag-patil-593972374" },
  },
  assets: {
    photo: "/images/chirag.jpg",
    photoAlt: "Portrait of Chirag Patil",
    resume: "/Chirag_Patil_Resume.pdf",
  },
  nav: [
    { href: "/", label: "Home", index: "01" },
    { href: "/work", label: "Work", index: "02" },
    { href: "/about", label: "About", index: "03" },
    { href: "/resume", label: "Resume", index: "04" },
    { href: "/contact", label: "Contact", index: "05" },
  ],
  home: {
    tagline: "Backend and Android developer. Hackathon winner.",
    taglines: [
      "Fluent in Java, Kotlin and chai.",
      "Turns coffee into stack traces.",
      "Pune traffic taught me patience. Production taught me panic.",
      "Ctrl+Z is my love language.",
      "It works on my machine. Let me check yours.",
      "Off-by-one errors are my spirit animal.",
      "I read the docs. Eventually. Under pressure.",
      "Naming things is hard. I do it anyway.",
      "Writes code. Sometimes even on purpose.",
      "Ships first, apologises to the linter later.",
    ],
    githubUsername: "Chirag-2318",
    kicker: "Engineering student & developer — Pune, India",
    taglineA: "I do the task.",
    taglineB: "Then I take it further.",
    draftNote: "// next: take it further",
    intro: "Second-year at PICT and IIT Madras. I build backends, Android apps and the occasional hackathon prototype.",
    ctaPrimary: { label: "See the work", href: "/work" },
    ctaSecondary: { label: "Get in touch", href: "/contact" },
    index: [
      { key: "now", label: "Now", value: "Barclays Summer Intern (upcoming)", href: "/about#highlights" },
      { key: "built", label: "Built", value: "Brackit · QA · ARTHIX · ValidEDI · SAR", href: "/work" },
      { key: "won", label: "Won", value: "Winner, COEP Inspiron · Top 7, iQOO Hackathon", href: "/about#highlights" },
      { key: "study", label: "Study", value: "PICT Pune · IIT Madras, 2024–2028", href: "/about#education" },
      { key: "based", label: "Based", value: "Pune, Maharashtra, India" },
      { key: "reach", label: "Reach", value: "chirag23nzr@gmail.com", copy: true },
    ] as { key: string; label: string; value: string; href?: string; copy?: boolean }[],
  },
  about: {
    profile:
      "I'm a second-year engineering student in Pune, studying Electronics and Telecommunication at PICT and Data Science and Programming at IIT Madras. I write Java, Kotlin and Python, mostly backends and Android apps, and I like the version of a task that comes after it already works.",
    facts: [
      { label: "Based in", value: "Pune, Maharashtra, India" },
      { label: "Studying", value: "B.Tech E&TC · B.Sc Data Science" },
      { label: "Next", value: "Barclays Summer Intern (upcoming)" },
      { label: "Member", value: "Computer Society of India, PICT" },
    ],
  },
  education: [
    {
      institution: "Pune Institute of Computer Technology (PICT)",
      degree: "Bachelor of Technology (B.Tech)",
      field: "Electronics and Telecommunication Engineering",
      years: "2024 — 2028",
    },
    {
      institution: "Indian Institute of Technology Madras (IIT Madras)",
      degree: "Bachelor of Science (B.Sc)",
      field: "Data Science and Programming",
      years: "2024 — 2028",
    },
  ],
  skills: [
    {
      group: "Languages",
      techs: ["java", "kotlin", "python", "cpp", "sql"] as TechId[],
      items: ["Java", "Kotlin", "Python", "C++", "SQL"],
    },
    {
      group: "Frameworks",
      techs: ["spring", "servlets", "jpa", "fastapi", "jetpack-compose", "hilt"] as TechId[],
      items: ["Spring (Boot, Framework, Security)", "Servlets", "JPA / Hibernate", "FastAPI", "Jetpack Compose", "Hilt"],
    },
    {
      group: "Databases",
      techs: ["mysql", "postgresql", "room", "sqlcipher"] as TechId[],
      items: ["MySQL", "PostgreSQL", "Room", "SQLCipher"],
    },
    {
      group: "Cloud and tools",
      techs: ["aws-s3", "aws-rds", "git", "github", "maven", "gradle", "intellij-idea", "android-studio", "postman"] as TechId[],
      items: ["AWS S3", "AWS RDS", "Git", "GitHub", "Maven", "Gradle", "IntelliJ IDEA", "Android Studio", "Postman"],
    },
  ],
  achievements: [
    {
      id: "barclays",
      label: "Internship",
      title: "Barclays Summer Intern",
      status: "Upcoming",
      detail: "Selected for Barclays' Internship Program after clearing the Hack-O-Hire hackathon round and the subsequent interview process.",
    },
    {
      id: "hackathons",
      label: "Hackathons",
      title: "Winner, Top 7, Finalist",
      detail: "",
      results: [
        { rank: "Winner", where: "COEP Inspiron" },
        { rank: "Top 7", where: "iQOO Hackathon" },
        { rank: "Finalist", where: "Barclays Hack-O-Hire" },
        { rank: "Finalist", where: "Tata Motors COEP MindSpark '25" },
        { rank: "Finalist", where: "PISB Techrush 2025" },
      ],
    },
    {
      id: "nda",
      label: "Services",
      title: "NDA written exam and SSB Stage 1",
      detail: "Cleared the National Defence Academy (NDA) written examination (UPSC) and Stage 1 of the Services Selection Board (SSB).",
    },
    {
      id: "debate",
      label: "Debate",
      title: "National-level debater",
      detail: "Represented my institution at national-level debate competitions.",
    },
    {
      id: "csi",
      label: "Community",
      title: "Member, Computer Society of India (CSI), PICT Pune",
      detail: "Active in coding contests and workshops.",
    },
  ] as {
    id: string; label: string; title: string; detail: string; status?: string;
    results?: { rank: string; where: string }[];
  }[],
  projects: [
    {
      id: "brackit",
      name: "Brackit",
      title: "Brackit",
      subtitle: "Hackathon Execution Operating System",
      category: "Full-stack",
      summary:
        "AI-powered, real-time team platform that manages the hackathon lifecycle from problem analysis to final submission.",
      bullets: [
        "Built a full-stack hackathon execution platform using Spring Boot and React, featuring structured team workspaces, role-based access, real-time synchronization using Server-Sent Events (SSE), and GitHub/Google OAuth2 authentication.",
        "Developed an AI-powered workflow using Groq Llama models for automated problem statement analysis, rubric extraction, idea evaluation, and generation of PRDs, technical architectures, and 38-task Kanban backlogs.",
        "Engineered collaborative development tools including a phase-driven Kanban board, GitHub integration, MVP Reality Ledger, Mermaid-based architecture editor, pitch rehearsal with live audio waveform visualization, and submission readiness tracking.",
      ],
      techs: [
        "spring-boot",
        "java-25",
        "react-19",
        "typescript",
        "postgresql",
        "flyway",
        "groq-ai",
        "sse",
        "spring-security",
        "oauth2",
        "github-api",
        "docker",
        "tailwind",
        "vite",
      ],
      stack: [
        "Spring Boot",
        "Java 25",
        "React 19",
        "TypeScript",
        "PostgreSQL",
        "Flyway",
        "Groq AI (Llama 3.3)",
        "SSE",
        "Spring Security",
        "OAuth2",
        "GitHub API",
        "Docker",
        "Tailwind CSS",
        "Vite",
      ],
      image: "/projects/brackit.png",
      monogram: "BK",
      pattern: "dither",
      links: {
        github: "https://github.com/Chirag-2318/hackathon-os",
        live: "https://brackitos.vercel.app/",
      },
    },
    {
      id: "qa",
      name: "Autonomous AI QA Engineer",
      title: "Autonomous AI QA Engineer",
      subtitle: "AI-Powered Software Testing Platform",
      category: "Full-stack",
      summary:
        "AI-driven QA platform that explores web apps, generates and runs Playwright tests, and verifies bugs with automated replays.",
      bullets: [
        "Built an AI-powered testing platform using FastAPI and LangGraph, integrating intelligent agents for application exploration, test planning, Playwright script generation, and automated bug analysis.",
        "Developed an automated browser testing engine using Playwright and TypeScript, capturing screenshots, videos, execution traces, console errors, and network failures, with a 3-replay verification mechanism to distinguish confirmed bugs from flaky failures.",
        "Engineered a full-stack dashboard with Next.js and React for test catalog management, live execution monitoring, bug triaging, evidence inspection, and automated reporting, backed by REST APIs, SQLite persistence, and OpenAPI contracts.",
      ],
      techs: [
        "python",
        "fastapi",
        "nextjs",
        "react",
        "typescript",
        "playwright",
        "langgraph",
        "llms",
        "groq",
        "sqlite",
        "pydantic",
        "openapi",
        "alembic",
        "tailwind",
        "docker",
      ],
      stack: [
        "Python",
        "FastAPI",
        "Next.js",
        "React",
        "TypeScript",
        "Playwright",
        "LangGraph",
        "LLMs",
        "Groq",
        "SQLite",
        "Pydantic",
        "OpenAPI",
        "Alembic",
        "Tailwind CSS",
        "Docker",
      ],
      image: "/projects/qa.png",
      monogram: "QA",
      pattern: "contour",
      links: {
        github: "https://github.com/Aeterio04/vithackie",
        live: null,
      },
    },
    {
      id: "arthix",
      name: "ARTHIX",
      title: "ARTHIX",
      subtitle: "Zero-Typing UPI Expense Tracker",
      period: "2026",
      year: "2026",
      context: "iQOO Hackathon 2026, FinTech and Commerce",
      category: "Android",
      summary: "Zero-typing UPI expense tracker, fully on-device.",
      bullets: [
        "Built a fully on-device Android expense tracker that logs UPI spends with no typing: bank/UPI notifications (NotificationListenerService) supply the exact amount and payee, while a phone shake supplies the category.",
        "Designed a nearest-neighbour reconciliation engine (120 s symmetric window) pairing shakes and notifications in either order; all amounts stored as Long paise to avoid floating-point errors.",
        "Privacy-first design: no backend, AES-256 SQLCipher-encrypted Room DB, bounded accelerometer window for battery; LLM-phrased reports validated against deterministic math, plus offline Whisper voice splitting and ML Kit OCR.",
      ],
      techs: ["kotlin", "jetpack-compose", "room", "sqlcipher", "hilt", "mlkit", "whisper"],
      stack: ["Kotlin", "Jetpack Compose", "Room", "SQLCipher", "Hilt", "ML Kit", "Whisper (ONNX)"],
      image: "/projects/arthix.png",
      monogram: "AR",
      pattern: "braille",
      links: {
        github: "https://github.com/Chirag-2318/ARTHIX",
        live: null,
      },
    },
    {
      id: "validedi",
      name: "ValidEDI",
      title: "ValidEDI",
      subtitle: "Healthcare EDI Parser and Validator",
      period: "2025",
      year: "2025",
      category: "Backend",
      summary: "Healthcare EDI parser and validator.",
      bullets: [
        "Built an async FastAPI platform to process X12 HIPAA EDI transactions (837/835/834) with custom parsing, loop hierarchy construction and 50+ validation rules.",
        "Implemented Firebase JWT-based RBAC with 6 roles; integrated AWS S3 and PostgreSQL (JSONB, async ORM) for scalable storage and batch processing, with AI-powered EDI analysis via Groq Llama 3.3.",
      ],
      techs: ["fastapi", "postgresql", "sqlalchemy", "firebase", "aws-s3", "groq"],
      stack: ["FastAPI", "PostgreSQL", "SQLAlchemy", "Firebase", "AWS S3", "Groq"],
      image: "/projects/validedi.png",
      monogram: "VE",
      pattern: "dither",
      links: {
        github: "https://github.com/Chirag-2318/Valid_EDI",
        live: null,
      },
    },
    {
      id: "sar",
      name: "SAR Generator with Audit Trails",
      title: "SAR Generator with Audit Trails",
      subtitle: "Suspicious Activity Report generation",
      category: "Backend",
      summary: "Automated Suspicious Activity Report generation with role-based access.",
      bullets: [
        "Built a Spring Boot backend for automated Suspicious Activity Report (SAR) generation with RESTful APIs, JWT-based authentication and Role-Based Access Control (RBAC) for Analyst, Admin and Auditor roles.",
        "Designed a scalable data ingestion pipeline for CSV and JSON files, integrating AWS S3 for secure storage and managing 15+ relational entities using PostgreSQL and JPA (Hibernate).",
        "Integrated AI-powered analysis via a Python microservice for SAR narrative generation, typology detection and end-to-end compliance workflows; implemented audit logging and a DTO-based architecture for data integrity.",
      ],
      techs: ["spring-boot", "java", "postgresql", "aws-s3", "jwt", "jpa", "python"],
      stack: ["Spring Boot", "Java", "PostgreSQL", "AWS S3", "JWT", "JPA / Hibernate", "Python"],
      image: "/projects/sar.png",
      monogram: "SA",
      pattern: "contour",
      links: {
        github: "https://github.com/Chirag-2318/SAR_Generator",
        live: null,
      },
    },
  ] as Project[],
} as const;

export type Site = typeof site;
