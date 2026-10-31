import fs from 'node:fs';
import path from 'node:path';
import { getIconData } from '@iconify/utils';

// Load icon sets
const logos = JSON.parse(fs.readFileSync('./node_modules/@iconify-json/logos/icons.json', 'utf8'));
const devicon = JSON.parse(fs.readFileSync('./node_modules/@iconify-json/devicon/icons.json', 'utf8'));
const simpleIcons = JSON.parse(fs.readFileSync('./node_modules/@iconify-json/simple-icons/icons.json', 'utf8'));
const lobeIcons = JSON.parse(
  fs.readFileSync('./node_modules/@proj-airi/lobe-icons/dist/icons.json', 'utf8')
);

const SETS = {
  logos,
  devicon,
  'simple-icons': simpleIcons,
  'lobe-icons': lobeIcons,
};

// Tech definitions to verify
const TECH_REGISTRY_SPECS = [
  { id: 'java', name: 'Java', set: 'logos', icon: 'java' },
  { id: 'kotlin', name: 'Kotlin', set: 'logos', icon: 'kotlin-icon' },
  { id: 'python', name: 'Python', set: 'logos', icon: 'python' },
  { id: 'cpp', name: 'C++', set: 'logos', icon: 'c-plusplus' },
  { id: 'sql', name: 'SQL', isMonoGlyph: true },
  { id: 'spring', name: 'Spring (Boot, Framework, Security)', set: 'logos', icon: 'spring-icon', note: 'Shown as ONE tile in Stack' },
  { id: 'spring-boot', name: 'Spring Boot', set: 'logos', icon: 'spring-icon' },
  { id: 'servlets', name: 'Servlets', set: 'logos', icon: 'java', note: 'Parent-brand mapping: Java' },
  { id: 'jpa', name: 'JPA / Hibernate', set: 'devicon', icon: 'hibernate', note: 'Parent-brand mapping: Hibernate' },
  { id: 'fastapi', name: 'FastAPI', set: 'logos', icon: 'fastapi-icon' },
  { id: 'jetpack-compose', name: 'Jetpack Compose', set: 'devicon', icon: 'jetpackcompose' },
  { id: 'hilt', name: 'Hilt', set: 'logos', icon: 'android-icon', note: 'Parent-brand mapping: Android' },
  { id: 'mysql', name: 'MySQL', set: 'logos', icon: 'mysql-icon' },
  { id: 'postgresql', name: 'PostgreSQL', set: 'logos', icon: 'postgresql' },
  { id: 'room', name: 'Room', set: 'logos', icon: 'android-icon', note: 'Parent-brand mapping: Android' },
  { id: 'sqlcipher', name: 'SQLCipher', set: 'devicon', icon: 'sqlite', note: 'Parent-brand mapping: SQLite' },
  { id: 'aws-s3', name: 'AWS S3', set: 'logos', icon: 'aws-s3' },
  { id: 'aws-rds', name: 'AWS RDS', set: 'logos', icon: 'aws-rds' },
  { id: 'git', name: 'Git', set: 'logos', icon: 'git-icon' },
  { id: 'github', name: 'GitHub', set: 'logos', icon: 'github-icon', invertOnDark: true },
  { id: 'maven', name: 'Maven', set: 'logos', icon: 'maven' },
  { id: 'gradle', name: 'Gradle', set: 'logos', icon: 'gradle' },
  { id: 'intellij-idea', name: 'IntelliJ IDEA', set: 'logos', icon: 'intellij-idea' },
  { id: 'android-studio', name: 'Android Studio', set: 'devicon', icon: 'androidstudio' },
  { id: 'postman', name: 'Postman', set: 'logos', icon: 'postman-icon' },
  { id: 'jwt', name: 'JWT', set: 'simple-icons', icon: 'jsonwebtokens', invertOnDark: true },
  { id: 'sqlalchemy', name: 'SQLAlchemy', set: 'devicon', icon: 'sqlalchemy' },
  { id: 'firebase', name: 'Firebase', set: 'logos', icon: 'firebase' },
  { id: 'groq', name: 'Groq', set: 'lobe-icons', icon: 'groq' },
  { id: 'mlkit', name: 'ML Kit', set: 'logos', icon: 'google-icon', note: 'Parent-brand mapping: Google' },
  { id: 'whisper', name: 'Whisper (ONNX)', set: 'lobe-icons', icon: 'openai', invertOnDark: true, note: 'Parent-brand mapping: OpenAI' },
  // New technologies for Brackit & Autonomous AI QA Engineer
  { id: 'react', name: 'React', set: 'logos', icon: 'react' },
  { id: 'react-19', name: 'React 19', set: 'logos', icon: 'react' },
  { id: 'typescript', name: 'TypeScript', set: 'logos', icon: 'typescript-icon' },
  { id: 'flyway', name: 'Flyway', set: 'devicon', icon: 'flyway' },
  { id: 'docker', name: 'Docker', set: 'logos', icon: 'docker-icon' },
  { id: 'tailwind', name: 'Tailwind CSS', set: 'logos', icon: 'tailwindcss-icon' },
  { id: 'vite', name: 'Vite', set: 'logos', icon: 'vitejs' },
  { id: 'github-api', name: 'GitHub API', set: 'logos', icon: 'github-icon', invertOnDark: true },
  { id: 'spring-security', name: 'Spring Security', set: 'logos', icon: 'spring-icon' },
  { id: 'oauth2', name: 'OAuth2', isMonoGlyph: true, note: 'Neutral key glyph' },
  { id: 'groq-ai', name: 'Groq AI (Llama 3.3)', set: 'lobe-icons', icon: 'groq' },
  { id: 'nextjs', name: 'Next.js', set: 'logos', icon: 'nextjs-icon', invertOnDark: true },
  { id: 'playwright', name: 'Playwright', set: 'logos', icon: 'playwright' },
  { id: 'langgraph', name: 'LangGraph', set: 'lobe-icons', icon: 'langgraph' },
  { id: 'sqlite', name: 'SQLite', set: 'logos', icon: 'sqlite' },
  { id: 'pydantic', name: 'Pydantic', set: 'simple-icons', icon: 'pydantic' },
  { id: 'openapi', name: 'OpenAPI', set: 'logos', icon: 'openapi-icon' },
  { id: 'java-25', name: 'Java 25', set: 'logos', icon: 'java' },
  { id: 'sse', name: 'SSE', isNeutralChip: true },
  { id: 'llms', name: 'LLMs', isNeutralChip: true },
  { id: 'alembic', name: 'Alembic', isNeutralChip: true },
];

