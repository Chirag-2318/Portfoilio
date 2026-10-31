export const PLACEHOLDER_HOST = "replace-me.invalid";
export const isPlaceholder = (url: string) => url.includes(PLACEHOLDER_HOST);

export type Project = {
  id: "sar" | "validedi" | "arthix";
  index: string;
  title: string;
  kind: string;          // short meta line
  year?: string;
  context?: string;      // event/track, only when stated in the facts
  summary: string;       // 2–3 punchy lines
  bullets: string[];     // full details, verbatim facts
  stack: string[];
};

export const site = {
  url: `https://${PLACEHOLDER_HOST}`, // PLACEHOLDER: set to the real Vercel/custom URL
  name: { full: "Chirag Patil", first: "Chirag", last: "Patil" },
  role: "Engineering student & developer",
  location: { city: "Pune", region: "Maharashtra", country: "India", timeZone: "Asia/Kolkata" },
  email: "chirag23nzr@gmail.com",
  phone: { display: "+91 80806 45366", href: "tel:+918080645366" },
  socials: {
    github: { label: "GitHub", url: `https://${PLACEHOLDER_HOST}/github` },     // PLACEHOLDER
    linkedin: { label: "LinkedIn", url: `https://${PLACEHOLDER_HOST}/linkedin` }, // PLACEHOLDER
  },
  assets: {
    photo: "/images/chirag.jpg",                 // PLACEHOLDER file, detected at build time
    photoAlt: "Portrait of Chirag Patil",
    resume: "/Chirag_Patil_Resume.pdf",          // PLACEHOLDER file, detected at build time
  },
  nav: [
    { href: "/", label: "Home", index: "01" },
    { href: "/work", label: "Work", index: "02" },
    { href: "/about", label: "About", index: "03" },
    { href: "/resume", label: "Resume", index: "04" },
    { href: "/contact", label: "Contact", index: "05" },
  ],
  home: {
    kicker: "Engineering student & developer — Pune, India",
    taglineA: "I do the task.",
    taglineB: "Then I take it further.",
    draftNote: "// next: take it further",
    intro: "Second-year at PICT and IIT Madras. I build backends, Android apps and the occasional hackathon prototype.",
    ctaPrimary: { label: "See the work", href: "/work" },
    ctaSecondary: { label: "Get in touch", href: "/contact" },
    index: [
      { key: "now", label: "Now", value: "Barclays Summer Intern (upcoming)", href: "/about#highlights" },
      { key: "built", label: "Built", value: "SAR Generator · ValidEDI · ARTHIX", href: "/work" },
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
    { group: "Languages", items: ["Java", "Kotlin", "Python", "C++", "SQL"] },
    { group: "Frameworks", items: ["Spring Boot", "Spring Framework", "Spring Security", "Servlets", "JPA", "FastAPI", "Jetpack Compose", "Hilt"] },
    { group: "Databases", items: ["MySQL", "PostgreSQL", "Room", "SQLCipher"] },
    { group: "Cloud & tools", items: ["AWS S3", "AWS RDS", "Git", "GitHub", "Maven", "Gradle", "IntelliJ IDEA", "Android Studio", "Postman"] },
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
      id: "sar",
      index: "01",
      title: "SAR Generator with Audit Trails",
      kind: "Hackathon project",
      summary:
        "A Spring Boot backend that automates Suspicious Activity Report generation. Role-based access for Analyst, Admin and Auditor, with audit logging throughout. A Python AI microservice drafts the narratives.",
      bullets: [
        "Built a Spring Boot backend for automated Suspicious Activity Report (SAR) generation with RESTful APIs, JWT-based authentication and Role-Based Access Control (RBAC) for Analyst, Admin and Auditor roles.",
        "Designed a scalable data ingestion pipeline for CSV and JSON files, integrating AWS S3 for secure storage and managing 15+ relational entities using PostgreSQL and JPA (Hibernate).",
        "Integrated AI-powered analysis via a Python microservice for SAR narrative generation, typology detection and end-to-end compliance workflows; implemented audit logging and a DTO-based architecture for data integrity.",
      ],
      stack: ["Spring Boot", "Java", "PostgreSQL", "AWS S3", "JWT", "Python"],
    },
    {
      id: "validedi",
      index: "02",
      title: "ValidEDI — Healthcare EDI Parser and Validator",
      kind: "Hackathon project",
      year: "2025",
      summary:
        "An async FastAPI platform that parses and validates X12 HIPAA EDI transactions (837, 835, 834). 50+ validation rules, six access roles, and AI-assisted analysis through Groq Llama 3.3.",
      bullets: [
        "Built an async FastAPI platform to process X12 HIPAA EDI transactions (837/835/834) with custom parsing, loop hierarchy construction and 50+ validation rules.",
        "Implemented Firebase JWT-based RBAC with 6 roles; integrated AWS S3 and PostgreSQL (JSONB, async ORM) for scalable storage and batch processing, with AI-powered EDI analysis via Groq Llama 3.3.",
      ],
      stack: ["FastAPI", "PostgreSQL", "SQLAlchemy", "Firebase", "AWS S3", "Groq LLM"],
    },
    {
      id: "arthix",
      index: "03",
      title: "ARTHIX — Zero-Typing UPI Expense Tracker",
      kind: "Android app",
      year: "2026",
      context: "iQOO Hackathon 2026 · FinTech and Commerce",
      summary:
        "A fully on-device Android expense tracker that logs UPI spends with no typing. Notifications supply the amount and payee; a shake of the phone supplies the category. Private by design, with an encrypted local database.",
      bullets: [
        "Built a fully on-device Android expense tracker that logs UPI spends with no typing: bank/UPI notifications (NotificationListenerService) supply the exact amount and payee, while a phone shake supplies the category.",
        "Designed a nearest-neighbour reconciliation engine (120 s symmetric window) pairing shakes and notifications in either order; all amounts stored as Long paise to avoid floating-point errors.",
        "Privacy-first design: no backend, AES-256 SQLCipher-encrypted Room DB, bounded accelerometer window for battery; LLM-phrased reports validated against deterministic math, plus offline Whisper voice splitting and ML Kit OCR.",
      ],
      stack: ["Kotlin", "Jetpack Compose", "Room + SQLCipher", "Hilt", "ML Kit", "Whisper (ONNX)"],
    },
  ] as Project[],
} as const;

export type Site = typeof site;
