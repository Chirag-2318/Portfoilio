import fs from "node:fs";

const files = [
  "scripts/lh-home-mobile.json",
  "scripts/lh-work-desktop.json",
  "scripts/lh-about-desktop.json",
];

for (const file of files) {
  console.log(`\n================== ${file} ==================`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const audits = data.audits || {};

  // Metrics
  const fcp = audits["first-contentful-paint"]?.displayValue;
  const lcp = audits["largest-contentful-paint"]?.displayValue;
  const tbt = audits["total-blocking-time"]?.displayValue;
  const cls = audits["cumulative-layout-shift"]?.displayValue;
  const si = audits["speed-index"]?.displayValue;

  console.log(`Metrics: FCP=${fcp}, LCP=${lcp}, TBT=${tbt}, CLS=${cls}, SpeedIndex=${si}`);

  // Underperforming audits
  for (const [id, a] of Object.entries(audits)) {
    if (a.score !== null && a.score < 0.9 && a.details?.type === "opportunity") {
      console.log(`  Opportunity: ${id} (${a.title}) - score=${a.score}, save=${a.displayValue || ""}`);
    } else if (a.score !== null && a.score < 0.9 && a.scoreDisplayMode === "numeric") {
      console.log(`  Metric/Diagnostic: ${id} (${a.title}) - score=${a.score}, val=${a.displayValue || ""}`);
    }
  }
}

