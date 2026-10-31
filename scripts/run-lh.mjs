import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const RUNS = [
  { name: "Home (Mobile)", route: "/", desktop: false, file: "scripts/lh-home-mobile.json" },
  { name: "Home (Desktop)", route: "/", desktop: true, file: "scripts/lh-home-desktop.json" },
  { name: "Work (Desktop)", route: "/work/", desktop: true, file: "scripts/lh-work-desktop.json" },
  { name: "About (Desktop)", route: "/about/", desktop: true, file: "scripts/lh-about-desktop.json" },
  { name: "Resume (Desktop)", route: "/resume/", desktop: true, file: "scripts/lh-resume-desktop.json" },
  { name: "Contact (Desktop)", route: "/contact/", desktop: true, file: "scripts/lh-contact-desktop.json" },
];

function runLighthouse(target) {
  return new Promise((resolve, reject) => {
    const url = `http://localhost:4173${target.route}`;
    const args = [
      "lighthouse",
      url,
      "--chrome-flags=--headless=new",
      target.desktop ? "--preset=desktop" : "--form-factor=mobile",
      "--only-categories=performance,accessibility,best-practices,seo",
      "--output=json",
      `--output-path=${target.file}`,
      "--quiet",
    ];

    console.log(`Running Lighthouse on ${target.name} (${url})...`);
    const proc = spawn("npx.cmd", args, { stdio: "inherit", shell: true });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Lighthouse exited with code ${code} for ${target.name}`));
      }
    });
  });
}

async function main() {
  const summary = [];

  for (const target of RUNS) {
    try {
      await runLighthouse(target);
      const data = JSON.parse(fs.readFileSync(target.file, "utf8"));
      const cats = data.categories || {};
      const perf = Math.round((cats.performance?.score ?? 0) * 100);
      const a11y = Math.round((cats.accessibility?.score ?? 0) * 100);
      const bp = Math.round((cats["best-practices"]?.score ?? 0) * 100);
      const seo = Math.round((cats.seo?.score ?? 0) * 100);

      summary.push({
        target: target.name,
        performance: perf,
        accessibility: a11y,
        bestPractices: bp,
        seo: seo,
      });

      console.log(`-> ${target.name}: Perf=${perf}, A11y=${a11y}, BestPractices=${bp}, SEO=${seo}`);
    } catch (err) {
      console.error(`Failed ${target.name}:`, err.message);
    }
  }

  console.log("\n=== LIGHTHOUSE AUDIT SUMMARY ===");
  console.table(summary);
  fs.writeFileSync("scripts/lh-summary.json", JSON.stringify(summary, null, 2));
}

main().catch(console.error);
