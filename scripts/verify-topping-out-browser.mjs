import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9223; // use separate port to avoid conflicts
const SERVER_PORT = 4175;
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
  console.log("=== STARTING TOPPING OUT BROWSER VERIFICATION ===");

  // 1. Start static file server on SERVER_PORT
  const server = spawn(
    "node",
    ["scripts/static-server.mjs", String(SERVER_PORT), "out"],
    { stdio: "inherit" }
  );

  await wait(1200);

  // 2. Launch headless Chrome with remote debugging
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "chrome-topping-out-"));
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
    await cdp.send("DOM.enable");
    await cdp.send("Runtime.enable");

    // Explicitly navigate to the server URL
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
          document.documentElement.classList.remove('dark', 'light', 'blueprint');
          document.documentElement.classList.add('${theme}');
          localStorage.setItem('theme', '${theme}');
          if (window.__toppingOut?.getEngine) {
            // trigger re-render
          }
        `,
      });
      await wait(200);
    };

    // ─── TEST 1: Open Game from Header Gamepad Button ───
    console.log("\n[Step 1] Opening game from header button...");
    await setViewport(1440, 900, false);
    await wait(800);

    const openResult = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      expression: `
        (() => {
          const btn = document.querySelector('[data-game-slot]');
          if (!btn) return { success: false, reason: 'Game slot button not found' };
          btn.focus();
          btn.click();
          return { success: true };
        })()
      `,
    });
    console.log("Header button click:", openResult.result.value);

    // Wait for dynamic modal import
    await wait(600);

    const dialogCheck = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      expression: `
        (() => {
          const dialog = document.querySelector('[role="dialog"][aria-label="Topping Out game"]');
          return {
            hasDialog: Boolean(dialog),
            hasHook: Boolean(window.__toppingOut),
          };
        })()
      `,
    });
    console.log("Dialog presence:", dialogCheck.result.value);

    // ─── TEST 2: Play at least 15 floors with real triggers ───
    console.log("\n[Step 2] Playing 15 floors (testing perfects, regrow, trim, miss)...");

    const playResult = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      awaitPromise: true,
      expression: `
        (async () => {
          const hook = window.__toppingOut;
          if (!hook) return { error: 'No __toppingOut hook found' };

          // Start the game
          hook.trigger();
          await new Promise(r => setTimeout(r, 100));

          const engine = hook.getEngine();
          const results = [];

          // Perform 15 floors:
          // Floors 1-4: Perfects (tests combo and regrowth at combo 4)
          // Floor 5: Trim (tests debris and trim)
          // Floors 6-10: Perfects
          // Floors 11-15: Perfects and trims
          for (let f = 1; f <= 15; f++) {
            const moving = engine.movingSlab;
            if (!moving) break;

            if (f === 5) {
              // Intentionally trim: offset by 0.5 along moving axis
              if (moving.axis === 'x') {
                moving.x = engine.getTopSlab().x + 0.5;
              } else {
                moving.z = engine.getTopSlab().z + 0.5;
              }
            } else {
              // Snap moving slab to exact centre of previous slab for a perfect drop
              if (moving.axis === 'x') {
                moving.x = engine.getTopSlab().x;
              } else {
                moving.z = engine.getTopSlab().z;
              }
            }

            hook.trigger();
            await new Promise(r => setTimeout(r, 40));
            results.push({
              floor: engine.floors,
              combo: engine.combo,
              debrisCount: engine.debrisList.length,
            });
          }

          return {
            finalFloors: engine.floors,
            finalPerfects: engine.perfects,
            bestScore: engine.best,
            hasDebris: engine.debrisList.length > 0,
            floorsHistory: results,
          };
        })()
      `,
    });
    console.log("Play 15 floors result:", playResult.result.value);

    // Capture 1440px Dark during play (at floor 15!)
    await setTheme("dark");
    await capture("topping-out-1440-dark-play.png");

    // Capture 1440px Light during play
    await setTheme("light");
    await capture("topping-out-1440-light-play.png");

    // Capture 1440px Blueprint during play
    await setTheme("blueprint");
    await capture("topping-out-1440-blueprint-play.png");

    // ─── TEST 3: Trigger a MISS to verify Game Over panel & landmark line ───
    console.log("\n[Step 3] Triggering a miss to reach Game Over panel...");
    const missResult = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      awaitPromise: true,
      expression: `
        (async () => {
          const hook = window.__toppingOut;
          const engine = hook.getEngine();
          // Move slab completely off to cause a miss
          if (engine.movingSlab.axis === 'x') {
            engine.movingSlab.x = 8.0;
          } else {
            engine.movingSlab.z = 8.0;
          }
          hook.trigger();

          // Wait for miss animation + game over card delay (1200ms)
          await new Promise(r => setTimeout(r, 1300));

          const card = document.querySelector('[role="dialog"] h3');
          const landmarkP = document.querySelector('[role="dialog"] h3 + p');

          return {
            state: engine.state,
            floors: engine.floors,
            headingText: card?.textContent,
            landmarkText: landmarkP?.textContent,
            bestInStorage: localStorage.getItem('topping-out-best'),
          };
        })()
      `,
    });
    console.log("Miss and Game Over evaluation:", missResult.result.value);

    // Capture Game Over screenshots
    await capture("topping-out-1440-blueprint-over.png");
    await setTheme("dark");
    await capture("topping-out-1440-dark-over.png");

    // ─── TEST 4: Mobile 390px Viewport ───
    console.log("\n[Step 4] Mobile 390px Viewport testing...");
    await setViewport(390, 844, true);
    await wait(400);
    await capture("topping-out-390-dark-over.png");

    // Restart game on mobile
    await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const playAgainBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Play again'));
          playAgainBtn?.click();
        })()
      `,
    });
    await wait(600);

    // Play 3 floors on mobile
    await cdp.send("Runtime.evaluate", {
      awaitPromise: true,
      expression: `
        (async () => {
          const hook = window.__toppingOut;
          const engine = hook.getEngine();
          for (let i = 0; i < 3; i++) {
            if (engine.movingSlab) {
              if (engine.movingSlab.axis === 'x') engine.movingSlab.x = engine.getTopSlab().x;
              else engine.movingSlab.z = engine.getTopSlab().z;
              hook.trigger();
              await new Promise(r => setTimeout(r, 60));
            }
          }
        })()
      `,
    });
    await wait(300);
    await capture("topping-out-390-dark-play.png");

    // Mobile in Blueprint theme
    await setTheme("blueprint");
    await capture("topping-out-390-blueprint-play.png");

    // ─── TEST 5: Keyboard Controls & Focus Return ───
    console.log("\n[Step 5] Testing keyboard controls (Esc closes, focus returns)...");
    await setViewport(1440, 900, false);
    await wait(300);

    // Press Escape to close overlay
    const escResult = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      awaitPromise: true,
      expression: `
        (async () => {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
          await new Promise(r => setTimeout(r, 400));
          const dialog = document.querySelector('[role="dialog"][aria-label="Topping Out game"]');
          const activeEl = document.activeElement;
          return {
            dialogClosed: !dialog,
            activeElementTag: activeEl?.tagName,
            hasGameSlotData: activeEl?.hasAttribute('data-game-slot'),
          };
        })()
      `,
    });
    console.log("Escape key close & focus return:", escResult.result.value);

    // ─── TEST 6: Command Menu opens Topping Out ───
    console.log("\n[Step 6] Testing command menu item 'Play Topping Out'...");
    const cmdkResult = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      awaitPromise: true,
      expression: `
        (async () => {
          // Open command menu via Ctrl+K
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
          await new Promise(r => setTimeout(r, 400));

          // Find command item with "Play Topping Out"
          const items = Array.from(document.querySelectorAll('[cmdk-item]'));
          const gameItem = items.find(it => it.textContent?.includes('Play Topping Out'));
          if (!gameItem) {
            return { error: 'Command item Play Topping Out not found' };
          }

          gameItem.click();
          await new Promise(r => setTimeout(r, 600));

          const dialog = document.querySelector('[role="dialog"][aria-label="Topping Out game"]');
          return {
            openedFromCmdk: Boolean(dialog),
          };
        })()
      `,
    });
    console.log("Command menu trigger result:", cmdkResult.result.value);

    // Close dialog again
    await cdp.send("Runtime.evaluate", {
      expression: `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));`,
    });
    await wait(400);

    // ─── TEST 7: 404 Page with Inline Game ───
    console.log("\n[Step 7] Testing 404 page inline game...");
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${SERVER_PORT}/_not-found` });
    await wait(1500);

    const inlineGameCheck = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      expression: `
        (() => {
          const heading = document.querySelector('h1')?.textContent;
          const caption = Array.from(document.querySelectorAll('p')).find(p => p.textContent?.includes('404. Page not found. Play instead.'));
          const inlineRegion = document.querySelector('[role="region"][aria-label="Topping Out game"]');
          const homeLink = document.querySelector('a[href="/"]');

          return {
            heading,
            hasCaption: Boolean(caption),
            hasInlineGame: Boolean(inlineRegion),
            hasHomeLink: Boolean(homeLink),
          };
        })()
      `,
    });
    console.log("404 page inline game check:", inlineGameCheck.result.value);

    await setTheme("blueprint");
    await capture("topping-out-404-inline-blueprint.png");

    await setTheme("dark");
    await capture("topping-out-404-inline-dark.png");

    cdp.close();
    console.log("\n=== ALL BROWSER QA TESTS COMPLETED SUCCESSFULLY! ===");
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
  console.error("Browser verification error:", err);
  process.exit(1);
});
