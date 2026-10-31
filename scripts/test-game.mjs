import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9224;
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
  const tmpDir = path.join(os.tmpdir(), `chrome-test-p8-${Date.now()}`);
  const chrome = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${PORT}`,
      "--headless=new",
      "--disable-gpu",
      `--user-data-dir=${tmpDir}`,
      "http://localhost:3000/",
    ],
    { stdio: "ignore" }
  );

  try {
    const wsUrl = await getPageWsUrl();
    const cdp = new CDPClient(wsUrl);
    await cdp.connect();

    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");

    const consoleErrors = [];
    cdp.ws.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        if (
          data.method === "Runtime.consoleAPICalled" &&
          (data.params.type === "error" || data.params.type === "warning")
        ) {
          const text = data.params.args.map((a) => a.value || a.description || "").join(" ");
          if (
            !text.includes("favicon") &&
            !text.includes("Download the React DevTools") &&
            !text.includes("reduced-motion")
          ) {
            consoleErrors.push(`[${data.params.type}] ${text}`);
          }
        }
        if (data.method === "Runtime.exceptionThrown") {
          const det = data.params.exceptionDetails;
          consoleErrors.push(`[exception] ${det?.text || ""} ${det?.exception?.description || ""}`);
        }
      } catch {}
    });

    async function setViewport(width, height) {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: width < 768,
      });
    }

    async function capture(filename) {
      const { data } = await cdp.send("Page.captureScreenshot", { format: "png" });
      const buffer = Buffer.from(data, "base64");
      const filePath = path.join(SCREENSHOT_DIR, filename);
      fs.writeFileSync(filePath, buffer);
      console.log(`Saved screenshot: ${filename} (${buffer.length} bytes)`);
    }

    async function evaluate(expression) {
      const res = await cdp.send("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (res.exceptionDetails) {
        throw new Error(res.exceptionDetails.text || "Evaluation error");
      }
      return res.result?.value;
    }

    console.log("=== PROMPT 8 VERIFICATION COMMENCING ===");

    await setViewport(1440, 900);
    await cdp.send("Page.navigate", { url: "http://localhost:3000/" });
    await wait(1200);

    // ==========================================
    // 1. Verify GameSlot button & Open via button
    // ==========================================
    const gameSlotCheck = await evaluate(`(() => {
      const btn = document.querySelector('[data-game-slot]');
      return {
        exists: !!btn,
        ariaLabel: btn?.getAttribute('aria-label'),
        ariaHasPopup: btn?.getAttribute('aria-haspopup'),
        ariaExpanded: btn?.getAttribute('aria-expanded')
      };
    })()`);
    console.log("GameSlot button check:", gameSlotCheck);

    console.log("1. Opening game via GameSlot button...");
    await evaluate(`(() => {
      const btn = document.querySelector('[data-game-slot]');
      btn.focus();
      btn.click();
    })()`);
    await wait(600); // 450ms reveal

    const openCheck = await evaluate(`(() => {
      const dialog = document.querySelector('[role="dialog"][aria-labelledby="reg-title"]');
      const appRoot = document.getElementById('app-root');
      return {
        dialogExists: !!dialog,
        appRootInert: appRoot?.hasAttribute('inert'),
        bodyOverflow: document.documentElement.style.overflow,
        introCardShowing: !!dialog?.querySelector('h3'),
        introTitle: dialog?.querySelector('h3')?.textContent
      };
    })()`);
    console.log("Game open check (via button):", openCheck);

    // Capture Intro Light & Dark
    await capture("p8-game-intro-1440-light.png");
    await evaluate(`document.documentElement.setAttribute('data-theme', 'dark')`);
    await wait(150);
    await capture("p8-game-intro-1440-dark.png");
    await evaluate(`document.documentElement.setAttribute('data-theme', 'light')`);
    await wait(150);

    // Test Esc close
    console.log("Testing Esc close and focus restoration...");
    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape" });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape" });
    await wait(450); // wait for 350ms exit

    const closedCheck = await evaluate(`(() => {
      const dialog = document.querySelector('[role="dialog"][aria-labelledby="reg-title"]');
      const appRoot = document.getElementById('app-root');
      return {
        dialogGone: !dialog,
        appRootNotInert: !appRoot?.hasAttribute('inert'),
        bodyOverflowReset: document.documentElement.style.overflow === ''
      };
    })()`);
    console.log("Esc close check:", closedCheck);

    // ==========================================
    // 2. Test Open via Command Menu
    // ==========================================
    console.log("2. Testing Open via Command Menu...");
    await evaluate(`(() => {
      const cmdBtn = document.querySelector('button[aria-label="Open command menu"]');
      if (cmdBtn) cmdBtn.click();
    })()`);
    await wait(350);

    const cmdMenuOpen = await evaluate(`(() => {
      const item = document.querySelector('[data-cmd-id="act-play-game"]') ||
        Array.from(document.querySelectorAll('[cmdk-item]')).find(el => el.textContent.includes('Play Registration'));
      if (item) {
        item.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        item.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        item.click();
        return { clicked: true };
      }
      return { clicked: false };
    })()`);
    console.log("Command menu trigger result:", cmdMenuOpen);
    await wait(750); // 150ms delay + 450ms animation

    const cmdOpenedCheck = await evaluate(`!!document.querySelector('[role="dialog"][aria-labelledby="reg-title"]')`);
    console.log("Game dialog opened from Command Menu:", cmdOpenedCheck);

    // Close via Close button in top bar
    console.log("Closing game via top-bar Close button...");
    await evaluate(`(() => {
      const closeBtn = document.querySelector('header button[aria-label="Close game"]');
      if (closeBtn) closeBtn.click();
    })()`);
    await wait(450);

    // ==========================================
    // 3. Gameplay testing
    // ==========================================
    console.log("3. Re-opening game via GameSlot for gameplay testing...");
    await evaluate(`(() => {
      const btn = document.querySelector('[data-game-slot]');
      if (btn) btn.click();
    })()`);
    await wait(600);

    // Click Start button on intro card
    console.log("Clicking Start button...");
    await evaluate(`(() => {
      const startBtn = document.querySelector('.card-container button');
      if (startBtn) startBtn.click();
    })()`);
    await wait(400);

    const isPlaying = await evaluate(`window.__gameEngine?.state === "playing"`);
    console.log("Game is playing:", isPlaying);

    // Capture Playing 1440 Light (unaligned)
    await capture("p8-game-playing-unaligned-1440-light.png");

    // Capture Playing 1440 Dark (unaligned - screen blend mode)
    await evaluate(`document.documentElement.setAttribute('data-theme', 'dark')`);
    await wait(150);
    await capture("p8-game-playing-unaligned-1440-dark.png");
    await evaluate(`document.documentElement.setAttribute('data-theme', 'light')`);
    await wait(150);

    // Test Keyboard navigation (Arrow keys move plate)
    console.log("Testing keyboard movement...");
    for (let i = 0; i < 5; i++) {
      await cdp.send("Input.dispatchKeyEvent", { type: "rawKeyDown", code: "ArrowLeft" });
      await wait(50);
    }
    await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", code: "ArrowLeft" });

    // Test Pause via Pause button in top bar
    console.log("Testing Pause button in top bar...");
    await evaluate(`(() => {
      const pauseBtn = document.querySelector('header button[aria-label="Pause"]');
      if (pauseBtn) pauseBtn.click();
    })()`);
    await wait(300);

    const pausedCheck = await evaluate(`(() => {
      const card = document.querySelector('.card-container h3');
      return {
        cardTitle: card?.textContent,
        isPaused: card?.textContent === 'Paused'
      };
    })()`);
    console.log("Paused check:", pausedCheck);

    // Capture Paused 1440 Light
    await capture("p8-game-paused-1440-light.png");

    // Resume via Resume button in card
    await evaluate(`(() => {
      const btns = Array.from(document.querySelectorAll('.card-container button'));
      const resumeBtn = btns.find(b => b.textContent.includes('Resume'));
      if (resumeBtn) resumeBtn.click();
    })()`);
    await wait(300);

    // Capture Shape 1 (Circle)
    await capture("p8-shape-1-circle.png");
    console.log("Captured shape 1: circle");

    // Helper to align plate with target
    async function alignPlate() {
      await evaluate(`(() => {
        const eng = window.__gameEngine;
        if (eng) {
          eng.plateX = eng.targetX;
          eng.plateY = eng.targetY;
          eng.plateVx = 0;
          eng.plateVy = 0;
        }
      })()`);
    }

    // Capture Aligned state
    await alignPlate();
    await wait(100);
    await capture("p8-game-playing-aligned-1440-light.png");

    // Step through and capture all remaining 7 shapes (Shape 2 to 8)
    const shapeNames = [
      "circle",
      "square",
      "triangle",
      "ring",
      "cross",
      "rounded-rect",
      "glyph-c",
      "glyph-p",
    ];

    console.log("Cycling through shapes to capture each shape in high resolution...");
    for (let i = 1; i <= 7; i++) {
      // Hold aligned for 1.1s to trigger PRINT
      for (let step = 0; step < 12; step++) {
        await alignPlate();
        await wait(100);
      }
      await wait(600); // wait for snap & slide

      // Wait for new sheet to settle
      await wait(200);
      const filename = `p8-shape-${i + 1}-${shapeNames[i]}.png`;
      await capture(filename);
      console.log(`Captured shape ${i + 1}: ${shapeNames[i]}`);
    }

    // Capture Tablet (768x1024)
    await setViewport(768, 1024);
    await wait(300);
    await capture("p8-game-768-light.png");

    // Capture Mobile (390x844)
    await setViewport(390, 844);
    await wait(300);
    await capture("p8-game-390-light.png");

    // Capture Mobile Dark
    await evaluate(`document.documentElement.setAttribute('data-theme', 'dark')`);
    await wait(150);
    await capture("p8-game-390-dark.png");
    await evaluate(`document.documentElement.setAttribute('data-theme', 'light')`);

    // Back to desktop for Game Over test
    await setViewport(1440, 900);
    await wait(300);

    // Test Game Over: trigger timeout on last sheet
    console.log("Testing Game Over state and score persistence...");
    await evaluate(`(() => {
      const eng = window.__gameEngine;
      if (eng) {
        eng.sheets = 1;
        eng.timeRemaining = 0.01;
      }
    })()`);
    await wait(1200);

    const gameOverCheck = await evaluate(`(() => {
      const region = document.querySelector('[role="region"][aria-live="polite"]');
      const h3 = region?.querySelector('h3');
      const score = region?.querySelector('.font-mono')?.textContent;
      return {
        isGameOver: h3?.textContent === 'Out of sheets.',
        scoreText: score
      };
    })()`);
    console.log("Game Over check:", gameOverCheck);

    // Capture Game Over card
    await capture("p8-game-over-1440-light.png");

    // Verify localStorage key "cp:registration:best"
    const bestCheck = await evaluate(`(() => {
      return {
        bestStored: localStorage.getItem('cp:registration:best')
      };
    })()`);
    console.log("Stored Best Score in localStorage:", bestCheck);

    // Test "Play again" button
    console.log("Testing Play Again button...");
    await evaluate(`(() => {
      const btns = Array.from(document.querySelectorAll('.card-container button'));
      const playAgain = btns.find(b => b.textContent.includes('Play again'));
      if (playAgain) playAgain.click();
    })()`);
    await wait(400);

    const playAgainCheck = await evaluate(`(() => {
      const eng = window.__gameEngine;
      return {
        state: eng?.state,
        sheets: eng?.sheets,
        prints: eng?.prints
      };
    })()`);
    console.log("After Play Again:", playAgainCheck);

    // Close overlay
    await evaluate(`(() => {
      const closeBtn = document.querySelector('header button[aria-label="Close game"]');
      if (closeBtn) closeBtn.click();
    })()`);
    await wait(500);

    console.log("Console errors count:", consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.warn("Recorded console logs:", consoleErrors);
    }

    cdp.close();
    console.log("=== PROMPT 8 VERIFICATION COMPLETE ===");
  } finally {
    chrome.kill("SIGKILL");
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
