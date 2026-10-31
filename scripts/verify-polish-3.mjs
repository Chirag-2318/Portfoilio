import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9227;
const SERVER_PORT = 4178;
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
  console.log("=== STARTING POLISH PASS 3 VERIFICATION ===");

  const server = spawn(
    "node",
    ["scripts/static-server.mjs", String(SERVER_PORT), "out"],
    { stdio: "inherit" }
  );
  await wait(1200);

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "chrome-polish-3-"));
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

    const setViewport = async (width, height, isMobile = false) => {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 2,
        mobile: isMobile,
      });
      await cdp.send("Emulation.setVisibleSize", { width, height });
    };

    const capture = async (name) => {
      await wait(300);
      const { data } = await cdp.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
      });
      const filePath = path.join(SCREENSHOT_DIR, name);
      fs.writeFileSync(filePath, Buffer.from(data, "base64"));
      console.log(`Saved screenshot: ${name}`);
    };

    const setTheme = async (theme) => {
      await cdp.send("Runtime.evaluate", {
        expression: `
          document.documentElement.classList.remove('dark', 'light');
          document.documentElement.classList.add('${theme}');
          localStorage.setItem('theme', '${theme}');
        `,
      });
      await wait(200);
    };

    // ─── 1. MEASURE HERO & STACK AT 1440PX ───
    console.log("\n[Step 1] Measuring Hero and Stack at 1440px...");
    await setViewport(1440, 900, false);
    await wait(500);

    const res1440 = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      expression: `
        (() => {
          const header = document.querySelector('header');
          const hero = document.getElementById('top');
          const paths = Array.from(hero.querySelectorAll('path[stroke="var(--foreground)"]'));
          
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
            width: maxX - minX,
            height: maxY - minY,
          };

          const gapA = minY - headerRect.bottom;
          const gapB = nameOrAvatarTop - maxY;

          const stack = document.getElementById('stack');
          const stackRect = stack ? stack.getBoundingClientRect() : null;

          return {
            heroHeight: heroRect.height,
            lettersBBox,
            gapA,
            gapB,
            stackHeight: stackRect ? stackRect.height : null,
          };
        })()
      `,
    });
    console.log("1440px measurements:", res1440.result.value);

    // ─── 2. MEASURE HERO & STACK AT 390PX ───
    console.log("\n[Step 2] Measuring Hero and Stack at 390px...");
    await setViewport(390, 844, true);
    await wait(500);

    const res390 = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      expression: `
        (() => {
          const header = document.querySelector('header');
          const hero = document.getElementById('top');
          const paths = Array.from(hero.querySelectorAll('path[stroke="var(--foreground)"]'));
          
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
            width: maxX - minX,
            height: maxY - minY,
          };

          const gapA = minY - headerRect.bottom;
          const gapB = nameOrAvatarTop - maxY;

          const stack = document.getElementById('stack');
          const stackRect = stack ? stack.getBoundingClientRect() : null;

          return {
            heroHeight: heroRect.height,
            lettersBBox,
            gapA,
            gapB,
            stackHeight: stackRect ? stackRect.height : null,
          };
        })()
      `,
    });
    console.log("390px measurements:", res390.result.value);

    // ─── 3. CHECK NUMBERS PANEL REMOVAL & AUTOMATIC SHEET RENUMBERING ───
    console.log("\n[Step 3] Checking Numbers panel removal & sheet renumbering...");
    const sheetCheck = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      expression: `
        (() => {
          const numbersPanel = document.getElementById('numbers');
          const sheets = Array.from(document.querySelectorAll('header span'))
            .map(s => s.textContent?.trim())
            .filter(t => t && t.startsWith('SHEET'));
          return {
            hasNumbersPanel: Boolean(numbersPanel),
            sheets,
          };
        })()
      `,
    });
    console.log("Sheet tags check:", sheetCheck.result.value);

    // ─── 4. CHECK NOTE ALIGNMENT AT 1440PX & 1920PX ───
    console.log("\n[Step 4] Checking note alignment at 1440px and 1920px...");
    const checkNotes = async (w, h) => {
      await setViewport(w, h, false);
      await wait(300);
      return await cdp.send("Runtime.evaluate", {
        returnByValue: true,
        expression: `
          (() => {
            const socialTip = document.querySelector('[data-arrow-tip="social"]');
            const socialButtons = document.querySelector('[data-social-buttons]');
            const contactTip = document.querySelector('[data-arrow-tip="contact"]');
            const emailBlock = document.querySelector('[data-email-block]');

            const socialTipRect = socialTip?.getBoundingClientRect();
            const socialButtonsRect = socialButtons?.getBoundingClientRect();
            const contactTipRect = contactTip?.getBoundingClientRect();
            const emailBlockRect = emailBlock?.getBoundingClientRect();

            return {
              viewportWidth: ${w},
              socialNote: {
                visible: socialTipRect ? socialTipRect.width > 0 : false,
                horizontalDistance: (socialButtonsRect && socialTipRect) ? (socialButtonsRect.left - socialTipRect.right) : null,
                tipInsideVerticalSpan: (socialButtonsRect && socialTipRect) ? (socialTipRect.bottom >= socialButtonsRect.top && socialTipRect.top <= socialButtonsRect.bottom) : false,
              },
              contactNote: {
                visible: contactTipRect ? contactTipRect.width > 0 : false,
                horizontalDistance: (emailBlockRect && contactTipRect) ? (emailBlockRect.left - contactTipRect.right) : null,
                tipInsideVerticalSpan: (emailBlockRect && contactTipRect) ? (contactTipRect.bottom >= emailBlockRect.top && contactTipRect.top <= emailBlockRect.bottom) : false,
              }
            };
          })()
        `,
      });
    };

    const notes1440 = await checkNotes(1440, 900);
    console.log("Notes at 1440px:", notes1440.result.value);

    const notes1920 = await checkNotes(1920, 1080);
    console.log("Notes at 1920px:", notes1920.result.value);

    // ─── 5. PROJECTS FILTER & MOSAIC REVEAL ───
    console.log("\n[Step 5] Checking Projects filter and covers...");
    await setViewport(1440, 900, false);
    await wait(300);

    const projectCheck = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      awaitPromise: true,
      expression: `
        (async () => {
          const filterButtons = Array.from(document.querySelectorAll('[role="radiogroup"] button'));
          const initialItems = document.querySelectorAll('#projects li').length;

          // Click "Android" pill
          const androidBtn = filterButtons.find(b => b.textContent?.includes('Android'));
          androidBtn?.click();
          await new Promise(r => setTimeout(r, 300));
          const androidItems = document.querySelectorAll('#projects li').length;

          // Click "All" pill
          const allBtn = filterButtons.find(b => b.textContent?.includes('All'));
          allBtn?.click();
          await new Promise(r => setTimeout(r, 300));
          const allItems = document.querySelectorAll('#projects li').length;

          // Check mosaic cover presence in expanded project
          const mosaicImg = document.querySelector('#projects [role="img"]');
          const chips = Array.from(document.querySelectorAll('#projects [title]')).map(c => c.getAttribute('title'));

          return {
            initialCount: initialItems,
            androidCount: androidItems,
            allCount: allItems,
            hasMosaicCover: Boolean(mosaicImg),
            hasTechChips: chips.length > 0,
          };
        })()
      `,
    });
    console.log("Project filter check:", projectCheck.result.value);

    // ─── 6. FRAMECELL CHECK IN CONTACT AND 404 ───
    console.log("\n[Step 6] Checking FrameCell usage...");
    const frameCellCheck = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      expression: `
        (() => {
          const contactFrame = document.querySelector('#contact .grid-cols-\\\\[1fr_1rem_auto_1rem_1fr\\\\]');
          return {
            hasContactFrame: Boolean(contactFrame),
          };
        })()
      `,
    });
    console.log("FrameCell in contact:", frameCellCheck.result.value);

    // ─── 7. CAPTURE SCREENSHOTS AT 1440, 768, 390 IN DARK AND LIGHT ───
    console.log("\n[Step 7] Capturing screenshots...");
    // 1440 Dark & Light
    await setViewport(1440, 900, false);
    await setTheme("dark");
    await capture("polish3-1440-dark.png");
    await setTheme("light");
    await capture("polish3-1440-light.png");

    // 768 Dark & Light
    await setViewport(768, 1024, false);
    await setTheme("dark");
    await capture("polish3-768-dark.png");
    await setTheme("light");
    await capture("polish3-768-light.png");

    // 390 Dark & Light
    await setViewport(390, 844, true);
    await setTheme("dark");
    await capture("polish3-390-dark.png");
    await setTheme("light");
    await capture("polish3-390-light.png");

    // 404 Page Dark & Light
    await setViewport(1440, 900, false);
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${SERVER_PORT}/_not-found/` });
    await wait(1500);

    const frameCell404 = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      expression: `
        (() => {
          const frame404 = document.querySelector('.grid-cols-\\\\[1fr_1rem_auto_1rem_1fr\\\\]');
          return { hasFrame404: Boolean(frame404) };
        })()
      `,
    });
    console.log("FrameCell on 404:", frameCell404.result.value);

    await setTheme("dark");
    await capture("polish3-404-dark.png");
    await setTheme("light");
    await capture("polish3-404-light.png");

    cdp.close();
    console.log("\n=== ALL POLISH PASS 3 QA COMPLETED SUCCESSFULLY! ===");
  } finally {
    try { chrome.kill(); } catch {}
    try { server.kill(); } catch {}
  }
}

main().catch(console.error);