let hasError = false;
const resolvedRegistry = {};

console.log('Verifying technology icons against installed icon sets...\n');

for (const spec of TECH_REGISTRY_SPECS) {
  if (spec.isNeutralChip) {
    console.log(`[OK]      ${spec.id.padEnd(18)} -> Neutral Chip "${spec.name}"`);
    resolvedRegistry[spec.id] = {
      id: spec.id,
      name: spec.name,
      isNeutralChip: true,
      note: spec.note,
    };
    continue;
  }

  if (spec.isMonoGlyph) {
    console.log(`[OK]      ${spec.id.padEnd(18)} -> Mono Glyph "${spec.name}"`);
    resolvedRegistry[spec.id] = {
      id: spec.id,
      name: spec.name,
      isMonoGlyph: true,
      note: spec.note,
    };
    continue;
  }

  const setObj = SETS[spec.set];
  if (!setObj) {
    console.error(`[MISSING] ${spec.id.padEnd(18)} -> Unknown set "${spec.set}"`);
    hasError = true;
    continue;
  }

  const rawIconData = getIconData(setObj, spec.icon);
  if (!rawIconData) {
    console.error(`[MISSING] ${spec.id.padEnd(18)} -> ${spec.set}:${spec.icon}`);
    hasError = true;
  } else {
    console.log(`[OK]      ${spec.id.padEnd(18)} -> ${spec.set}:${spec.icon} (${spec.name})`);
    // Extract only standard IconifyIcon fields to avoid extraneous properties like `hidden: true`
    const iconData = {
      body: rawIconData.body,
      ...(rawIconData.width !== undefined && { width: rawIconData.width }),
      ...(rawIconData.height !== undefined && { height: rawIconData.height }),
      ...(rawIconData.left !== undefined && { left: rawIconData.left }),
      ...(rawIconData.top !== undefined && { top: rawIconData.top }),
      ...(rawIconData.rotate !== undefined && { rotate: rawIconData.rotate }),
      ...(rawIconData.hFlip !== undefined && { hFlip: rawIconData.hFlip }),
      ...(rawIconData.vFlip !== undefined && { vFlip: rawIconData.vFlip }),
    };

    resolvedRegistry[spec.id] = {
      id: spec.id,
      name: spec.name,
      icon: iconData,
      invertOnDark: spec.invertOnDark || false,
      note: spec.note,
    };
  }
}

if (hasError) {
  console.error('\nIcon verification failed! Some icons are missing.');
  process.exit(1);
}

// Generate src/lib/tech-icons.ts with only the resolved icon data
const fileContent = `// Auto-generated by scripts/verify-icons.mjs
// Contains only the icons actually used across Stack and Projects (bundle-friendly, offline)

import type { IconifyIcon } from "@iconify/react";

export type TechId =
${TECH_REGISTRY_SPECS.map((s) => `  | "${s.id}"`).join('\n')};

export interface TechItem {
  id: TechId;
  name: string;
  icon?: IconifyIcon;
  isMonoGlyph?: boolean;
  isNeutralChip?: boolean;
  invertOnDark?: boolean;
  note?: string;
}

export const TECH: Record<TechId, TechItem> = ${JSON.stringify(resolvedRegistry, null, 2)};
`;

const outputPath = path.resolve('src/lib/tech-icons.ts');
fs.writeFileSync(outputPath, fileContent, 'utf8');

console.log(`\nAll ${TECH_REGISTRY_SPECS.length} icons verified successfully.`);
console.log(`Registry written to ${outputPath} (${(Buffer.byteLength(fileContent) / 1024).toFixed(1)} KB)`);
process.exit(0);
