// Local dev server: serves the static site and mounts api/chat.js at /api/chat.
//
//   npm run dev        -> real LLM replies (needs LLM_API_KEY in your shell; see api/chat.js)
//   npm run dev:mock   -> canned streaming reply, no API key needed, good for UI work
//
// Then open http://localhost:3000

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT) || 3000;
const MOCK = process.argv.includes("--mock");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2",
};

// The API only accepts requests from the portfolio's origin; allow localhost while developing.
process.env.CHAT_ALLOWED_ORIGINS = [process.env.CHAT_ALLOWED_ORIGINS, `http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`]
  .filter(Boolean)
  .join(",");

const chatHandler = MOCK ? mockChat : (await import("../api/chat.js")).default;

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === "/api/chat") {
    try {
      await chatHandler(req, res);
    } catch (err) {
      console.error(err);
      if (!res.headersSent) res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Dev server error" }));
    }
    return;
  }

  let filePath = path.join(ROOT, decodeURIComponent(url.pathname));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end();
  }
  if (url.pathname.endsWith("/")) filePath = path.join(filePath, "index.html");

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Not found");
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  });
}).listen(PORT, () => {
  console.log(`Portfolio dev server → http://localhost:${PORT}  (${MOCK ? "MOCK chat" : "live LLM chat"})`);
  if (!MOCK && !process.env.LLM_API_KEY) {
    console.log("  ⚠ LLM_API_KEY is not set; /api/chat will return a 500. Use `npm run dev:mock` for UI work.");
  }
});

// Streams a fake reply word by word so the widget can be tested without an API key.
async function mockChat(req, res) {
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }
  let raw = "";
  for await (const chunk of req) raw += chunk;
  let lastUser = "";
  try {
    const msgs = JSON.parse(raw || "{}").messages || [];
    lastUser = msgs.filter((m) => m.role === "user").pop()?.content || "";
  } catch {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Invalid JSON body" }));
  }
  const reply =
    `(mock) You asked: "${lastUser.slice(0, 80)}". I'm in my first semester of the M.S. at Georgia Tech, ` +
    `fresh off a summer as an SDE intern on AWS DocumentDB.\n\n` +
    `**Certification tool** → Internal full-stack tool adopted org-wide, cut completion time 30%.\n\n` +
    `**Failure analysis CLI** → Cross-references test logs with Amazon's internal AI/MCP tooling to suggest fixes.\n\n` +
    `More in [my Transact post](blog-transact-internship.html), or email me at [markruangrattham@gmail.com](mailto:markruangrattham@gmail.com).`;
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" });
  for (const word of reply.split(/(?<= )/)) {
    res.write(word);
    await new Promise((r) => setTimeout(r, 25));
  }
  res.end();
}
