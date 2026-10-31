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
        const page = pages.find((p) => p.type === "page");
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
    const check = await fetch(`http://localhost:${SERVER_PORT}/`);
  } catch {
    server = spawn("node", ["scripts/static-server.mjs"], {
      stdio: "ignore",
    });
    await wait(1000);
  }

  const tmpDir = path.join(os.tmpdir(), `chrome-bp-${Date.now()}`);
  const chrome = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${PORT}`,
      "--headless=new",
      "--disable-gpu",
      `--user-data-dir=${tmpDir}`,
      `http://localhost:${SERVER_PORT}/`,
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
    await wait(2000);

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
            document.documentElement.classList.remove('dark', 'light');
            document.documentElement.classList.add('${theme}');
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

    // 1. 1440px desktop - top
    await setViewport(1440, 900, false);
    await setTheme("dark");
    await scrollTo("#top");
    await capture("blueprint-1440-dark-top.png");

    await setTheme("light");
    await capture("blueprint-1440-light-top.png");

    // 1b. 1440px desktop - mid (Numbers, Experience, Projects)
    await setTheme("dark");
    await scrollTo("#numbers");
    await capture("blueprint-1440-dark-mid.png");

    // 1c. 1440px desktop - bottom (Achievements, Education, Stack, Resume, Contact)
    await scrollTo("#achievements");
    await capture("blueprint-1440-dark-bottom.png");

    // 2. 768px tablet
    await setViewport(768, 1024, false);
    await scrollTo("#top");
    await setTheme("dark");
    await capture("blueprint-768-dark.png");

    await scrollTo("#numbers");
    await capture("blueprint-768-dark-sections.png");

    // 3. 390px mobile
    await setViewport(390, 844, true);
    await scrollTo("#top");
    await setTheme("dark");
    await capture("blueprint-390-dark-top.png");

    await scrollTo("#numbers");
    await capture("blueprint-390-dark-sections.png");

    await scrollTo("#contact");
    await capture("blueprint-390-dark-bottom.png");

    // 4. Verify checks via DOM evaluation
    const evalResult = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      expression: `
        (() => {
          const sections = ['top', 'overview', 'socials', 'about', 'numbers', 'experience', 'projects', 'achievements', 'education', 'stack', 'resume', 'contact'];
          const missingSections = sections.filter(id => !document.getElementById(id));
          const handwrittenNotes = Array.from(document.querySelectorAll('span')).filter(s =>
            s.style.fontFamily?.includes('caveat')
          );
          const hasHorizontalOverflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;

          return {
            missingSections,
            handwrittenCount: handwrittenNotes.length,
            hasHorizontalOverflow,
            totalSectionsFound: sections.length - missingSections.length,
          };
        })()
      `,
    });

    console.log("Evaluation Results:", evalResult.result.value);

    // 5. Test 404 page
    await cdp.send("Page.navigate", { url: `http://localhost:${SERVER_PORT}/_not-found` });
    await wait(1500);
    await setViewport(1440, 900, false);
    await capture("blueprint-404-dark.png");

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
  console.error("Error running screenshots script:", err);
  process.exit(1);
});
