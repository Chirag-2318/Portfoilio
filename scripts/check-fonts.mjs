import fs from "node:fs";

const html = fs.readFileSync("out/index.html", "utf8");
const links = html.match(/<link[^>]+>/g) || [];
for (const link of links) {
  if (link.includes("preload") && link.includes("font")) {
    console.log("Preloaded font:", link);
  }
}
