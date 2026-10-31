import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9225;
const BASE_URL = "http://localhost:4173";
const SCREENSHOT_DIR = path.join(process.cwd(), "screenshots");
const AXE_SRC = fs.readFileSync(
  path.join(process.cwd(), "node_modules/axe-core/axe.min.js"),
  "utf8"
);

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
  const tmpDir = path.join(os.tmpdir(), `chrome-audit-p9-${Date.now()}`);
  const chrome = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${PORT}`,
      "--headless=new",
      "--disable-gpu",
      `--user-data-dir=${tmpDir}`,
      `${BASE_URL}/`,
    ],
    { stdio: "ignore" }
  );

  const auditResults = {
    responsive: [],
    axe: [],
    touchTargets: [],
  };

  try {
    const wsUrl = await getPageWsUrl();
    const cdp = new CDPClient(wsUrl);
    await cdp.connect();

    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Emulation.setFocusEmulationEnabled", { enabled: true });

    async function evaluate(expression) {
      try {
        const res = await cdp.send("Runtime.evaluate", {
          expression,
          returnByValue: true,
          awaitPromise: true,
        });
        if (res.exceptionDetails) {
          const desc =
            res.exceptionDetails.exception?.description ||
            res.exceptionDetails.text ||
            "Evaluation error";
          console.warn("CDP evaluation warning:", desc);
          return null;
        }
        return res.result?.value;
      } catch (err) {
        console.warn("CDP evaluate call failed:", err.message);
        return null;
      }
    }

    async function setViewport(width, height, dsf = 1.0, isMobile = false) {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: dsf,
        mobile: isMobile,
      });
      await wait(100);
    }

    async function setTheme(theme) {
      await evaluate(`
        document.documentElement.setAttribute('data-theme', '${theme}');
        localStorage.setItem('theme', '${theme}');
      `);
      await wait(150);
    }

    async function captureScreenshot(filename) {
      const res = await cdp.send("Page.captureScreenshot", { format: "png" });
      fs.writeFileSync(
        path.join(SCREENSHOT_DIR, filename),
        Buffer.from(res.data, "base64")
      );
    }

    // =====================================================================
    // PART A: RESPONSIVE AUDIT
    // =====================================================================
    console.log("\n=== PART A: RESPONSIVE AUDIT ===");

    const viewports = [
      { name: "320x568", w: 320, h: 568, mobile: true },
      { name: "360x740", w: 360, h: 740, mobile: true },
      { name: "390x844", w: 390, h: 844, mobile: true },
      { name: "768x1024", w: 768, h: 1024, mobile: false },
      { name: "1024x768", w: 1024, h: 768, mobile: false },
      { name: "1280x720", w: 1280, h: 720, mobile: false },
      { name: "1366x768", w: 1366, h: 768, mobile: false },
      { name: "1440x900", w: 1440, h: 900, mobile: false },
      { name: "1920x1080", w: 1920, h: 1080, mobile: false },
      { name: "2560x1440", w: 2560, h: 1440, mobile: false },
      { name: "844x390-landscape", w: 844, h: 390, mobile: true },
      { name: "1280x720-zoom200", w: 1280, h: 720, dsf: 2.0, mobile: false },
    ];

    const routesToTest = [
      "/",
      "/work/",
      "/work/#sar",
      "/work/#validedi",
      "/work/#arthix",
      "/about/",
      "/about/#profile",
      "/about/#education",
      "/about/#skills",
      "/about/#highlights",
      "/resume/",
      "/contact/",
      "/404.html",
    ];

    for (const vp of viewports) {
      await setViewport(vp.w, vp.h, vp.dsf || 1.0, vp.mobile);

      for (const route of routesToTest) {
        await cdp.send("Page.navigate", { url: `${BASE_URL}${route}` });
        await wait(250);

        const check = await evaluate(`
          (() => {
            const docWidth = document.documentElement.scrollWidth;
            const winWidth = window.innerWidth;
            const hasHOverflow = docWidth > winWidth + 1; // 1px threshold for rounding
            
            const isHome = window.location.pathname === '/' || window.location.pathname === '';
            const main = document.getElementById('content');
            const mainScrollHeight = main ? main.scrollHeight : 0;
            const mainClientHeight = main ? main.clientHeight : 0;
            const homeScrolled = isHome && (mainScrollHeight > mainClientHeight + 5);

            // Container width check (max 1760px)
            const container = document.querySelector('#content > div');
            const containerWidth = container ? container.getBoundingClientRect().width : 0;
            const containerExceeds = containerWidth > 1761;

            return {
              hasHOverflow,
              docWidth,
              winWidth,
              homeScrolled,
              mainScrollHeight,
              mainClientHeight,
              containerWidth,
              containerExceeds
            };
          })()
        `);

        if (!check) {
          console.warn(`Could not evaluate check on ${vp.name} | ${route}`);
          continue;
        }

        const isHome = route === "/";
        let status = "PASS";
        let note = "Clean layout";

        if (check.hasHOverflow) {
          status = "FAIL";
          note = `Horizontal overflow: docWidth ${check.docWidth} > winWidth ${check.winWidth}`;
        } else if (isHome && vp.h >= 640 && check.homeScrolled) {
          status = "FAIL";
          note = `Home scrolled at height ${vp.h}px (${check.mainScrollHeight} > ${check.mainClientHeight})`;
        } else if (check.containerExceeds) {
          status = "FAIL";
          note = `Container exceeded 1760px (${check.containerWidth}px)`;
        }

        auditResults.responsive.push({
          viewport: vp.name,
          route,
          status,
          note,
        });

        if (status === "FAIL") {
          console.error(`[FAIL] ${vp.name} | ${route} -> ${note}`);
        }
      }
      console.log(`Responsive verified: ${vp.name}`);
    }

    // Capture visual verification screenshots at standard breakpoints in light and dark
    const captureVps = [
      { name: "320", w: 320, h: 568 },
      { name: "390", w: 390, h: 844 },
      { name: "768", w: 768, h: 1024 },
      { name: "1024", w: 1024, h: 768 },
      { name: "1440", w: 1440, h: 900 },
    ];

    const captureRoutes = [
      { route: "/", name: "home" },
      { route: "/work/", name: "work" },
      { route: "/about/", name: "about" },
      { route: "/resume/", name: "resume" },
      { route: "/contact/", name: "contact" },
      { route: "/404.html", name: "404" },
    ];

    for (const theme of ["light", "dark"]) {
      for (const vp of captureVps) {
        await setViewport(vp.w, vp.h, 1.0, vp.w < 768);
        for (const cr of captureRoutes) {
          await cdp.send("Page.navigate", { url: `${BASE_URL}${cr.route}` });
          await wait(200);
          await setTheme(theme);
          await captureScreenshot(`p9-${cr.name}-${vp.name}-${theme}.png`);
        }
      }
    }
    console.log("Verification screenshots captured across all viewports and themes.");

    // =====================================================================
    // PART B: AXE-CORE ACCESSIBILITY AUDIT
    // =====================================================================
    console.log("\n=== PART B: AXE-CORE ACCESSIBILITY AUDIT ===");

    const axeRoutes = ["/", "/work/", "/about/", "/resume/", "/contact/", "/404.html"];

    for (const theme of ["light", "dark"]) {
      for (const route of axeRoutes) {
        await setViewport(1440, 900, 1.0, false);
        await cdp.send("Page.navigate", { url: `${BASE_URL}${route}` });
        await wait(300);
        await setTheme(theme);

        // Inject axe-core
        await evaluate(AXE_SRC);

        const results = await evaluate(`
          new Promise((resolve, reject) => {
            axe.run(
              {
                runOnly: {
                  type: 'tag',
                  values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']
                }
              },
              (err, res) => {
                if (err) reject(err);
                else resolve(res);
              }
            );
          })
        `);

        const violations = results.violations || [];
        auditResults.axe.push({
          theme,
          route,
          violationsCount: violations.length,
          violations: violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            nodes: v.nodes.length,
            helpUrl: v.helpUrl,
          })),
        });

        if (violations.length === 0) {
          console.log(`[PASS] ${theme.toUpperCase()} | ${route} -> 0 violations`);
        } else {
          console.error(`[FAIL] ${theme.toUpperCase()} | ${route} -> ${violations.length} violations:`);
          for (const v of violations) {
            console.error(`  - ${v.id} (${v.impact}): ${v.description}`);
          }
        }
      }
    }

    // =====================================================================
    // TOUCH TARGETS & COARSE POINTER AUDIT
    // =====================================================================
    console.log("\n=== TOUCH TARGET AUDIT ===");
    await setViewport(390, 844, 1.0, true);
    await cdp.send("Page.navigate", { url: `${BASE_URL}/` });
    await wait(300);

    const touchChecks = await evaluate(`
      (() => {
        const interactive = Array.from(document.querySelectorAll('button, a, [role="button"], [role="tab"]'));
        const issues = [];
        for (const el of interactive) {
          if (el.offsetParent === null) continue; // hidden
          const rect = el.getBoundingClientRect();
          // Check visual or pseudo-element enlarged bounds
          const w = rect.width;
          const h = rect.height;
          const label = el.getAttribute('aria-label') || el.innerText || el.tagName;
          if (w < 40 || h < 40) {
            issues.push({ label: label.slice(0, 30).trim(), width: Math.round(w), height: Math.round(h) });
          }
        }
        return issues;
      })()
    `);

    console.log("Touch target issues found on Home:", touchChecks);

    // Save results JSON for writing to AUDIT.md
    fs.writeFileSync(
      "scripts/audit-results.json",
      JSON.stringify(auditResults, null, 2)
    );
    console.log("\nAudit finished. Results saved to scripts/audit-results.json");
  } finally {
    chrome.kill();
  }
}

main().catch((err) => {
  console.error("Audit script failed:", err);
  process.exit(1);
});
