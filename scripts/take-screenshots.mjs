import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9222;
const SCREENSHOT_DIR = path.join(process.cwd(), "screenshots");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

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
    } catch {
      // wait and retry
    }
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
  const tmpDir = path.join(os.tmpdir(), `chrome-test-${Date.now()}`);
  const chrome = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${PORT}`,
      "--headless=new",
      "--disable-gpu",
      `--user-data-dir=${tmpDir}`,
      "http://localhost:3000",
    ],
    { stdio: "ignore" }
  );

  try {
    const wsUrl = await getPageWsUrl();
    const cdp = new CDPClient(wsUrl);
    await cdp.connect();

    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");

    // Wait for hydration
    await wait(3000);

    const viewports = [
      { name: "mobile-390", width: 390, height: 844, mobile: true },
      { name: "tablet-768", width: 768, height: 1024, mobile: false },
      { name: "desktop-1366", width: 1366, height: 768, mobile: false },
      { name: "desktop-1440", width: 1440, height: 900, mobile: false },
    ];

    for (const theme of ["light", "dark"]) {
      // Toggle theme via the button
      await cdp.send("Runtime.evaluate", {
        expression: `
          (() => {
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            if (current !== '${theme}') {
              // Click the theme toggle button in the header bar
              const buttons = Array.from(document.querySelectorAll('button'));
              const toggleBtn = buttons.find(b => b.textContent && b.textContent.includes('Toggle'));
              if (toggleBtn) {
                toggleBtn.click();
              } else {
                document.documentElement.setAttribute('data-theme', '${theme}');
              }
            }
          })()
        `,
      });
      await wait(600);

      for (const vp of viewports) {
        await cdp.send("Emulation.setDeviceMetricsOverride", {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 1,
          mobile: vp.mobile,
        });
        await wait(300);

        const screenshot = await cdp.send("Page.captureScreenshot", {
          format: "png",
          captureBeyondViewport: false,
        });

        const buffer = Buffer.from(screenshot.data, "base64");
        const filename = `${vp.name}-${theme}.png`;
        const filepath = path.join(SCREENSHOT_DIR, filename);
        fs.writeFileSync(filepath, buffer);
        console.log(`Saved screenshot: ${filename}`);
      }
    }

    cdp.close();
  } finally {
    chrome.kill();
    await wait(1000);
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

main().catch((err) => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
