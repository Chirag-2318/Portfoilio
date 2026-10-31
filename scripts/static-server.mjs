import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

const PORT = 4173;
const OUT_DIR = path.join(process.cwd(), "out");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
  ".xml": "application/xml; charset=utf-8",
};

const COMPRESSIBLE = new Set([
  "text/html; charset=utf-8",
  "text/css; charset=utf-8",
  "text/javascript; charset=utf-8",
  "application/json; charset=utf-8",
  "image/svg+xml",
  "text/plain; charset=utf-8",
  "application/xml; charset=utf-8",
]);

const server = http.createServer(async (req, res) => {
  try {
    const rawUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    let pathname = decodeURIComponent(rawUrl.pathname);

    // Normalize
    let filePath = path.join(OUT_DIR, pathname);

    // Check stat
    let stats;
    try {
      stats = await fs.stat(filePath);
    } catch {
      // Try with .html or /index.html
      try {
        const withHtml = filePath + ".html";
        stats = await fs.stat(withHtml);
        filePath = withHtml;
      } catch {
        try {
          const withIndex = path.join(filePath, "index.html");
          stats = await fs.stat(withIndex);
          filePath = withIndex;
        } catch {
          // Fallback to 404
          const notFoundPath = path.join(OUT_DIR, "404.html");
          const data = await fs.readFile(notFoundPath);
          res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
          res.end(data);
          return;
        }
      }
    }

    if (stats.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    let data = await fs.readFile(filePath);
    const acceptEncoding = req.headers["accept-encoding"] || "";

    if (COMPRESSIBLE.has(contentType) && acceptEncoding.includes("gzip")) {
      const gzipped = zlib.gzipSync(data);
      res.writeHead(200, {
        "Content-Type": contentType,
        "Content-Encoding": "gzip",
        "Content-Length": gzipped.byteLength,
        "Cache-Control": "no-cache",
        "Vary": "Accept-Encoding",
      });
      res.end(gzipped);
      return;
    }

    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": data.byteLength,
      "Cache-Control": "no-cache",
    });
    res.end(data);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error: " + err.message);
  }
});

server.listen(PORT, () => {
  console.log(`Static server running at http://127.0.0.1:${PORT} serving ${OUT_DIR}`);
});
