import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9223; // use a distinct port to avoid conflicts
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
  const tmpDir = path.join(os.tmpdir(), `chrome-test-p7-${Date.now()}`);
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
        if (data.method === "Runtime.consoleAPICalled" && (data.params.type === "error" || data.params.type === "warning")) {
          const text = data.params.args.map((a) => a.value || a.description || "").join(" ");
          if (!text.includes("favicon") && !text.includes("Download the React DevTools")) {
            consoleErrors.push(`[${data.params.type}] ${text}`);
          }
        }
        if (data.method === "Runtime.exceptionThrown") {
          const det = data.params.exceptionDetails;
          consoleErrors.push(`[exception] ${det?.text || ""} ${det?.exception?.description || ""} at ${det?.url}:${det?.lineNumber}`);
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

    async function navigate(url) {
      await cdp.send("Page.navigate", { url });
      await wait(800);
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

    console.log("=== PROMPT 7 VERIFICATION COMMENCING ===");

    // Test 1: Home View, Navigation accessibility & FlipText structure
    await setViewport(1440, 900);
    await navigate("http://localhost:3000/");
    await wait(1000);

    const navCheck = await evaluate(`(() => {
      const navLinks = Array.from(document.querySelectorAll('header nav a'));
      return navLinks.map(a => ({
        text: a.textContent.trim(),
        ariaLabel: a.getAttribute('aria-label') || a.innerText.trim(),
        hasFlipText: !!a.querySelector('[aria-hidden="true"]'),
        hasSrOnly: !!a.querySelector('.sr-only')
      }));
    })()`);
    console.log("Nav links accessibility check:", navCheck);

    // Capture Home 1440 Light
    await capture("p7-home-1440-light.png");

    // Test 2: Theme Toggle .theme-fade class
    console.log("Testing theme toggle and .theme-fade class...");
    const themeFadeCheck = await evaluate(`(async () => {
      const toggle = document.querySelector('button[aria-label*="theme" i], button[aria-label*="mode" i], header button:nth-of-type(1)');
      if (!toggle) return { error: "Toggle not found" };
      toggle.click();
      const hasClassImmediate = document.documentElement.classList.contains('theme-fade');
      await new Promise(r => setTimeout(r, 350));
      const hasClassAfterTimeout = document.documentElement.classList.contains('theme-fade');
      return { hasClassImmediate, hasClassAfterTimeout, theme: document.documentElement.getAttribute('data-theme') };
    })()`);
    console.log("Theme fade check result:", themeFadeCheck);

    // Capture Home 1440 Dark
    await capture("p7-home-1440-dark.png");

    // Switch back to light
    await evaluate(`(() => {
      const toggle = document.querySelector('button[aria-label*="theme" i], button[aria-label*="mode" i], header button:nth-of-type(1)');
      if (toggle) toggle.click();
    })()`);
    await wait(350);

    // Test 3: Work View "Next project" button cycling
    console.log("Testing Work view 'Next project' button cycling...");
    await navigate("http://localhost:3000/work/");
    await wait(600);

    const initialHash = await evaluate(`window.location.hash`);
    console.log("Initial work hash:", initialHash);

    const cycle1 = await evaluate(`(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const found = btns.find(b => b.textContent.includes('Next') || b.getAttribute('aria-label')?.includes('Next'));
      if (found) {
        found.click();
        return { clicked: true, text: found.textContent.trim() };
      }
      return { clicked: false, availableButtons: btns.map(b => b.textContent.trim()).filter(Boolean) };
    })()`);
    console.log("Cycle 1 click result:", cycle1);
    await wait(300);
    const hashAfterClick1 = await evaluate(`window.location.hash`);
    console.log("Hash after click 1:", hashAfterClick1);

    const cycle2 = await evaluate(`(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const found = btns.find(b => b.textContent.includes('Next') || b.getAttribute('aria-label')?.includes('Next'));
      if (found) {
        found.click();
        return { clicked: true };
      }
      return { clicked: false };
    })()`);
    console.log("Cycle 2 click result:", cycle2);
    await wait(300);
    const hashAfterClick2 = await evaluate(`window.location.hash`);
    console.log("Hash after click 2:", hashAfterClick2);

    const cycle3 = await evaluate(`(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const found = btns.find(b => b.textContent.includes('Next') || b.getAttribute('aria-label')?.includes('Next'));
      if (found) {
        found.click();
        return { clicked: true };
      }
      return { clicked: false };
    })()`);
    console.log("Cycle 3 click result:", cycle3);
    await wait(300);
    const hashAfterClick3 = await evaluate(`window.location.hash`);
    console.log("Hash after click 3 (cycled back):", hashAfterClick3);

    // Capture Work 1440 Light
    await capture("p7-work-1440-light.png");

    // Capture Work 1440 Dark
    await evaluate(`document.documentElement.setAttribute('data-theme', 'dark')`);
    await wait(100);
    await capture("p7-work-1440-dark.png");
    await evaluate(`document.documentElement.setAttribute('data-theme', 'light')`);

    // Test 4: About View
    await navigate("http://localhost:3000/about/");
    await wait(600);
    await capture("p7-about-1440-light.png");
    await evaluate(`document.documentElement.setAttribute('data-theme', 'dark')`);
    await wait(100);
    await capture("p7-about-1440-dark.png");
    await evaluate(`document.documentElement.setAttribute('data-theme', 'light')`);

    // Test 5: Resume View
    await navigate("http://localhost:3000/resume/");
    await wait(600);
    await capture("p7-resume-1440-light.png");
    await evaluate(`document.documentElement.setAttribute('data-theme', 'dark')`);
    await wait(100);
    await capture("p7-resume-1440-dark.png");
    await evaluate(`document.documentElement.setAttribute('data-theme', 'light')`);

    // Test 6: Contact View & Email FlipText Check
    await navigate("http://localhost:3000/contact/");
    await wait(600);

    const contactEmailCheck = await evaluate(`(() => {
      const emailLink = document.querySelector('a[href^="mailto:"]');
      return {
        href: emailLink?.getAttribute('href'),
        text: emailLink?.textContent.trim(),
        hasSrOnly: !!emailLink?.querySelector('.sr-only'),
        hasUnderlineSpan: !!emailLink?.querySelector('span.absolute.left-0.right-0')
      };
    })()`);
    console.log("Contact email accessibility check:", contactEmailCheck);

    await capture("p7-contact-1440-light.png");
    await evaluate(`document.documentElement.setAttribute('data-theme', 'dark')`);
    await wait(100);
    await capture("p7-contact-1440-dark.png");
    await evaluate(`document.documentElement.setAttribute('data-theme', 'light')`);

    // Test 7: Tablet (768x1024)
    await setViewport(768, 1024);
    await navigate("http://localhost:3000/");
    await wait(600);
    await capture("p7-home-768-light.png");
    await navigate("http://localhost:3000/work/");
    await wait(600);
    await capture("p7-work-768-light.png");

    // Test 8: Mobile (390x844)
    await setViewport(390, 844);
    await navigate("http://localhost:3000/");
    await wait(600);
    await capture("p7-home-390-light.png");
    await evaluate(`document.documentElement.setAttribute('data-theme', 'dark')`);
    await wait(100);
    await capture("p7-home-390-dark.png");
    await evaluate(`document.documentElement.setAttribute('data-theme', 'light')`);

    await navigate("http://localhost:3000/work/");
    await wait(600);
    await capture("p7-work-390-light.png");

    await navigate("http://localhost:3000/contact/");
    await wait(600);
    await capture("p7-contact-390-light.png");

    // Test 9: Emulate prefers-reduced-motion: reduce
    console.log("Testing prefers-reduced-motion: reduce...");
    await cdp.send("Emulation.setEmulatedMedia", {
      media: "screen",
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    });
    await navigate("http://localhost:3000/work/");
    await wait(400);
    await navigate("http://localhost:3000/about/");
    await wait(400);
    await navigate("http://localhost:3000/");
    await wait(400);

    console.log("Console errors/warnings count:", consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.warn("Recorded console logs:", consoleErrors);
    }

    cdp.close();
    console.log("=== PROMPT 7 VERIFICATION COMPLETE ===");
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
