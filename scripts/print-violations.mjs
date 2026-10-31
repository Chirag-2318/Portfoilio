import fs from "node:fs";

const res = JSON.parse(fs.readFileSync("scripts/audit-results.json", "utf8"));
for (const entry of res.axe.filter((e) => e.theme === "light")) {
  console.log(`\n=== Route: ${entry.route} ===`);
  for (const v of entry.violations) {
    console.log(`\n  Rule: ${v.id}`);
    console.log(`  Description: ${v.description}`);
  }
}
