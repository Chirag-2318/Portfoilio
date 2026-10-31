import fs from "node:fs";
import path from "node:path";

function hexToRgb(hex) {
  const clean = hex.replace("#", "").trim();
  const num = parseInt(clean, 16);
  return [num >> 16, (num >> 8) & 0xff, num & 0xff];
}

function srgbToLinear(c) {
  const norm = c / 255;
  return norm <= 0.04045 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
}

function relativeLuminance([r, g, b]) {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Parse globals.css
const cssPath = path.join(process.cwd(), "src/app/globals.css");
const css = fs.readFileSync(cssPath, "utf8");

function extractTokens(block) {
  const tokens = {};
  const regex = /--([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8});/g;
  let match;
  while ((match = regex.exec(block)) !== null) {
    tokens[match[1]] = match[2].toUpperCase();
  }
  return tokens;
}

const rootMatch = css.match(/:root\s*\{([\s\S]*?)\}/);
const darkMatch = css.match(/\[data-theme="dark"\]\s*\{([\s\S]*?)\}/);

const lightTokens = rootMatch ? extractTokens(rootMatch[1]) : {};
const darkTokens = darkMatch ? extractTokens(darkMatch[1]) : {};

const tokens = {
  light: lightTokens,
  dark: darkTokens,
};

const pairs = [
  ["ink", "paper"],
  ["ink", "paper-2"],
  ["ink", "surface"],
  ["ink-2", "paper"],
  ["ink-2", "paper-2"],
  ["ink-2", "surface"],
  ["accent", "paper"],
  ["accent", "paper-2"],
  ["accent", "surface"],
  ["accent-ink", "accent"],
];

console.log("=== WCAG Contrast Ratio Audit ===");
let allPass = true;

for (const theme of ["light", "dark"]) {
  console.log(`\n--- Theme: ${theme.toUpperCase()} ---`);
  console.log(
    "Pair".padEnd(24) +
      "Colors".padEnd(22) +
      "Ratio".padEnd(10) +
      "Status (>= 4.5:1)"
  );
  console.log("-".repeat(68));

  for (const [fgKey, bgKey] of pairs) {
    const fg = tokens[theme][fgKey];
    const bg = tokens[theme][bgKey];
    if (!fg || !bg) {
      console.log(`Missing token for ${fgKey} or ${bgKey}`);
      allPass = false;
      continue;
    }
    const ratio = contrastRatio(fg, bg);
    const pass = ratio >= 4.5;
    if (!pass) allPass = false;
    const pairName = `${fgKey} on ${bgKey}`;
    const colors = `${fg} / ${bg}`;
    console.log(
      pairName.padEnd(24) +
        colors.padEnd(22) +
        ratio.toFixed(2).padEnd(10) +
        (pass ? "PASS" : "FAIL")
    );
  }
}

if (!allPass) {
  console.log("\nSome text pairs failed WCAG AA (4.5:1).");
  process.exit(1);
} else {
  console.log("\nAll evaluated text pairs passed WCAG AA (4.5:1)!");
}
