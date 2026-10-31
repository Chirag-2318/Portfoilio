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
  const tmpDir = path.join(os.tmpdir(), `chrome-test-p5-${Date.now()}`);
  const chrome = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${PORT}`,
      "--headless=new",
      "--disable-gpu",
      `--user-data-dir=${tmpDir}`,
      "http://localhost:3000/about/",
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

    async function selectTab(tabId) {
      await cdp.send("Runtime.evaluate", {
        expression: `
          (() => {
            const tabBtn = document.getElementById('tab-${tabId}');
            if (tabBtn) tabBtn.click();
          })()
        `,
      });
      await wait(400);
    }

    // 1. Capture 1440x900 (Profile, Education, Skills, Highlights in light and dark)
    console.log("--- 1. Desktop 1440x900 (All tabs) ---");
    await setViewport(1440, 900, false);
    await setTheme("light");

    for (const tab of ["profile", "education", "skills", "highlights"]) {
      await selectTab(tab);
      await checkScroll(`1440x900 light [${tab}]`);
      await capture(`about-1440x900-${tab}-light.png`);
    }

    await setTheme("dark");
    for (const tab of ["profile", "education", "skills", "highlights"]) {
      await selectTab(tab);
      await checkScroll(`1440x900 dark [${tab}]`);
      await capture(`about-1440x900-${tab}-dark.png`);
    }

    // 2. Capture 1366x768 (Verify every pane fits in one viewport without scroll)
    console.log("--- 2. Desktop 1366x768 (No scroll check across all tabs) ---");
    await setViewport(1366, 768, false);
    await setTheme("light");

    for (const tab of ["profile", "education", "skills", "highlights"]) {
      await selectTab(tab);
      await checkScroll(`1366x768 light [${tab}]`);
      await capture(`about-1366x768-${tab}-light.png`);
    }

    // 3. Capture Tablet 768x1024
    console.log("--- 3. Tablet 768x1024 ---");
    await setViewport(768, 1024, false);
    await setTheme("light");
    await selectTab("profile");
    await checkScroll("768x1024 light [profile]");
    await capture("about-768x1024-profile-light.png");

    await selectTab("skills");
    await capture("about-768x1024-skills-light.png");

    // 4. Capture Mobile 390x844
    console.log("--- 4. Mobile 390x844 ---");
    await setViewport(390, 844, true);
    await setTheme("light");

    for (const tab of ["profile", "education", "skills", "highlights"]) {
      await selectTab(tab);
      const res = await checkScroll(`390x844 light [${tab}]`);
      const screens = (res.contentScrollH / 844).toFixed(2);
      console.log(`Mobile length [${tab}]: ${screens} screens`);
      await capture(`about-390x844-${tab}-light.png`);
    }

    await setTheme("dark");
    await selectTab("profile");
    await capture("about-390x844-profile-dark.png");

    // 5. Test 320px width tab fitting
    console.log("--- 5. Mobile 320px check (tabs fit on one line) ---");
    await setViewport(320, 640, true);
    const tabsFitCheck = await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const tablist = document.querySelector('[role="tablist"]');
          const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
          const listRect = tablist.getBoundingClientRect();
          const tabRects = tabs.map(t => t.getBoundingClientRect());
          const allSameTop = tabRects.every(r => Math.abs(r.top - tabRects[0].top) < 4);
          const fitsWidth = tabRects[tabRects.length - 1].right <= listRect.right + 2;
          return {
            allSameTop,
            fitsWidth,
            listW: listRect.width,
            lastTabRight: tabRects[tabRects.length - 1].right,
            listRight: listRect.right
          };
        })()
      `,
      returnByValue: true,
    });
    console.log("Tabs fit on one line at 320px:", tabsFitCheck.result.value);

    // 6. Test Keyboard Navigation (Left/Right/Home/End)
    console.log("--- 6. Keyboard Tab Navigation ---");
    await setViewport(1440, 900, false);
    await setTheme("light");
    await selectTab("profile");

    // Focus active tab and press ArrowRight
    await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const tab = document.querySelector('[role="tab"][aria-selected="true"]');
          if (tab) {
            tab.focus();
            tab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
          }
        })()
      `,
    });
    await wait(400);
    const kbdCheck1 = await cdp.send("Runtime.evaluate", {
      expression: `({ hash: window.location.hash, activeId: document.querySelector('[role="tab"][aria-selected="true"]')?.id })`,
      returnByValue: true,
    });
    console.log("Keyboard ArrowRight (should be education):", kbdCheck1.result.value);

    // Press End (should jump to highlights)
    await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const tab = document.querySelector('[role="tab"][aria-selected="true"]');
          if (tab) {
            tab.focus();
            tab.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
          }
        })()
      `,
    });
    await wait(400);
    const kbdCheck2 = await cdp.send("Runtime.evaluate", {
      expression: `({ hash: window.location.hash, activeId: document.querySelector('[role="tab"][aria-selected="true"]')?.id })`,
      returnByValue: true,
    });
    console.log("Keyboard End (should be highlights):", kbdCheck2.result.value);

    // 7. Direct Hash Arrival Test (/about#highlights and /about#education)
    console.log("--- 7. Direct Hash Arrival ---");
    await cdp.send("Page.navigate", { url: "http://localhost:3000/about/#education" });
    await wait(2000);
    const directCheck = await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const activeTab = document.querySelector('[role="tab"][aria-selected="true"]');
          const panel = document.querySelector('[role="tabpanel"]');
          return {
            hash: window.location.hash,
            activeTab: activeTab ? activeTab.innerText : null,
            panelTextSample: panel ? panel.innerText.slice(0, 60) : null
          };
        })()
      `,
      returnByValue: true,
    });
    console.log("Direct arrival /about#education:", directCheck.result.value);

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
  console.error("Error during P5 tests:", err);
  process.exit(1);
});

