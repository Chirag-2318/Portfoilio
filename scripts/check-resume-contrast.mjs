import { spawn } from "node:child_process";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const tmpDir = path.join(os.tmpdir(), `chrome-check-resume-${Date.now()}`);
const AXE_SRC = fs.readFileSync(
  path.join(process.cwd(), "node_modules/axe-core/axe.min.js"),
  "utf8"
);

const chrome = spawn(CHROME_PATH, [
  "--remote-debugging-port=9227",
  "--headless=new",
  "--disable-gpu",
  `--user-data-dir=${tmpDir}`,
  "http://localhost:4173/",
]);

await new Promise((r) => setTimeout(r, 1000));
const res = await fetch("http://127.0.0.1:9227/json/list").then((r) => r.json());
const page = res.find((p) => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));

let id = 1;
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const i = id++;
    const onm = (e) => {
      const d = JSON.parse(e.data);
      if (d.id === i) {
        ws.removeEventListener("message", onm);
        resolve(d.result);
      }
    };
    ws.addEventListener("message", onm);
    ws.send(JSON.stringify({ id: i, method, params }));
  });

await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});

for (const theme of ["light", "dark"]) {
  await send("Page.navigate", { url: "http://localhost:4173/resume/" });
  await new Promise((r) => setTimeout(r, 800));

  await send("Runtime.evaluate", {
    expression: `
      window.localStorage.setItem('theme', '${theme}');
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add('${theme}');
      document.documentElement.setAttribute('data-theme', '${theme}');
    `,
  });
  await new Promise((r) => setTimeout(r, 600));

  await send("Runtime.evaluate", { expression: AXE_SRC });

  const axeRes = await send("Runtime.evaluate", {
    returnByValue: true,
    awaitPromise: true,
    expression: `
      new Promise((resolve) => {
        axe.run({
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
          }
        }, (err, res) => {
          resolve(res);
        });
      })
    `,
  });

  const vList = axeRes.result.value.violations.filter((v) => v.id === "color-contrast");
  console.log(`[THEME: ${theme}] Contrast violation count:`, vList.length);
  for (const v of vList) {
    for (const n of v.nodes) {
      console.log(`  [${theme}] Selector:`, n.target.join(", "));
      console.log(`  [${theme}] HTML:`, n.html.slice(0, 160));
      console.log(`  [${theme}] Summary:`, n.failureSummary);
    }
  }
}
chrome.kill();
