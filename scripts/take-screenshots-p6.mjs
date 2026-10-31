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
  const tmpDir = path.join(os.tmpdir(), `chrome-test-p6-${Date.now()}`);
  const chrome = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${PORT}`,
      "--headless=new",
      "--disable-gpu",
      `--user-data-dir=${tmpDir}`,
      "http://localhost:3000/resume/",
    ],
    { stdio: "ignore" }
  );

  try {
    const wsUrl = await getPageWsUrl();
    const cdp = new CDPClient(wsUrl);
    await cdp.connect();

    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    try {
      await cdp.send("Browser.grantPermissions", {
        permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"],
      });
    } catch {}

    // Track console errors
    const consoleErrors = [];
    cdp.ws.addEventListener("message", (e) => {
      try {
        const d = JSON.parse(e.data);
        if (d.method === "Runtime.consoleAPICalled" && d.params.type === "error") {
          consoleErrors.push(
            d.params.args.map((a) => a.value || a.description || JSON.stringify(a)).join(" ")
          );
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
      await wait(300);
    }

    async function setTheme(theme) {
      await cdp.send("Runtime.evaluate", {
        expression: `
          (function() {
            const root = document.documentElement;
            if ("${theme}" === "dark") {
              root.classList.add("dark");
              root.classList.remove("light");
              root.setAttribute("data-theme", "dark");
            } else {
              root.classList.add("light");
              root.classList.remove("dark");
              root.setAttribute("data-theme", "light");
            }
          })()
        `,
      });
      await wait(200);
    }

    async function navigate(url) {
      await cdp.send("Page.navigate", { url });
      await wait(2000);
    }

    console.log("=== 1. VERIFY RESUME VIEW (/resume) ===");
    await navigate("http://localhost:3000/resume/");

    // Check viewport heights & scrolling at 1366x768
    await setViewport(1366, 768);
    await setTheme("light");
    const resume1366Info = await cdp.send("Runtime.evaluate", {
      expression: `
        (function() {
          const content = document.getElementById("content");
          const sheet = document.getElementById("resume-sheet");
          return {
            contentScrolls: content ? content.scrollHeight > content.clientHeight + 4 : false,
            sheetScrolls: sheet ? sheet.scrollHeight > sheet.clientHeight : false,
            sheetHeight: sheet ? sheet.offsetHeight : 0,
            hasCornerTicks: !!document.querySelector('#resume-sheet ~ [aria-hidden="true"], [data-print="hide"] .bg-ink-3')
          };
        })()
      `,
      returnByValue: true,
    });
    console.log("Resume 1366x768 info:", resume1366Info.result.value);
    await capture("resume-1366x768-light.png");

    await setTheme("dark");
    await capture("resume-1366x768-dark.png");

    // 1440x900
    await setViewport(1440, 900);
    await setTheme("light");
    await capture("resume-1440x900-light.png");
    await setTheme("dark");
    await capture("resume-1440x900-dark.png");

    // 768x1024 (Tablet)
    await setViewport(768, 1024);
    await setTheme("light");
    await capture("resume-768x1024-light.png");

    // 390x844 (Mobile)
    await setViewport(390, 844, true);
    await setTheme("light");
    const resume390Info = await cdp.send("Runtime.evaluate", {
      expression: `
        (function() {
          const content = document.getElementById("content");
          const sheet = document.getElementById("resume-sheet");
          const screens = content ? (content.scrollHeight / 844).toFixed(2) : 0;
          return {
            screens,
            sheetOffsetTop: sheet ? sheet.offsetTop : 0
          };
        })()
      `,
      returnByValue: true,
    });
    console.log("Resume 390x844 screens tall:", resume390Info.result.value);
    await capture("resume-390x844-light.png");

    await setTheme("dark");
    await capture("resume-390x844-dark.png");

    // Test "PDF coming soon" toast button
    console.log("Testing PDF coming soon click...");
    const toastCheck = await cdp.send("Runtime.evaluate", {
      expression: `
        (function() {
          const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("PDF coming soon"));
          if (!btn) return { found: false };
          btn.click();
          return { found: true };
        })()
      `,
      returnByValue: true,
    });
    await wait(300);
    const toastMessage = await cdp.send("Runtime.evaluate", {
      expression: `
        (function() {
          const toast = document.querySelector('[role="status"]');
          return toast ? toast.textContent.trim() : null;
        })()
      `,
      returnByValue: true,
    });
    console.log("PDF toast result:", toastCheck.result.value, "Message:", toastMessage.result.value);

    // Test Jump To on desktop
    await setViewport(1440, 900);
    console.log("Testing Jump to buttons...");
    const jumpTest = await cdp.send("Runtime.evaluate", {
      expression: `
        (function() {
          const jumpBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Highlights"));
          if (!jumpBtn) return { jumpFound: false };
          jumpBtn.click();
          const sheet = document.getElementById("resume-sheet");
          return {
            jumpFound: true,
            scrollTop: sheet ? sheet.scrollTop : 0
          };
        })()
      `,
      returnByValue: true,
    });
    await wait(400);
    const jumpPostScroll = await cdp.send("Runtime.evaluate", {
      expression: `
        (function() {
          const sheet = document.getElementById("resume-sheet");
          return { scrollTop: sheet ? sheet.scrollTop : 0 };
        })()
      `,
      returnByValue: true,
    });
    console.log("Jump to test:", jumpTest.result.value, "After scroll:", jumpPostScroll.result.value);

    // Test Print preview emulation
    console.log("Testing print emulation...");
    await cdp.send("Emulation.setEmulatedMedia", { media: "print" });
    await wait(400);
    const printCheck = await cdp.send("Runtime.evaluate", {
      expression: `
        (function() {
          const header = document.querySelector("header[data-print='hide']");
          const footer = document.querySelector("footer[data-print='hide']");
          const actions = document.querySelector(".resume-actions-sidebar");
          const sheet = document.getElementById("resume-sheet");
          return {
            headerHidden: header ? window.getComputedStyle(header).display === "none" : true,
            footerHidden: footer ? window.getComputedStyle(footer).display === "none" : true,
            actionsHidden: actions ? window.getComputedStyle(actions).display === "none" : true,
            sheetVisible: sheet ? window.getComputedStyle(sheet).display !== "none" : false
          };
        })()
      `,
      returnByValue: true,
    });
    console.log("Print emulation check:", printCheck.result.value);
    await capture("resume-print-emulated.png");
    await cdp.send("Emulation.setEmulatedMedia", { media: "" });

    console.log("=== 2. VERIFY CONTACT VIEW (/contact) ===");
    await navigate("http://localhost:3000/contact/");

    // 1366x768 (Desktop)
    await setViewport(1366, 768);
    await setTheme("light");
    const contact1366Info = await cdp.send("Runtime.evaluate", {
      expression: `
        (function() {
          const content = document.getElementById("content");
          const docScroll = document.documentElement.scrollHeight > window.innerHeight;
          const contentScroll = content ? content.scrollHeight > content.clientHeight + 4 : false;
          return {
            docScroll,
            contentScroll,
            viewportHeight: window.innerHeight,
            contentHeight: content ? content.clientHeight : 0,
            scrollHeight: content ? content.scrollHeight : 0
          };
        })()
      `,
      returnByValue: true,
    });
    console.log("Contact 1366x768 scroll check (must be false):", contact1366Info.result.value);
    await capture("contact-1366x768-light.png");

    await setTheme("dark");
    await capture("contact-1366x768-dark.png");

    // 1440x900
    await setViewport(1440, 900);
    await setTheme("light");
    await capture("contact-1440x900-light.png");
    await setTheme("dark");
    await capture("contact-1440x900-dark.png");

    // 768x1024 (Tablet)
    await setViewport(768, 1024);
    await setTheme("light");
    await capture("contact-768x1024-light.png");

    // 390x844 (Mobile)
    await setViewport(390, 844, true);
    await setTheme("light");
    const contact390Info = await cdp.send("Runtime.evaluate", {
      expression: `
        (function() {
          const content = document.getElementById("content");
          const screens = content ? (content.scrollHeight / 844).toFixed(2) : 0;
          return { screens };
        })()
      `,
      returnByValue: true,
    });
    console.log("Contact 390x844 screens tall (must be <= ~1.5):", contact390Info.result.value);
    await capture("contact-390x844-light.png");

    await setTheme("dark");
    await capture("contact-390x844-dark.png");

    // 320px width check
    await setViewport(320, 640, true);
    const overflow320 = await cdp.send("Runtime.evaluate", {
      expression: `
        (function() {
          const emailLink = document.querySelector('a[href^="mailto:"]');
          const docOverflow = document.documentElement.scrollWidth > 320;
          return {
            docOverflow,
            emailWidth: emailLink ? emailLink.offsetWidth : 0,
            emailParentWidth: emailLink && emailLink.parentElement ? emailLink.parentElement.offsetWidth : 0
          };
        })()
      `,
      returnByValue: true,
    });
    console.log("Contact 320px width overflow check:", overflow320.result.value);

    // Test Copy button on contact view
    await setViewport(1440, 900);
    console.log("Testing Contact Copy Address button...");
    const copyTest = await cdp.send("Runtime.evaluate", {
      expression: `
        (function() {
          const copyBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Copy address"));
          if (!copyBtn) return { found: false };
          copyBtn.click();
          return { found: true };
        })()
      `,
      returnByValue: true,
    });
    await wait(200);
    const copyState = await cdp.send("Runtime.evaluate", {
      expression: `
        (function() {
          const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Copied"));
          const toast = document.querySelector('[role="status"]');
          return {
            labelIsCopied: !!btn,
            toastText: toast ? toast.textContent.trim() : null
          };
        })()
      `,
      returnByValue: true,
    });
    console.log("Copy button test result:", copyTest.result.value, copyState.result.value);

    // Check Console errors
    console.log("=== 3. CONSOLE ERROR AUDIT ===");
    console.log("Total console errors encountered:", consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.error("Console errors:", consoleErrors);
    }

    cdp.close();
  } finally {
    chrome.kill();
  }
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
