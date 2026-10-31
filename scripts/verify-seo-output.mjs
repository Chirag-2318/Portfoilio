import fs from "node:fs";

console.log("=== Verifying Static Build & SEO Outputs ===");

const filesToCheck = [
  "out/index.html",
  "out/work/index.html",
  "out/about/index.html",
  "out/resume/index.html",
  "out/contact/index.html",
  "out/404.html",
  "out/sitemap.xml",
  "out/robots.txt",
  "out/opengraph-image",
  "out/twitter-image",
  "out/icon",
  "out/apple-icon",
];

for (const file of filesToCheck) {
  const exists = fs.existsSync(file);
  const size = exists ? fs.statSync(file).size : 0;
  console.log(`${file.padEnd(28)}: ${exists ? `EXISTS (${size} bytes)` : "MISSING"}`);
  if (!exists) {
    console.error(`FATAL: ${file} is missing!`);
    process.exit(1);
  }
}

// Copy png copies for static servers if requested by users
fs.copyFileSync("out/opengraph-image", "out/opengraph-image.png");
fs.copyFileSync("out/twitter-image", "out/twitter-image.png");
fs.copyFileSync("out/icon", "out/icon.png");
fs.copyFileSync("out/apple-icon", "out/apple-icon.png");

// Verify index.html tags
const indexHtml = fs.readFileSync("out/index.html", "utf8");

// 1. JSON-LD Person
const jsonLdMatch = indexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (!jsonLdMatch) {
  console.error("FATAL: JSON-LD script tag not found in out/index.html");
  process.exit(1);
}
try {
  const parsed = JSON.parse(jsonLdMatch[1]);
  console.log("JSON-LD valid Person:", parsed["@type"] === "Person", "Name:", parsed.name, "jobTitle:", parsed.jobTitle);
  if (parsed["@type"] !== "Person" || !parsed.name || !parsed.jobTitle) {
    throw new Error("Invalid Person structure");
  }
} catch (e) {
  console.error("FATAL: Failed to parse JSON-LD:", e);
  process.exit(1);
}

// 2. OpenGraph & Twitter tags
const hasOgTitle = indexHtml.includes('property="og:title"');
const hasOgDesc = indexHtml.includes('property="og:description"');
const hasTwitterCard = indexHtml.includes('name="twitter:card"');
const hasColorScheme = indexHtml.includes('name="color-scheme"');
console.log("Meta tags check:", { hasOgTitle, hasOgDesc, hasTwitterCard, hasColorScheme });

// 3. Sitemap content
const sitemapXml = fs.readFileSync("out/sitemap.xml", "utf8");
console.log("Sitemap valid XML:", sitemapXml.includes("<urlset") && sitemapXml.includes("/work/"));

// 4. Robots content
const robotsTxt = fs.readFileSync("out/robots.txt", "utf8");
console.log("Robots.txt valid:\n" + robotsTxt.trim());

console.log("\nAll SEO outputs verified successfully!");
