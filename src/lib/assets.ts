// Server-only usage: this file must only be imported from server components.
// It checks the filesystem at build time for static export.

import fs from "node:fs";
import path from "node:path";

export function getAssets(): { hasPhoto: boolean; hasResume: boolean } {
  const publicDir = path.join(process.cwd(), "public");
  const hasPhoto = fs.existsSync(path.join(publicDir, "images", "chirag.jpg"));
  const hasResume = fs.existsSync(path.join(publicDir, "Chirag_Patil_Resume.pdf"));

  return {
    hasPhoto,
    hasResume,
  };
}

