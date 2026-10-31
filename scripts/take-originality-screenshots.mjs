import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9222;
const SERVER_PORT = 4173;
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
        const page =
          pages.find((p) => p.type === "page" && p.url && p.url.includes("4173")) ||
          pages.find((p) => p.type === "page" && p.url !== "about:blank") ||
          pages.find((p) => p.type === "page");
        if (page && page.webSocketDebuggerUrl) {
          return page.webSocketDebuggerUrl;
        }
      }
    } catch {
      // retry
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
  let server = null;
  try {
    await fetch(`http://127.0.0.1:${SERVER_PORT}/`);
  } catch {
    server = spawn("node", ["scripts/static-server.mjs"], {
      stdio: "inherit",
    });
    await wait(1500);
  }

  const tmpDir = path.join(os.tmpdir(), `chrome-bp-orig-${Date.now()}`);
  const chrome = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${PORT}`,
      "--headless=new",
      "--disable-gpu",
      `--user-data-dir=${tmpDir}`,
      `http://127.0.0.1:${SERVER_PORT}/`,
    ],
    { stdio: "ignore" }
  );

  try {
    const wsUrl = await getPageWsUrl();
    const cdp = new CDPClient(wsUrl);
    await cdp.connect();

    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");

    // Explicitly navigate to the home page
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${SERVER_PORT}/` });
    // Wait for hydration
    await wait(2500);

    async function setViewport(width, height, mobile = false) {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 2,
        mobile,
      });
      await wait(300);
    }

    async function setTheme(theme) {
      await cdp.send("Runtime.evaluate", {
        expression: `
          (() => {
            document.documentElement.classList.remove('dark', 'light', 'blueprint');
            if ('${theme}' === 'blueprint') {
              document.documentElement.classList.add('dark', 'blueprint');
            } else {
              document.documentElement.classList.add('${theme}');
            }
            localStorage.setItem('theme', '${theme}');
          })()
        `,
      });
      await wait(300);
    }

    async function scrollTo(selector) {
      await cdp.send("Runtime.evaluate", {
        expression: `
          (() => {
            const el = document.querySelector('${selector}');
            if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
          })()
        `,
      });
      await wait(400);
    }

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

    // ─── 1. Desktop 1440px: Dark, Light, Blueprint ───
    await setViewport(1440, 900, false);

    // Dark
    await setTheme("dark");
    await scrollTo("#top");
    await capture("originality-1440-dark-top.png");

    // Click hero to drop 5 pins
    await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const hero = document.getElementById('top');
          if (!hero) return;
          const rect = hero.getBoundingClientRect();
          const points = [
            { x: rect.left + 220, y: rect.top + 140 },
            { x: rect.left + 350, y: rect.top + 100 },
            { x: rect.left + 480, y: rect.top + 160 },
            { x: rect.left + 300, y: rect.top + 220 },
            { x: rect.left + 420, y: rect.top + 260 }
          ];
          points.forEach(p => {
            hero.dispatchEvent(new MouseEvent('click', {
              bubbles: true,
              clientX: p.x,
              clientY: p.y
            }));
          });
        })()
      `,
    });
    await wait(300);
    await capture("originality-1440-dark-pins.png");

    // Scroll to Bill of Materials / Experience
    await scrollTo("#numbers");
    await capture("originality-1440-dark-bom.png");

    // Light
    await setTheme("light");
    await scrollTo("#top");
    await capture("originality-1440-light-top.png");
    await scrollTo("#numbers");
    await capture("originality-1440-light-bom.png");

    // Blueprint Theme
    await setTheme("blueprint");
    await scrollTo("#top");
    await capture("originality-1440-blueprint-top.png");
    await scrollTo("#numbers");
    await capture("originality-1440-blueprint-bom.png");
    await scrollTo("#contact");
    await capture("originality-1440-blueprint-bottom.png");

    // ─── 2. Tablet 768px in Blueprint and Dark ───
    await setViewport(768, 1024, false);
    await setTheme("blueprint");
    await scrollTo("#top");
    await capture("originality-768-blueprint-top.png");

    await setTheme("dark");
    await scrollTo("#top");
    await capture("originality-768-dark-top.png");
    await scrollTo("#numbers");
    await capture("originality-768-dark-bom.png");

    // ─── 3. Mobile 390px in Blueprint and Dark ───
    await setViewport(390, 844, true);
    await setTheme("blueprint");
    await scrollTo("#top");
    await capture("originality-390-blueprint-top.png");

    await setTheme("dark");
    await scrollTo("#top");
    await capture("originality-390-dark-top.png");
    await scrollTo("#numbers");
    await capture("originality-390-dark-bom.png");

    // ─── 4. DOM Evaluation Verification (at 1440px desktop) ───
    await setViewport(1440, 900, false);
    await scrollTo("#top");
    await wait(500);

    const evalResult = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      expression: `
        (() => {
          const regMarks = document.querySelectorAll('svg line[x1="4.5"]');
          const rulerTexts = Array.from(document.querySelectorAll('text')).filter(t => ['0', '80', '160', '720'].some(v => t.textContent === v));
          const serifHeadings = Array.from(document.querySelectorAll('h1, h2, h3')).filter(h => {
            const font = window.getComputedStyle(h).fontFamily;
            return font.includes('Instrument') || font.includes('Georgia') || font.includes('serif');
          });
          const hasHorizontalOverflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;
          const bomTitle = Array.from(document.querySelectorAll('h2')).find(h => h.textContent?.includes('Bill of materials'));
          const sheetTags = Array.from(document.querySelectorAll('header span')).filter(s => s.textContent?.includes('SHEET'));
          const scrollRuler = document.querySelector('aside');
          const breadcrumb = document.querySelector('header button span:nth-child(2)');

          return {
            regMarkCount: regMarks.length,
            rulerNumeralCount: rulerTexts.length,
            serifHeadingCount: serifHeadings.length,
            hasHorizontalOverflow,
            hasBillOfMaterials: Boolean(bomTitle),
            sheetTagCount: sheetTags.length,
            hasScrollRuler: Boolean(scrollRuler),
            currentBreadcrumb: breadcrumb?.textContent,
          };
        })()
      `,
    });

    console.log("Originality QA Results:", evalResult.result.value);

    // ─── 5. 404 Page in Blueprint theme ───
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${SERVER_PORT}/_not-found` });
    await wait(1500);
    await setViewport(1440, 900, false);
    await setTheme("blueprint");
    await capture("originality-404-blueprint.png");

    cdp.close();
  } finally {
    try {
      chrome.kill();
    } catch {}
    try {
      server.kill();
    } catch {}
  }
}

main().catch((err) => {
  console.error("Error running originality screenshots:", err);
  process.exit(1);
});

