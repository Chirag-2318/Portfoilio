import http from "node:http";
import fs from "node:fs";
import { spawn } from "node:child_process";

const server = http.createServer((req, res) => {
  const filePath = req.url === "/" ? "out/index.html" : "out" + req.url;
  try {
    const data = fs.readFileSync(filePath);
    res.end(data);
  } catch {
    res.end("not found");
  }
});

server.listen(4199, async () => {
  const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
    "--remote-debugging-port=9233",
    "--headless=new",
    "--disable-gpu",
    "http://127.0.0.1:4199/"
  ]);

  await new Promise(r => setTimeout(r, 2500));

  const res = await fetch("http://127.0.0.1:9233/json/list");
  const pages = await res.json();
  const page = pages.find(p => p.url.includes("4199")) || pages[0];

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  ws.send(JSON.stringify({ id: 2, method: "Runtime.enable" }));
  ws.send(JSON.stringify({ id: 3, method: "Log.enable" }));

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.method === "Runtime.exceptionThrown") {
      console.log("EXCEPTION:", JSON.stringify(msg.params.exceptionDetails, null, 2));
    } else if (msg.method === "Runtime.consoleAPICalled") {
      console.log("CONSOLE:", msg.params.args.map(a => a.value));
    }
  };

  await new Promise(r => setTimeout(r, 2000));
});