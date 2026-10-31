import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9222;

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
  const tmpDir = path.join(os.tmpdir(), `chrome-smoke-p6-${Date.now()}`);
  const chrome = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${PORT}`,
      "--headless=new",
      "--disable-gpu",
      `--user-data-dir=${tmpDir}`,
      "http://localhost:3000/",
    ],
    { stdio: "ignore" }
  );

  try {
    const wsUrl = await getPageWsUrl();
    const cdp = new CDPClient(wsUrl);
    await cdp.connect();

    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");

    try {
      await cdp.send("Browser.grantPermissions", {
        permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"],
      });
    } catch {}

    const consoleErrors = [];
    cdp.ws.addEventListener("message", (e) => {
      try {
        const d = JSON.parse(e.data);
        if (d.method === "Runtime.consoleAPICalled" && d.params.type === "error") {
          consoleErrors.push(
            d.params.args.map((a) => a.value || a.description || JSON.stringify(a)).join(" ")
          );
        }
      } catch {}
    });

    await wait(2000);

    const routes = [
      "http://localhost:3000/",
      "http://localhost:3000/work/",
      "http://localhost:3000/work/#sar",
      "http://localhost:3000/work/#validedi",
      "http://localhost:3000/work/#arthix",
      "http://localhost:3000/about/",
      "http://localhost:3000/about/#profile",
      "http://localhost:3000/about/#education",
      "http://localhost:3000/about/#skills",
      "http://localhost:3000/about/#highlights",
      "http://localhost:3000/resume/",
      "http://localhost:3000/contact/",
      "http://localhost:3000/404-nonexistent-page/",
    ];

    console.log("=== Running Whole-Site Smoke Test ===");
    for (const route of routes) {
      await cdp.send("Page.navigate", { url: route });
      await wait(500);
      const title = await cdp.send("Runtime.evaluate", {
        expression: "document.title",
        returnByValue: true,
      });
      console.log(`Visited: ${route} -> Title: "${title.result.value}"`);
    }

    // Test Back / Forward
    console.log("Testing History Back & Forward...");
    const history = await cdp.send("Page.getNavigationHistory");
    const currentIndex = history.currentIndex;
    if (currentIndex > 1) {
      const prevEntry = history.entries[currentIndex - 1];
      await cdp.send("Page.navigateToHistoryEntry", { entryId: prevEntry.id });
      await wait(500);
      console.log("Navigated back to:", prevEntry.url);

      const nextEntry = history.entries[currentIndex];
      await cdp.send("Page.navigateToHistoryEntry", { entryId: nextEntry.id });
      await wait(500);
      console.log("Navigated forward to:", nextEntry.url);
    }

    console.log("=== Smoke Test Finished ===");
    console.log("Total console errors encountered:", consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.error("Errors:", consoleErrors);
      process.exit(1);
    }

    cdp.close();
  } finally {
    chrome.kill();
  }
}

main().catch((err) => {
  console.error("Smoke test failed:", err);
  process.exit(1);
});

