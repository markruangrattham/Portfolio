// POST /api/chat — Vercel serverless function that streams an LLM reply.
//
// Works with any OpenAI-compatible "chat completions" endpoint, which covers all
// the free options. Pick a provider by setting three env vars on Vercel:
//
//   Provider              LLM_BASE_URL                                             LLM_MODEL (example)
//   Groq (default, free)  https://api.groq.com/openai/v1                           llama-3.3-70b-versatile
//   Google Gemini (free)  https://generativelanguage.googleapis.com/v1beta/openai  gemini-2.5-flash
//   OpenRouter (free)     https://openrouter.ai/api/v1                             any model id ending in ":free"
//   Cloudflare Workers AI https://api.cloudflare.com/client/v4/accounts/<id>/ai/v1  @cf/meta/llama-3.3-70b-instruct-fp8-fast
//   Anthropic (paid)      https://api.anthropic.com/v1                             claude-sonnet-5
//
//   LLM_API_KEY  — the provider's API key (required)
//
// Request body:  { "messages": [{ "role": "user" | "assistant", "content": "..." }, ...] }
// Response:      text/plain stream of the assistant's reply (chunks as they arrive)
// Errors:        JSON { "error": "..." } with a 4xx / 5xx status
//
// Optional: CHAT_ALLOWED_ORIGINS — comma-separated extra origins allowed to call this route.

import { SYSTEM_PROMPT } from "./_context.js";

const BASE_URL = (process.env.LLM_BASE_URL || "https://api.groq.com/openai/v1").replace(/\/+$/, "");
const MODEL = process.env.LLM_MODEL || "llama-3.3-70b-versatile";
const API_KEY = process.env.LLM_API_KEY || "";

const MAX_OUTPUT_TOKENS = 600;       // short chat replies; the system prompt asks for 2–4 sentences
const MAX_MESSAGES = 30;             // turns kept from the client history
const MAX_MESSAGE_CHARS = 2000;      // per message
const MAX_TOTAL_CHARS = 12000;       // whole conversation
const UPSTREAM_TIMEOUT_MS = 45_000;

// Best-effort per-IP rate limit. Serverless instances don't share memory, so this
// is a speed bump, not a wall. Tighten with Vercel's firewall if it ever matters.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 25;
const hits = new Map();

const DEFAULT_ORIGINS = [
  "https://markruangrattham.github.io",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

export default async function handler(req, res) {
  applyCors(res, req.headers.origin || "");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }
  if (!API_KEY) {
    return sendJson(res, 500, { error: "Chat is not configured yet (missing LLM_API_KEY)." });
  }
  if (isRateLimited(clientIp(req))) {
    return sendJson(res, 429, { error: "Whoa, that's a lot of questions. Give it a few minutes and try again." });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return sendJson(res, 400, { error: "Invalid JSON body" });
  }

  const history = sanitizeMessages(body?.messages);
  if (!history) {
    return sendJson(res, 400, { error: "Send { messages: [{ role, content }] } with at least one user message." });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  let upstream;
  try {
    upstream = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: 0.6,
        messages: [
          { role: "system", content: `${SYSTEM_PROMPT}\n\nToday's date is ${new Date().toISOString().slice(0, 10)}.` },
          ...history,
        ],
      }),
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timer);
    console.error("upstream fetch failed:", error);
    return sendJson(res, 502, { error: "The assistant couldn't reach its brain. Please try again." });
  }

  if (!upstream.ok) {
    clearTimeout(timer);
    const detail = await upstream.text().catch(() => "");
    console.error(`upstream ${upstream.status}:`, detail.slice(0, 500));
    return sendJson(res, statusFor(upstream.status), { error: messageFor(upstream.status) });
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Content-Type-Options", "nosniff");

  let wroteAnything = false;
  try {
    for await (const text of readSseText(upstream.body)) {
      wroteAnything = true;
      res.write(text);
    }
  } catch (error) {
    console.error("stream error:", error);
    if (!wroteAnything) res.write("The assistant hit a hiccup mid-reply. Please try again.");
  } finally {
    clearTimeout(timer);
  }
  if (!wroteAnything) res.write("Hmm, I came up empty. Could you rephrase that?");
  res.end();
}

// ─── Streaming: parse OpenAI-style SSE and yield only the text deltas ─────────

async function* readSseText(stream) {
  const decoder = new TextDecoder();
  let buffer = "";
  for await (const chunk of stream) {
    buffer += decoder.decode(chunk, { stream: true });
    let nl;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") return;
      let json;
      try {
        json = JSON.parse(data);
      } catch {
        continue;
      }
      const text = json.choices?.[0]?.delta?.content;
      if (text) yield text;
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function applyCors(res, origin) {
  const allowed = new Set([
    ...DEFAULT_ORIGINS,
    ...(process.env.CHAT_ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean),
  ]);
  if (origin && allowed.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Max-Age", "86400");
  }
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  return (Array.isArray(fwd) ? fwd[0] : fwd || "").split(",")[0].trim() || req.socket?.remoteAddress || "unknown";
}

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // keep memory bounded on long-lived instances
  return recent.length > RATE_LIMIT_MAX;
}

async function readJsonBody(req) {
  if (req.body !== undefined) {
    return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

// Returns a clean, alternating user/assistant history ending with a user turn, or null.
function sanitizeMessages(input) {
  if (!Array.isArray(input)) return null;
  const cleaned = [];
  let total = 0;
  for (const m of input.slice(-MAX_MESSAGES)) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") continue;
    const content = m.content.trim().slice(0, MAX_MESSAGE_CHARS);
    if (!content) continue;
    const last = cleaned[cleaned.length - 1];
    if (last && last.role === m.role) {
      last.content += "\n\n" + content; // merge same-role turns
    } else {
      cleaned.push({ role: m.role, content });
    }
    total += content.length;
  }
  while (cleaned.length && cleaned[0].role !== "user") cleaned.shift();
  while (total > MAX_TOTAL_CHARS && cleaned.length > 1) {
    total -= cleaned.shift().content.length;
    while (cleaned.length && cleaned[0].role !== "user") total -= cleaned.shift().content.length;
  }
  if (!cleaned.length || cleaned[cleaned.length - 1].role !== "user") return null;
  return cleaned;
}

function statusFor(upstreamStatus) {
  if (upstreamStatus === 401 || upstreamStatus === 403) return 500;
  if (upstreamStatus === 429) return 429;
  if (upstreamStatus === 400 || upstreamStatus === 404) return 500;
  return 502;
}

function messageFor(upstreamStatus) {
  if (upstreamStatus === 401 || upstreamStatus === 403) return "Chat is misconfigured on the server (bad API key).";
  if (upstreamStatus === 429) return "The assistant is a little overloaded right now (free-tier limit). Try again in a minute.";
  if (upstreamStatus === 400 || upstreamStatus === 404) return "Chat is misconfigured on the server (unknown model or endpoint).";
  return "The assistant hit a hiccup. Please try again.";
}
