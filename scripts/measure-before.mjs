import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9226;
const SERVER_PORT = 4177;

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
          pages.find((p) => p.type === "page" && p.url && p.url.includes(String(SERVER_PORT))) ||
          pages.find((p) => p.type === "page");
        if (page && page.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
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
  const server = spawn(
    "node",
    ["scripts/static-server.mjs", String(SERVER_PORT), "out"],
    { stdio: "inherit" }
  );
  await wait(1200);

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "chrome-measure-before-"));
  const chrome = spawn(
    CHROME_PATH,
    [
      "--headless=new",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${userDataDir}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu",
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
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${SERVER_PORT}/` });
    await wait(2000);

    const measure = async (w, h, isMobile) => {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: w,
        height: h,
        deviceScaleFactor: 1,
        mobile: isMobile,
      });
      await cdp.send("Emulation.setVisibleSize", { width: w, height: h });
      await wait(500);

      const res = await cdp.send("Runtime.evaluate", {
        returnByValue: true,
        expression: `
          (() => {
            const header = document.querySelector('header');
            const hero = document.getElementById('top');
            const paths = Array.from(hero.querySelectorAll('path[stroke="var(--foreground)"]'));
            
            // Calculate union bounding box of the monogram letters
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            for (const p of paths) {
              const r = p.getBoundingClientRect();
              if (r.width > 0 && r.height > 0) {
                minX = Math.min(minX, r.left);
                minY = Math.min(minY, r.top);
                maxX = Math.max(maxX, r.right);
                maxY = Math.max(maxY, r.bottom);
              }
            }

            const headerRect = header ? header.getBoundingClientRect() : { bottom: 0 };
            const heroRect = hero ? hero.getBoundingClientRect() : { top: 0, bottom: 0, height: 0 };
            const nameBlock = hero ? hero.querySelector('h1') : null;
            const nameBlockRow = nameBlock ? nameBlock.closest('div.border-t') : null;
            const avatarBadge = hero ? hero.querySelector('.screen-line-top') : null;
            const nameOrAvatarTop = Math.min(
              nameBlockRow ? nameBlockRow.getBoundingClientRect().top : Infinity,
              avatarBadge ? avatarBadge.getBoundingClientRect().top : Infinity
            );

            const lettersBBox = {
              left: minX,
              top: minY,
              right: maxX,
              bottom: maxY,
              width: maxX - minX,
              height: maxY - minY,
            };

            const gapA = lettersBBox.top - headerRect.bottom;
            const gapB = nameOrAvatarTop - lettersBBox.bottom;

            const stack = document.getElementById('stack');
            const stackRect = stack ? stack.getBoundingClientRect() : null;

            return {
              viewport: { w: ${w}, h: ${h} },
              headerBottom: headerRect.bottom,
              heroHeight: heroRect.height,
              lettersBBox,
              nameOrAvatarTop,
              gapA,
              gapB,
              stackHeight: stackRect ? stackRect.height : null,
            };
          })()
        `,
      });
      return res.result.value;
    };

    console.log("=== BEFORE MEASUREMENTS ===");
    const res1440 = await measure(1440, 900, false);
    console.log("1440px:", JSON.stringify(res1440, null, 2));

    const res390 = await measure(390, 844, true);
    console.log("390px:", JSON.stringify(res390, null, 2));

    cdp.close();
  } finally {
    try { chrome.kill(); } catch {}
    try { server.kill(); } catch {}
  }
}

main().catch(console.error);
