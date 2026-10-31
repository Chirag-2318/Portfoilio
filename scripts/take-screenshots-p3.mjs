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

    // Wait for hydration & entrance animation to finish
    await wait(3000);

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
      await wait(300);
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

    async function movePointer(x, y) {
      await cdp.send("Runtime.evaluate", {
        expression: `
          (() => {
            const stage = document.querySelector('.home-stage');
            if (stage) {
              const evt = new PointerEvent('pointermove', {
                clientX: ${x},
                clientY: ${y},
                bubbles: true,
                pointerType: 'mouse'
              });
              stage.dispatchEvent(evt);
            }
          })()
        `,
      });
      await wait(300);
    }

    async function checkScroll(desc) {
      const res = await cdp.send("Runtime.evaluate", {
        expression: `
          (() => {
            const docScroll = document.documentElement.scrollHeight > window.innerHeight;
            const content = document.getElementById('content');
            const contentScroll = content ? content.scrollHeight > content.clientHeight : false;
            return { docScroll, contentScroll, innerH: window.innerHeight, scrollH: document.documentElement.scrollHeight, contentScrollH: content ? content.scrollHeight : 0, contentClientH: content ? content.clientHeight : 0 };
          })()
        `,
        returnByValue: true,
      });
      console.log(`Scroll check [${desc}]:`, JSON.stringify(res.result.value));
    }

    // 1. Test Viewports (No scroll test)
    console.log("--- Capturing standard viewports ---");
    const viewports = [
      { name: "390x844", width: 390, height: 844, mobile: true },
      { name: "360x740", width: 360, height: 740, mobile: true },
      { name: "768x1024", width: 768, height: 1024, mobile: false },
      { name: "1366x768", width: 1366, height: 768, mobile: false },
      { name: "1440x900", width: 1440, height: 900, mobile: false },
      { name: "1440x700", width: 1440, height: 700, mobile: false },
    ];

    for (const vp of viewports) {
      await setViewport(vp.width, vp.height, vp.mobile);
      await setTheme("light");
      await checkScroll(`${vp.name} light`);
      await capture(`home-${vp.name}-light.png`);

      if (["390x844", "768x1024", "1366x768", "1440x900"].includes(vp.name)) {
        await setTheme("dark");
        await checkScroll(`${vp.name} dark`);
        await capture(`home-${vp.name}-dark.png`);
      }
    }

    // 2. Test Lens over Name
    console.log("--- Testing Lens over Name ---");
    await setViewport(1440, 900, false);
    await setTheme("light");
    const nameRectResult = await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const el = document.querySelector('[data-name]');
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { x: r.left + r.width * 0.35, y: r.top + r.height * 0.45 };
        })()
      `,
      returnByValue: true,
    });

    if (nameRectResult.result.value) {
      const { x, y } = nameRectResult.result.value;
      await movePointer(x, y);
      await wait(400);
      await capture("lens-over-name-1440.png");
    }

    // 3. Test Lens over Portrait
    console.log("--- Testing Lens over Portrait ---");
    const portraitRectResult = await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const el = document.querySelector('.hero[data-variant="final"] [data-portrait]');
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.5 };
        })()
      `,
      returnByValue: true,
    });

    if (portraitRectResult.result.value) {
      const { x, y } = portraitRectResult.result.value;
      await movePointer(x, y);
      await wait(400);
      await capture("lens-over-portrait-1440.png");
    }

    // 4. Test Draft Mode (Full view draft expansion)
    console.log("--- Testing Draft Toggle ---");
    await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const btn = document.querySelector('button[aria-pressed]');
          if (btn) btn.click();
        })()
      `,
    });
    await wait(800);
    await capture("home-draft-mode-1440-light.png");

    await setTheme("dark");
    await capture("home-draft-mode-1440-dark.png");

    await setViewport(390, 844, true);
    await wait(400);
    await capture("home-draft-mode-390-dark.png");

    // Close draft mode via Esc
    await cdp.send("Runtime.evaluate", {
      expression: `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`,
    });
    await wait(600);

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
