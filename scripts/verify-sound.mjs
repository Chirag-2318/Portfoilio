import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9235;
const SERVER_PORT = 4185;

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
    this.events = [];
    this.soundEvents = [];
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
      } else if (data.method === "Runtime.consoleAPICalled") {
        const text = data.params.args.map((a) => a.value).join(" ");
        if (text.includes("[SOUND_EVENT]")) {
          const parts = text.split(" ");
          const soundName = parts[1];
          let cue = null;
          try {
            cue = JSON.parse(parts.slice(2).join(" "));
          } catch {}
          this.soundEvents.push({ sound: soundName, cue, raw: text });
        }
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

  clearSounds() {
    const list = [...this.soundEvents];
    this.soundEvents = [];
    return list;
  }

  close() {
    this.ws.close();
  }
}

async function main() {
  console.log("=== STARTING SOUND SYSTEM QA VERIFICATION ===");

  const server = spawn(
    "node",
    ["scripts/static-server.mjs", String(SERVER_PORT), "out"],
    { stdio: "inherit" }
  );
  await wait(1200);

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "chrome-sound-qa-"));
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
  await wait(1500);

  const resultsTable = [];

  try {
    const wsUrl = await getPageWsUrl();
    const cdp = new CDPClient(wsUrl);
    await cdp.connect();

    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${SERVER_PORT}/` });
    await wait(1500);

    // Test 1: Page Load (Silence rule)
    console.log("\n[Test 1] Checking page load silence...");
    const loadSounds = cdp.clearSounds();
    const loadPassed = loadSounds.length === 0;
    resultsTable.push({
      control: "Page load / initial render",
      expected: "Silence (0 sounds)",
      observed: loadSounds.length === 0 ? "Silence (0 sounds)" : loadSounds.map(s => s.sound).join(", "),
      status: loadPassed ? "PASS" : "FAIL"
    });
    console.log(`Page load silence: ${loadPassed ? "PASSED" : "FAILED"}`);

    // Helper to evaluate and click element (fires pointerdown like a real pointer, then click)
    const clickSelector = async (selector, description) => {
      cdp.clearSounds();
      await cdp.send("Runtime.evaluate", {
        expression: `
          (() => {
            const el = document.querySelector(${JSON.stringify(selector)});
            if (el) {
              el.scrollIntoView({ block: 'center' });
              const rect = el.getBoundingClientRect();
              const x = rect.left + rect.width / 2;
              const y = rect.top + rect.height / 2;
              el.dispatchEvent(new PointerEvent('pointerdown', {
                bubbles: true,
                cancelable: true,
                button: 0,
                clientX: x,
                clientY: y
              }));
              el.click();
              return true;
            }
            return false;
          })()
        `
      });
      await wait(350);
      return cdp.clearSounds();
    };

    // Helper for keyboard event
    const dispatchKey = async (key, code, modifiers = 0) => {
      cdp.clearSounds();
      await cdp.send("Input.dispatchKeyEvent", {
        type: "rawKeyDown",
        key,
        code,
        modifiers
      });
      await cdp.send("Input.dispatchKeyEvent", {
        type: "keyUp",
        key,
        code,
        modifiers
      });
      await wait(300);
      return cdp.clearSounds();
    };

    // Test 2: Theme Toggle Button (dark -> light -> dark)
    console.log("\n[Test 2] Checking Theme Toggle...");
    const themeSounds1 = await clickSelector("header button[title*='theme' i]", "Theme toggle to light");
    const themeSound1 = themeSounds1[0]?.sound;
    resultsTable.push({
      control: "Theme toggle (dark -> light)",
      expected: "toggleOn",
      observed: themeSound1 || "None",
      status: themeSound1 === "toggleOn" ? "PASS" : "FAIL"
    });

    const themeSounds2 = await clickSelector("header button[title*='theme' i]", "Theme toggle back to dark");
    const themeSound2 = themeSounds2[0]?.sound;
    resultsTable.push({
      control: "Theme toggle (light -> dark)",
      expected: "toggleOff",
      observed: themeSound2 || "None",
      status: themeSound2 === "toggleOff" ? "PASS" : "FAIL"
    });

    // Test 3: Search Button in Header -> open
    console.log("\n[Test 3] Checking Search Button in Header...");
    const searchSounds = await clickSelector("header button[data-sound='open']", "Search button");
    const searchSound = searchSounds[0]?.sound;
    resultsTable.push({
      control: "Header Search button",
      expected: "open",
      observed: searchSound || "None",
      status: searchSound === "open" ? "PASS" : "FAIL"
    });

    // Test 4: Command Menu Close via ESC -> close
    console.log("\n[Test 4] Checking Command Menu Close via ESC...");
    const escSounds = await dispatchKey("Escape", "Escape");
    const escSound = escSounds[0]?.sound;
    resultsTable.push({
      control: "Command Menu close (Esc)",
      expected: "close",
      observed: escSound || "None",
      status: escSound === "close" ? "PASS" : "FAIL"
    });

    // Test 5: Keyboard Shortcut (Ctrl+K or "/") -> open
    console.log("\n[Test 5] Checking Shortcut '/' to open Command Palette...");
    const slashSounds = await dispatchKey("/", "Slash");
    const slashSound = slashSounds[0]?.sound;
    resultsTable.push({
      control: "Shortcut '/' (open palette)",
      expected: "open",
      observed: slashSound || "None",
      status: slashSound === "open" ? "PASS" : "FAIL"
    });

    // Test 6: Command Menu Option Selection -> command
    console.log("\n[Test 6] Checking Command Menu row selection...");
    const cmdOptionSounds = await clickSelector(".command-overlay .command-option", "Command row");
    const cmdOptionSound = cmdOptionSounds[0]?.sound;
    resultsTable.push({
      control: "Command Menu item click",
      expected: "command",
      observed: cmdOptionSound || "None",
      status: cmdOptionSound === "command" ? "PASS" : "FAIL"
    });

    // Test 7: Collapsible - Projects Row (close -> open)
    console.log("\n[Test 7] Checking Projects Collapsible row...");
    // Row 1 (sar) is initially expanded -> clicking closes it
    const projCloseSounds = await clickSelector("#projects [data-slot='collapsible-trigger']", "Project row 1 toggle");
    const projCloseSound = projCloseSounds[0]?.sound;
    resultsTable.push({
      control: "Project row collapsible (close)",
      expected: "close",
      observed: projCloseSound || "None",
      status: projCloseSound === "close" ? "PASS" : "FAIL"
    });

    // Clicking it again opens it
    const projOpenSounds = await clickSelector("#projects [data-slot='collapsible-trigger']", "Project row 1 toggle reopen");
    const projOpenSound = projOpenSounds[0]?.sound;
    resultsTable.push({
      control: "Project row collapsible (re-open)",
      expected: "open",
      observed: projOpenSound || "None",
      status: projOpenSound === "open" ? "PASS" : "FAIL"
    });

    // Test 8: Collapsible - Experience Position
    console.log("\n[Test 8] Checking Experience Position Collapsible...");
    // Position is initially expanded -> clicking closes it
    const expCloseSounds = await clickSelector("#experience [data-slot='collapsible-trigger']", "Experience position toggle");
    const expCloseSound = expCloseSounds[0]?.sound;
    resultsTable.push({
      control: "Experience position collapsible (close)",
      expected: "close",
      observed: expCloseSound || "None",
      status: expCloseSound === "close" ? "PASS" : "FAIL"
    });

    const expOpenSounds = await clickSelector("#experience [data-slot='collapsible-trigger']", "Experience position re-open");
    const expOpenSound = expOpenSounds[0]?.sound;
    resultsTable.push({
      control: "Experience position collapsible (re-open)",
      expected: "open",
      observed: expOpenSound || "None",
      status: expOpenSound === "open" ? "PASS" : "FAIL"
    });

    // Test 9: Collapsible - Achievements "Show all achievements"
    console.log("\n[Test 9] Checking Achievements Show All...");
    const achSounds = await clickSelector("#achievements [data-slot='collapsible-trigger']", "Achievements show all");
    const achSound = achSounds[0]?.sound;
    resultsTable.push({
      control: "Achievements 'Show all' collapsible",
      expected: "open",
      observed: achSound || "None",
      status: achSound === "open" ? "PASS" : "FAIL"
    });

    // Test 10: Copy Button in Contact
    console.log("\n[Test 10] Checking Copy Button...");
    const copySounds = await clickSelector("#contact button[data-sound='copy']", "Contact copy button");
    const copySound = copySounds[0]?.sound;
    resultsTable.push({
      control: "Copy button (Contact email)",
      expected: "copy",
      observed: copySound || "None",
      status: copySound === "copy" ? "PASS" : "FAIL"
    });

    // Test 11: Project Filter Pills
    console.log("\n[Test 11] Checking Project Filter Pills...");
    const filterSounds = await clickSelector("#projects button[role='radio']:nth-child(2)", "Backend filter pill");
    const filterSound = filterSounds[0]?.sound;
    resultsTable.push({
      control: "Project category filter pill",
      expected: "select",
      observed: filterSound || "None",
      status: filterSound === "select" ? "PASS" : "FAIL"
    });

    // Test 12: Hero Crosshair Pins (with detune)
    console.log("\n[Test 12] Checking Hero Crosshair Clicks...");
    cdp.clearSounds();
    await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const hero = document.getElementById('top');
          if (hero) {
            hero.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 300, clientY: 200 }));
            hero.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 350, clientY: 220 }));
            hero.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 400, clientY: 240 }));
            return true;
          }
          return false;
        })()
      `
    });
    await wait(300);
    const pinSounds = cdp.clearSounds();
    const pin1 = pinSounds[0];
    const pin2 = pinSounds[1];
    const pin3 = pinSounds[2];
    resultsTable.push({
      control: "Hero pin 1 (click)",
      expected: "select (detune: 0)",
      observed: pin1 ? `${pin1.sound} (detune: ${pin1.cue?.detune})` : "None",
      status: pin1?.sound === "select" && pin1.cue?.detune === 0 ? "PASS" : "FAIL"
    });
    resultsTable.push({
      control: "Hero pin 2 (click)",
      expected: "select (detune: 90)",
      observed: pin2 ? `${pin2.sound} (detune: ${pin2.cue?.detune})` : "None",
      status: pin2?.sound === "select" && pin2.cue?.detune === 90 ? "PASS" : "FAIL"
    });
    resultsTable.push({
      control: "Hero pin 3 (click)",
      expected: "select (detune: 180)",
      observed: pin3 ? `${pin3.sound} (detune: ${pin3.cue?.detune})` : "None",
      status: pin3?.sound === "select" && pin3.cue?.detune === 180 ? "PASS" : "FAIL"
    });

    // Test 13: Resume View Button
    console.log("\n[Test 13] Checking Resume View Button...");
    const resumeSounds = await clickSelector("#resume a[data-sound='select'], #resume button[data-sound='select']", "Resume view button");
    const resumeSound = resumeSounds[0]?.sound;
    resultsTable.push({
      control: "Resume View button",
      expected: "select",
      observed: resumeSound || "None",
      status: resumeSound === "select" || resumeSound === "blocked" ? "PASS" : "FAIL"
    });

    // Test 14: Gamepad Button -> open
    console.log("\n[Test 14] Checking Game Opening via Header Gamepad...");
    const gameOpenSounds = await clickSelector("header button[data-game-slot]", "Gamepad button");
    const gameOpenSound = gameOpenSounds[0]?.sound;
    resultsTable.push({
      control: "Header Gamepad button (open game)",
      expected: "open",
      observed: gameOpenSound || "None",
      status: gameOpenSound === "open" ? "PASS" : "FAIL"
    });

    // Test 15: Game HUD Palette cycle -> select
    console.log("\n[Test 15] Checking Game HUD Palette cycle...");
    await wait(600); // wait for game overlay mount
    const hudPaletteSounds = await clickSelector("button[aria-label*='Palette']", "Game HUD palette button");
    const hudPaletteSound = hudPaletteSounds[0]?.sound;
    resultsTable.push({
      control: "Game HUD Palette button",
      expected: "select",
      observed: hudPaletteSound || "None",
      status: hudPaletteSound === "select" ? "PASS" : "FAIL"
    });

    // Test 16: Game HUD Close -> close
    console.log("\n[Test 16] Checking Game Close button...");
    const gameCloseSounds = await clickSelector("button[aria-label='Close game']", "Game close button");
    const gameCloseSound = gameCloseSounds[0]?.sound;
    resultsTable.push({
      control: "Game HUD Close button",
      expected: "close",
      observed: gameCloseSound || "None",
      status: gameCloseSound === "close" ? "PASS" : "FAIL"
    });

    // Test 17: Non-mapped elements (Nav links, Social links, Logo) -> SILENT
    console.log("\n[Test 17] Checking non-mapped elements produce NO sound...");
    const navSounds = await clickSelector("header nav a", "Header nav link");
    resultsTable.push({
      control: "Header nav links (e.g. Experience)",
      expected: "Silence (0 sounds)",
      observed: navSounds.length === 0 ? "Silence (0 sounds)" : navSounds.map(s => s.sound).join(", "),
      status: navSounds.length === 0 ? "PASS" : "FAIL"
    });

    const socialSounds = await clickSelector("#socials a", "Social link");
    resultsTable.push({
      control: "Social links (e.g. GitHub/LinkedIn)",
      expected: "Silence (0 sounds)",
      observed: socialSounds.length === 0 ? "Silence (0 sounds)" : socialSounds.map(s => s.sound).join(", "),
      status: socialSounds.length === 0 ? "PASS" : "FAIL"
    });

    const logoSounds = await clickSelector("header a[aria-label*='back to top']", "Logo monogram");
    resultsTable.push({
      control: "Header Logo monogram",
      expected: "Silence (0 sounds)",
      observed: logoSounds.length === 0 ? "Silence (0 sounds)" : logoSounds.map(s => s.sound).join(", "),
      status: logoSounds.length === 0 ? "PASS" : "FAIL"
    });

    // Test 18: Global Mute Persistence & Unmute swoosh
    console.log("\n[Test 18] Checking Global Mute & Unmute...");
    // Click hero sound toggle to mute
    await clickSelector("#top button[data-sound='swoosh']", "Hero sound toggle to mute");
    const isMutedNow = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      expression: "localStorage.getItem('cp-sound-muted')"
    });
    resultsTable.push({
      control: "Global mute in localStorage",
      expected: "'1'",
      observed: `'${isMutedNow.result.value}'`,
      status: isMutedNow.result.value === "1" ? "PASS" : "FAIL"
    });

    // Unmute -> verify 'swoosh'
    const unmuteSounds = await clickSelector("#top button[data-sound='swoosh']", "Hero sound toggle to unmute");
    const unmuteSound = unmuteSounds.find(s => s.sound === "swoosh")?.sound;
    resultsTable.push({
      control: "Unmuting via SoundToggle",
      expected: "swoosh",
      observed: unmuteSound || "None",
      status: unmuteSound === "swoosh" ? "PASS" : "FAIL"
    });

    console.log("\n=== SUMMARY OF SOUND VERIFICATION RESULTS ===");
    console.table(resultsTable);

    cdp.close();
  } finally {
    try { chrome.kill(); } catch {}
    try { server.kill(); } catch {}
  }
}

main().catch(console.error);
