import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9226;
const BASE_URL = "http://localhost:4173";
const AXE_SRC = fs.readFileSync(
  path.join(process.cwd(), "node_modules/axe-core/axe.min.js"),
  "utf8"
);

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getPageWsUrl() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      if (res.ok) {
        const pages = await res.json();
        const page = pages.find((p) => p.type === "page");
        if (page && page.webSocketDebuggerUrl) {
          return page.webSocketDebuggerUrl;
        }
      }
    } catch {}
    await wait(300);
  }
  throw new Error("Could not find page in Chrome");
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && this.callbacks.has(data.id)) {
        const cb = this.callbacks.get(data.id);
        this.callbacks.delete(data.id);
        if (data.error) cb.reject(new Error(data.error.message));
        else cb.resolve(data.result);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.ws.close();
  }
}

async function main() {
  const tmpDir = path.join(os.tmpdir(), `chrome-diag-p9-${Date.now()}`);
  const chrome = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${PORT}`,
      "--headless=new",
      "--disable-gpu",
      `--user-data-dir=${tmpDir}`,
      `${BASE_URL}/`,
    ],
    { stdio: "ignore" }
  );

  try {
    const wsUrl = await getPageWsUrl();
    const cdp = new CDPClient(wsUrl);
    await cdp.connect();

    const evaluate = async (expression) => {
      const res = await cdp.send("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (res.exceptionDetails) {
        throw new Error(JSON.stringify(res.exceptionDetails));
      }
      return res.result.value;
    };

    const routes = [
      { route: "/", theme: "light" },
      { route: "/", theme: "dark" },
      { route: "/resume/", theme: "dark" },
      { route: "/contact/", theme: "light" },
    ];

    for (const { route, theme } of routes) {
      await cdp.send("Page.navigate", { url: `${BASE_URL}${route}` });
      await wait(1200);
      await evaluate(`
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add('${theme}');
        document.documentElement.setAttribute('data-theme', '${theme}');
      `);
      await wait(600);

      await evaluate(AXE_SRC);
      const results = await evaluate(`
        new Promise((resolve, reject) => {
          axe.run(
            {
              runOnly: {
                type: 'tag',
                values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']
              }
            },
            (err, res) => {
              if (err) reject(err);
              else resolve(res);
            }
          );
        })
      `);

      console.log(`\n=== ROUTE: ${route} | THEME: ${theme} ===`);
      for (const v of results.violations || []) {
        console.log(`\nViolation: ${v.id} (${v.impact}) - ${v.description}`);
        for (const node of v.nodes) {
          console.log(`  Selector: ${node.target.join(", ")}`);
          console.log(`  HTML: ${node.html.slice(0, 160)}`);
          console.log(`  Summary: ${node.failureSummary}`);
        }
      }
    }
  } finally {
    chrome.kill();
  }
}

main().catch(console.error);
