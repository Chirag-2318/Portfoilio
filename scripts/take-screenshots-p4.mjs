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
  const tmpDir = path.join(os.tmpdir(), `chrome-test-p4-${Date.now()}`);
  const chrome = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${PORT}`,
      "--headless=new",
      "--disable-gpu",
      `--user-data-dir=${tmpDir}`,
      "http://localhost:3000/work/",
    ],
    { stdio: "ignore" }
  );

  try {
    const wsUrl = await getPageWsUrl();
    const cdp = new CDPClient(wsUrl);
    await cdp.connect();

    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");

    // Track console errors
    const consoleErrors = [];
    cdp.ws.addEventListener("message", (e) => {
      try {
        const d = JSON.parse(e.data);
        if (d.method === "Runtime.consoleAPICalled" && d.params.type === "error") {
          consoleErrors.push(d.params.args.map((a) => a.value || a.description).join(" "));
        }
      } catch {}
    });

    await wait(2500);

    async function capture(filename) {
      const screenshot = await cdp.send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: false,
      });
      const buffer = Buffer.from(screenshot.data, "base64");
      const filepath = path.join(SCREENSHOT_DIR, filename);
      fs.writeFileSync(filepath, buffer);
      console.log(`Saved screenshot: ${filename}`);
    }

    async function setViewport(width, height, mobile = false) {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 1,
        mobile,
      });
      await wait(350);
    }

    async function setTheme(theme) {
      await cdp.send("Runtime.evaluate", {
        expression: `
          (() => {
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            if (current !== '${theme}') {
              const buttons = Array.from(document.querySelectorAll('button'));
              const toggleBtn = buttons.find(b => b.getAttribute('aria-label')?.includes('theme'));
              if (toggleBtn) toggleBtn.click();
              else document.documentElement.setAttribute('data-theme', '${theme}');
            }
          })()
        `,
      });
      await wait(350);
    }

    async function checkScroll(desc) {
      const res = await cdp.send("Runtime.evaluate", {
        expression: `
          (() => {
            const docScroll = document.documentElement.scrollHeight > window.innerHeight;
            const content = document.getElementById('content');
            const contentScroll = content ? content.scrollHeight > content.clientHeight : false;
            const docScrollX = document.documentElement.scrollWidth > window.innerWidth;
            return {
              docScroll,
              contentScroll,
              docScrollX,
              innerH: window.innerHeight,
              contentScrollH: content ? content.scrollHeight : 0,
              contentClientH: content ? content.clientHeight : 0
            };
          })()
        `,
        returnByValue: true,
      });
      console.log(`Scroll check [${desc}]:`, JSON.stringify(res.result.value));
      return res.result.value;
    }

    // 1. Standard Desktop Viewports & Scroll Checks
    console.log("--- 1. Desktop Viewports (1440x900 & 1366x768) ---");
    await setViewport(1440, 900, false);
    await setTheme("light");
    await checkScroll("1440x900 light");
    await capture("work-1440x900-light.png");

    await setTheme("dark");
    await checkScroll("1440x900 dark");
    await capture("work-1440x900-dark.png");

    await setViewport(1366, 768, false);
    await setTheme("light");
    await checkScroll("1366x768 light");
    await capture("work-1366x768-light.png");

    await setTheme("dark");
    await checkScroll("1366x768 dark");
    await capture("work-1366x768-dark.png");

    // 2. Switching Projects & Keyboard Roving Tabindex on Desktop
    console.log("--- 2. Switching Projects via Keyboard ---");
    await setViewport(1440, 900, false);
    await setTheme("light");

    // Focus the selected button and press ArrowDown
    await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const btn = document.querySelector('button[aria-pressed="true"]');
          if (btn) {
            btn.focus();
            btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
          }
        })()
      `,
    });
    await wait(400);
    const hash1 = await cdp.send("Runtime.evaluate", { expression: "window.location.hash" });
    console.log("Hash after ArrowDown (should be #validedi):", hash1.result.value);
    await capture("work-1440x900-validedi.png");

    // Press ArrowDown again to reach ARTHIX
    await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const btn = document.querySelector('button[aria-pressed="true"]');
          if (btn) {
            btn.focus();
            btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
          }
        })()
      `,
    });
    await wait(400);
    const hash2 = await cdp.send("Runtime.evaluate", { expression: "window.location.hash" });
    console.log("Hash after second ArrowDown (should be #arthix):", hash2.result.value);
    await capture("work-1440x900-arthix.png");

    // 3. Tablet Viewports (768x1024)
    console.log("--- 3. Tablet Viewports (768x1024) ---");
    await setViewport(768, 1024, false);
    await setTheme("light");
    await checkScroll("768x1024 light");
    await capture("work-768x1024-light.png");

    await setTheme("dark");
    await checkScroll("768x1024 dark");
    await capture("work-768x1024-dark.png");

    // 4. Mobile Viewports (390x844 & 320px width)
    console.log("--- 4. Mobile Viewports (390x844) ---");
    await setViewport(390, 844, true);
    await setTheme("light");
    await checkScroll("390x844 light");
    await capture("work-390x844-light.png");

    await setTheme("dark");
    await checkScroll("390x844 dark");
    await capture("work-390x844-dark.png");

    // Mobile 320px check (ensure no horizontal scroll)
    await setViewport(320, 640, true);
    const scroll320 = await checkScroll("320x640 light");
    console.log("Horizontal scroll at 320px:", scroll320.docScrollX ? "FAIL (overflow)" : "PASS (no overflow)");

    // 5. Direct URL Hash Navigation Test
    console.log("--- 5. Direct Hash Arrival Test (/work#arthix) ---");
    await setViewport(1440, 900, false);
    await setTheme("light");
    await cdp.send("Page.navigate", { url: "http://localhost:3000/work/#arthix" });
    await wait(2500);

    const directHashCheck = await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const activeBtn = document.querySelector('button[aria-pressed="true"]');
          const title = document.querySelector('h2');
          return {
            hash: window.location.hash,
            title: title ? title.innerText : null,
            btnText: activeBtn ? activeBtn.innerText : null
          };
        })()
      `,
      returnByValue: true,
    });
    console.log("Direct hash check result:", directHashCheck.result.value);

    // Check console errors
    console.log("Browser console errors logged:", consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.error("Console errors found:", consoleErrors);
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
  console.error("Error during P4 screenshot tests:", err);
  process.exit(1);
});
