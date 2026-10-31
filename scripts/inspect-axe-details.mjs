import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PORT = 9226;
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const AXE_SRC = fs.readFileSync("node_modules/axe-core/axe.min.js", "utf8");

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const chrome = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${PORT}`,
      "--headless=new",
      "--disable-gpu",
      "http://localhost:4173/",
    ],
    { stdio: "ignore" }
  );

  await wait(1200);

  const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
  const pages = await res.json();
  const wsUrl = pages[0].webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);
  await new Promise((r) => (ws.onopen = r));

  let id = 1;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      const handler = (e) => {
        const d = JSON.parse(e.data);
        if (d.id === msgId) {
          ws.removeEventListener("message", handler);
          resolve(d.result);
        }
      };
      ws.addEventListener("message", handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await send("Page.enable");
  await send("Runtime.enable");

  const routes = ["/", "/work/", "/resume/", "/contact/"];
  for (const route of routes) {
    console.log(`\n=================== Inspecting Route: ${route} ===================`);
    await send("Page.navigate", { url: `http://localhost:4173${route}` });
    await wait(600);

    await send("Runtime.evaluate", { expression: AXE_SRC });
    const axeRes = await send("Runtime.evaluate", {
      expression: `new Promise(r => axe.run({ runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] }, (e, res) => r(res)))`,
      returnByValue: true,
      awaitPromise: true,
    });

    const violations = axeRes.result?.value?.violations || [];
    for (const v of violations) {
      console.log(`\nVIOLATION: ${v.id} (${v.impact}) - ${v.help}`);
      for (const node of v.nodes) {
        console.log(`  Target:`, node.target);
        console.log(`  HTML:`, node.html);
        console.log(`  Failure Summary:`, node.failureSummary);
      }
    }
  }

  chrome.kill();
  ws.close();
}

main().catch(console.error);

