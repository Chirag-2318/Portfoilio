// Server-only usage: this file must only be imported from server components.
// It checks the filesystem at build time for static export.

import fs from "node:fs";
import path from "node:path";

export function getAssets(): { hasPhoto: boolean; hasResume: boolean } {
  const publicDir = path.join(process.cwd(), "public");
  const photoCandidates = ["chirag.jpg", "chirag.jfif", "chirag.jpeg", "chirag.png", "chirag.webp"];
  const hasPhoto = photoCandidates.some((file) => fs.existsSync(path.join(publicDir, "images", file)));
  const hasResume = fs.existsSync(path.join(publicDir, "Chirag_Patil_Resume.pdf"));

  return {
    hasPhoto,
    hasResume,
  };
}

