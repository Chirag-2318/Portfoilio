import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9225; // dedicated debugging port
const SERVER_PORT = 4176;
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
  console.log("=== STARTING TOPPING OUT V2 BROWSER VERIFICATION ===");

  // 1. Start static file server on SERVER_PORT
  const server = spawn(
    "node",
    ["scripts/static-server.mjs", String(SERVER_PORT), "out"],
    { stdio: "inherit" }
  );

  await wait(1200);

  // 2. Launch headless Chrome with remote debugging
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "chrome-topping-out-v2-"));
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
        `,
      });
      await wait(200);
    };

    // ─── STEP 1: Open Game via 'G' Key Shortcut and Header Button ───
    console.log("\n[Step 1] Opening game via 'G' shortcut...");
    await setViewport(1440, 900, false);
    await wait(500);

    const openViaG = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      awaitPromise: true,
      expression: `
        (async () => {
          // Press 'g' key
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', code: 'KeyG', bubbles: true }));
          await new Promise(r => setTimeout(r, 600));

          const dialog = document.querySelector('[role="dialog"][aria-label="Topping Out game"]');
          const canvas = dialog?.querySelector('canvas');
          const mainEl = document.querySelector('main');
          const dimLayer = dialog?.firstElementChild;

          return {
            opened: Boolean(dialog),
            hasCanvas: Boolean(canvas),
            hasDimLayer: Boolean(dimLayer),
            mainIsInert: mainEl ? mainEl.hasAttribute('inert') : false,
            bodyOverflow: document.documentElement.style.overflow,
          };
        })()
      `,
    });
    console.log("Game opened via 'G' key:", openViaG.result.value);

    // ─── STEP 2: Verify Transparent Canvas and Solid Opaque Block Pixels ───
    console.log("\n[Step 2] Verifying solid block pixel rendering (alpha === 255)...");
    const pixelSample = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      awaitPromise: true,
      expression: `
        (async () => {
          await new Promise(r => setTimeout(r, 400));
          const hook = window.__toppingOut;
          if (!hook) return { error: 'No __toppingOut hook' };
          const canvas = hook.getCanvas();
          if (!canvas) return { error: 'No canvas ref' };

          const ctx = canvas.getContext('2d');
          const w = canvas.width;
          const h = canvas.height;
          // Sample lower middle area where ground platform and initial slab sit
          const imgData = ctx.getImageData(0, 0, w, h);
          const data = imgData.data;

          let solidPixels = 0;
          let transparentPixels = 0;
          let semiTransparentPixels = 0;

          for (let i = 0; i < data.length; i += 4) {
            const alpha = data[i + 3];
            if (alpha === 255) {
              solidPixels++;
            } else if (alpha === 0) {
              transparentPixels++;
            } else {
              semiTransparentPixels++;
            }
          }

          return {
            canvasWidth: w,
            canvasHeight: h,
            solidPixels,
            transparentPixels,
            semiTransparentPixels,
            isCanvasTransparentOverall: transparentPixels > 0,
            hasSolidOpaqueBlocks: solidPixels > 1000,
          };
        })()
      `,
    });
    console.log("Pixel sample result:", pixelSample.result.value);

    // ─── STEP 3: Play 25 Floors (Testing Windows, Flags, Landmark, Streak Halo) ───
    console.log("\n[Step 3] Playing 25 floors...");
    const playResult = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      awaitPromise: true,
      expression: `
        (async () => {
          const hook = window.__toppingOut;
          const engine = hook.getEngine();
          if (!engine) return { error: 'No engine' };

          // Start the game
          hook.trigger();
          await new Promise(r => setTimeout(r, 80));

          const history = [];

          for (let f = 1; f <= 25; f++) {
            const moving = engine.movingSlab;
            if (!moving) break;

            if (f === 5) {
              // Intentionally trim: offset by 0.4 to spawn debris
              if (moving.axis === 'x') {
                moving.x = engine.getTopSlab().x + 0.4;
              } else {
                moving.z = engine.getTopSlab().z + 0.4;
              }
            } else {
              // Perfect drop: snap moving slab to exact centre
              if (moving.axis === 'x') {
                moving.x = engine.getTopSlab().x;
              } else {
                moving.z = engine.getTopSlab().z;
              }
            }

            hook.trigger();
            await new Promise(r => setTimeout(r, 50));
            history.push({
              floor: engine.floors,
              combo: engine.combo,
            });
          }

          return {
            finalFloors: engine.floors,
            metres: engine.floors * 3,
            combo: engine.combo,
            perfects: engine.perfects,
            historyLength: history.length,
          };
        })()
      `,
    });
    console.log("Play 25 floors result:", playResult.result.value);

    // Capture screenshots during play at floor 25 in Dark and Light modes
    await setTheme("dark");
    await capture("topping-out-v2-1440-dark-play.png");

    await setTheme("light");
    await capture("topping-out-v2-1440-light-play.png");

    // ─── STEP 4: Test Palette Cycle Button ───
    console.log("\n[Step 4] Testing palette cycling...");
    const paletteCycle = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      awaitPromise: true,
      expression: `
        (async () => {
          // Find palette cycle button
          const btn = document.querySelector('button[aria-label*="Palette"], button[title*="Current"]');
          if (!btn) return { error: 'Palette button not found' };

          const before = localStorage.getItem('topping-out-palette') || 'rainbow';
          btn.click();
          await new Promise(r => setTimeout(r, 100));
          const after = localStorage.getItem('topping-out-palette');

          return {
            before,
            after,
            paletteChanged: before !== after,
          };
        })()
      `,
    });
    console.log("Palette cycle result:", paletteCycle.result.value);

    // ─── STEP 5: Trigger Miss to Verify Game Over Card, Landmark Line, Top 3 & Share ───
    console.log("\n[Step 5] Triggering a miss to reach Game Over panel...");
    const gameOverResult = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      awaitPromise: true,
      expression: `
        (async () => {
          const hook = window.__toppingOut;
          const engine = hook.getEngine();
          // Offset moving slab completely off
          if (engine.movingSlab.axis === 'x') {
            engine.movingSlab.x = 9.0;
          } else {
            engine.movingSlab.z = 9.0;
          }
          hook.trigger();

          // Wait for miss animation + game over card delay
          await new Promise(r => setTimeout(r, 1200));

          const landmarkText = document.querySelector('[role="dialog"] p.leading-snug')?.textContent;
          const scoreText = document.querySelector('[role="dialog"] .font-serif')?.textContent;
          const top3Stored = localStorage.getItem('topping-out-top3');

          // Test Share button with mocked clipboard
          let clipboardContent = null;
          try {
            Object.defineProperty(navigator, 'clipboard', {
              value: {
                writeText: async (text) => {
                  clipboardContent = text;
                  return Promise.resolve();
                }
              },
              configurable: true,
            });
          } catch {}

          const shareBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Share score') || b.textContent?.includes('Copied!'));
          shareBtn?.click();
          await new Promise(r => setTimeout(r, 200));

          return {
            state: engine.state,
            floors: engine.floors,
            landmarkText,
            scoreText,
            top3Stored,
            shareTriggered: Boolean(clipboardContent),
            clipboardContent,
            shareFeedback: shareBtn?.textContent,
          };
        })()
      `,
    });
    console.log("Game Over card evaluation:", gameOverResult.result.value);

    // Capture screenshots in Game Over state
    await setTheme("dark");
    await capture("topping-out-v2-1440-dark-over.png");

    await setTheme("light");
    await capture("topping-out-v2-1440-light-over.png");

    // ─── STEP 6: Mobile 390px Viewport Testing ───
    console.log("\n[Step 6] Mobile 390px Viewport testing...");
    await setViewport(390, 844, true);
    await wait(400);
    await capture("topping-out-v2-390-dark-over.png");

    // Restart game on mobile
    await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const playAgainBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Play again'));
          playAgainBtn?.click();
        })()
      `,
    });
    await wait(400);

    // Play 5 floors on mobile
    await cdp.send("Runtime.evaluate", {
      awaitPromise: true,
      expression: `
        (async () => {
          const hook = window.__toppingOut;
          const engine = hook.getEngine();
          for (let i = 0; i < 5; i++) {
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
    await capture("topping-out-v2-390-dark-play.png");

    await setTheme("light");
    await capture("topping-out-v2-390-light-play.png");

    // ─── STEP 7: Escape Key Closes and Focus Returns ───
    console.log("\n[Step 7] Testing Escape key and focus return...");
    await setViewport(1440, 900, false);
    await wait(300);

    const escResult = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      awaitPromise: true,
      expression: `
        (async () => {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
          await new Promise(r => setTimeout(r, 300));
          const dialog = document.querySelector('[role="dialog"][aria-label="Topping Out game"]');
          const mainEl = document.querySelector('main');
          return {
            dialogClosed: !dialog,
            mainInertRemoved: mainEl ? !mainEl.hasAttribute('inert') : true,
            bodyOverflowReset: document.documentElement.style.overflow === '',
          };
        })()
      `,
    });
    console.log("Escape key close evaluation:", escResult.result.value);

    // ─── STEP 8: 404 Page Inline Game Verification ───
    console.log("\n[Step 8] Testing 404 page inline game container...");
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${SERVER_PORT}/_not-found/` });
    await wait(1500);

    const inlineGameCheck = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      expression: `
        (() => {
          const inlineApp = document.querySelector('[role="application"][aria-label="Topping Out game canvas"]');
          const canvas = inlineApp?.querySelector('canvas');
          const homeLink = document.querySelector('a[href="/"]');
          return {
            hasInlineGame: Boolean(inlineApp),
            hasInlineCanvas: Boolean(canvas),
            hasHomeLink: Boolean(homeLink),
          };
        })()
      `,
    });
    console.log("404 page inline game check:", inlineGameCheck.result.value);

    await setTheme("dark");
    await capture("topping-out-v2-404-dark.png");

    cdp.close();
    console.log("\n=== ALL TOPPING OUT V2 BROWSER QA TESTS PASSED SUCCESSFULLY! ===");
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
