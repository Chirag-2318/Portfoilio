import { spawn } from "node:child_process";
import path from "node:path";
import os from "node:os";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const tmpDir = path.join(os.tmpdir(), `chrome-check-dt-${Date.now()}`);
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

await send("Page.navigate", { url: "http://localhost:4173/" });
await new Promise((r) => setTimeout(r, 2000));
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await new Promise((r) => setTimeout(r, 1000));
await send("Runtime.evaluate", {
  expression: `
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.documentElement.setAttribute('data-theme', 'light');
  `,
});
await new Promise((r) => setTimeout(r, 500));

const check = await send("Runtime.evaluate", {
  returnByValue: true,
  expression: `
    (() => {
      const url = window.location.href;
      const htmlSnippet = document.body.innerHTML.slice(0, 300);
      const allDts = Array.from(document.querySelectorAll('dt')).map(el => el.textContent.trim());
      const dt = Array.from(document.querySelectorAll('dt')).find(el => el.textContent.trim() === 'Won');
      if (!dt) return { error: 'No Won dt', url, htmlSnippet, allDts };
      const rect = dt.getBoundingClientRect();
      const elementsAtPoint = document.elementsFromPoint(rect.x + 5, rect.y + 5).map(el => ({
        tag: el.tagName,
        cls: el.className,
        bg: window.getComputedStyle(el).backgroundColor,
        color: window.getComputedStyle(el).color
      }));
      return {
        dtColor: window.getComputedStyle(dt).color,
        dtBg: window.getComputedStyle(dt).backgroundColor,
        elementsAtPoint
      };
    })()
  `,
});

console.log(JSON.stringify(check.result.value, null, 2));
chrome.kill();
