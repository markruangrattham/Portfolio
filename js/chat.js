// ─── "AI Mark" Chat Widget ───────────────────────────────────────────────────
// Floating photo launcher + chat panel. Talks to /api/chat (see api/chat.js).
// The bot answers in first person as Mark; its knowledge lives in api/_context.js.
//
// The static site lives on GitHub Pages; the API lives on Vercel (project
// "portfolio-chat"). On localhost the widget talks to the local dev server
// instead, so `npm run dev:mock` keeps working without a key.

(function () {
  const PRODUCTION_ENDPOINT = "https://portfolio-chat-sooty.vercel.app/api/chat";
  const isLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  const CHAT_ENDPOINT = isLocal ? "/api/chat" : PRODUCTION_ENDPOINT;

  const AVATAR_SRC = "img/profilepic.jpg";
  const EMAIL = "markruangrattham@gmail.com";
  const LINKEDIN = "https://www.linkedin.com/in/mark-ruangrattham/";

  const STORAGE_KEY = "pf_chat_history_v2";
  const CTA_KEY = "pf_chat_cta_dismissed";
  const MAX_HISTORY = 30;
  const CTA_AFTER_REPLIES = 2; // show the "talk to the real me" card after this many answers

  const SUGGESTIONS = [
    "What are you working on at AWS?",
    "Tell me about the chatbot you built at Transact",
    "What's the most complex system you've shipped?",
    "Are you open to new roles?",
  ];

  const GREETING =
    "Hey, I'm Mark — well, the AI version. Ask me anything about my experience, projects, or what I'm building right now.";

  let history = loadHistory(); // [{ role, content }]
  let busy = false;
  let els = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    if (document.getElementById("pfChat")) return;
    mount();
    renderHistory();
  }

  // ─── DOM ────────────────────────────────────────────────────────────────────

  function mount() {
    const root = document.createElement("div");
    root.id = "pfChat";
    root.className = "pf-chat";
    root.innerHTML = `
      <button class="pf-chat-launcher" type="button" aria-label="Chat with Mark's AI" aria-expanded="false">
        <span class="pf-chat-launcher-avatar">
          <img src="${AVATAR_SRC}" alt="" width="52" height="52">
          <span class="pf-chat-online" aria-hidden="true"></span>
        </span>
        <span class="pf-chat-launcher-label">Chat with me</span>
        <span class="pf-chat-launcher-close" aria-hidden="true">✕</span>
      </button>

      <section class="pf-chat-panel" role="dialog" aria-label="Chat with Mark's AI" aria-hidden="true">
        <header class="pf-chat-header">
          <span class="pf-chat-avatar">
            <img src="${AVATAR_SRC}" alt="" width="40" height="40">
            <span class="pf-chat-online" aria-hidden="true"></span>
          </span>
          <div class="pf-chat-title">
            <strong>Mark Ruangrattham</strong>
            <span>Ask me about my experience · AI</span>
          </div>
          <button class="pf-chat-reset" type="button" title="Start over" aria-label="Clear conversation">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
          </button>
          <button class="pf-chat-close" type="button" aria-label="Close chat">✕</button>
        </header>

        <div class="pf-chat-messages" aria-live="polite"></div>

        <form class="pf-chat-form">
          <textarea class="pf-chat-input" rows="1" maxlength="2000" placeholder="Ask me anything…" aria-label="Your message"></textarea>
          <button class="pf-chat-send" type="submit" aria-label="Send message">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
        <p class="pf-chat-footnote">This is an AI trained on my resume and site. It can slip up — email the real me for anything important.</p>
      </section>
    `;
    document.body.appendChild(root);

    els = {
      root,
      launcher: root.querySelector(".pf-chat-launcher"),
      panel: root.querySelector(".pf-chat-panel"),
      messages: root.querySelector(".pf-chat-messages"),
      form: root.querySelector(".pf-chat-form"),
      input: root.querySelector(".pf-chat-input"),
      send: root.querySelector(".pf-chat-send"),
      close: root.querySelector(".pf-chat-close"),
      reset: root.querySelector(".pf-chat-reset"),
    };

    els.launcher.addEventListener("click", () => toggle());
    els.close.addEventListener("click", () => toggle(false));
    els.reset.addEventListener("click", resetConversation);
    els.form.addEventListener("submit", (e) => {
      e.preventDefault();
      submit(els.input.value);
    });
    els.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit(els.input.value);
      }
    });
    els.input.addEventListener("input", autosize);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && root.classList.contains("open")) toggle(false);
    });
  }

  function toggle(force) {
    const open = typeof force === "boolean" ? force : !els.root.classList.contains("open");
    els.root.classList.toggle("open", open);
    els.panel.setAttribute("aria-hidden", String(!open));
    els.launcher.setAttribute("aria-expanded", String(open));
    if (open) setTimeout(() => els.input.focus(), 150);
  }

  function autosize() {
    els.input.style.height = "auto";
    els.input.style.height = Math.min(els.input.scrollHeight, 120) + "px";
  }

  // ─── Rendering ──────────────────────────────────────────────────────────────

  function renderHistory() {
    els.messages.innerHTML = "";
    addBubble("assistant", GREETING);
    if (history.length === 0) {
      renderSuggestions();
    } else {
      history.forEach((m) => addBubble(m.role, m.content));
      maybeShowContactCard();
    }
    scrollToBottom();
  }

  function renderSuggestions() {
    const wrap = document.createElement("div");
    wrap.className = "pf-chat-suggestions";
    SUGGESTIONS.forEach((text) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "pf-chat-chip";
      chip.textContent = text;
      chip.addEventListener("click", () => submit(text));
      wrap.appendChild(chip);
    });
    els.messages.appendChild(wrap);
  }

  function addBubble(role, text, opts = {}) {
    const row = document.createElement("div");
    row.className = `pf-chat-row pf-chat-row-${role}`;
    const bubble = document.createElement("div");
    bubble.className = "pf-chat-bubble";
    if (opts.error) bubble.classList.add("pf-chat-bubble-error");
    bubble.innerHTML = role === "assistant" ? renderMarkdown(text) : escapeHtml(text);
    row.appendChild(bubble);
    els.messages.appendChild(row);
    scrollToBottom();
    return bubble;
  }

  function addTyping() {
    const row = document.createElement("div");
    row.className = "pf-chat-row pf-chat-row-assistant";
    row.innerHTML = `<div class="pf-chat-bubble pf-chat-typing"><span></span><span></span><span></span></div>`;
    els.messages.appendChild(row);
    scrollToBottom();
    return row;
  }

  // "Want to talk to the real me?" card, shown once after a couple of answers.
  function maybeShowContactCard() {
    const replies = history.filter((m) => m.role === "assistant").length;
    if (replies < CTA_AFTER_REPLIES) return;
    if (els.messages.querySelector(".pf-chat-cta")) return;
    try {
      if (sessionStorage.getItem(CTA_KEY) === "1") return;
    } catch {
      /* ignore */
    }

    const card = document.createElement("div");
    card.className = "pf-chat-cta";
    card.innerHTML = `
      <button class="pf-chat-cta-dismiss" type="button" aria-label="Dismiss">✕</button>
      <strong>Want to talk to the real me?</strong>
      <p>I read every email. Recruiters, collaborators, or anyone who just wants to say hi.</p>
      <div class="pf-chat-cta-actions">
        <a class="pf-chat-cta-btn pf-chat-cta-primary" href="mailto:${EMAIL}">Email Mark</a>
        <a class="pf-chat-cta-btn" href="${LINKEDIN}" target="_blank" rel="noopener">LinkedIn</a>
      </div>
    `;
    card.querySelector(".pf-chat-cta-dismiss").addEventListener("click", () => {
      card.remove();
      try {
        sessionStorage.setItem(CTA_KEY, "1");
      } catch {
        /* ignore */
      }
    });
    els.messages.appendChild(card);
    scrollToBottom();
  }

  function scrollToBottom() {
    els.messages.scrollTop = els.messages.scrollHeight;
  }

  // ─── Sending ────────────────────────────────────────────────────────────────

  async function submit(raw) {
    const text = (raw || "").trim();
    if (!text || busy) return;

    const suggestions = els.messages.querySelector(".pf-chat-suggestions");
    if (suggestions) suggestions.remove();
    const cta = els.messages.querySelector(".pf-chat-cta");
    if (cta) cta.remove(); // keep the card at the bottom; it comes back after the reply

    els.input.value = "";
    autosize();
    setBusy(true);

    history.push({ role: "user", content: text });
    trimHistory();
    addBubble("user", text);

    const typingRow = addTyping();
    let bubble = null;
    let reply = "";

    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) {
        let msg = "Something went wrong. Please try again.";
        try {
          msg = (await res.json()).error || msg;
        } catch {
          /* non-JSON error body */
        }
        throw new Error(msg);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        if (!bubble) {
          typingRow.remove();
          bubble = addBubble("assistant", "");
        }
        bubble.innerHTML = renderMarkdown(reply);
        scrollToBottom();
      }
      reply += decoder.decode();

      if (!reply.trim()) throw new Error("I came up empty on that one. Try asking another way?");
      if (bubble) bubble.innerHTML = renderMarkdown(reply);
      history.push({ role: "assistant", content: reply });
      saveHistory();
      maybeShowContactCard();
    } catch (err) {
      typingRow.remove();
      if (bubble) bubble.remove();
      history.pop(); // drop the failed user turn so a retry resends cleanly
      addBubble("assistant", err.message || "Something went wrong. Please try again.", { error: true });
    } finally {
      setBusy(false);
    }
  }

  function setBusy(state) {
    busy = state;
    els.send.disabled = state;
    els.input.disabled = state;
    if (!state) els.input.focus();
  }

  function resetConversation() {
    history = [];
    saveHistory();
    renderHistory();
    els.input.focus();
  }

  // ─── Persistence ────────────────────────────────────────────────────────────

  function loadHistory() {
    try {
      const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed.filter((m) => m && typeof m.content === "string") : [];
    } catch {
      return [];
    }
  }

  function saveHistory() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      /* storage unavailable — chat still works for this page view */
    }
  }

  function trimHistory() {
    if (history.length > MAX_HISTORY) history = history.slice(-MAX_HISTORY);
  }

  // ─── Tiny markdown (bold, italics, inline code, links, bullets, paragraphs) ─

  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Only allow http(s), mailto, in-page anchors, and same-site .html pages.
  function safeHref(url) {
    if (/^https?:\/\//i.test(url) || /^mailto:/i.test(url) || /^#[\w-]+$/.test(url)) return url;
    if (/^[\w-]+\.html(#[\w-]+)?$/.test(url)) return url;
    return null;
  }

  function linkTag(href, label) {
    const external = /^https?:\/\//i.test(href);
    return `<a href="${href}"${external ? ' target="_blank" rel="noopener"' : ""}>${label}</a>`;
  }

  function inline(s) {
    return escapeHtml(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
      .replace(/\[([^\]]+)\]\(([^\s)]+)\)/g, (m, label, url) => {
        const href = safeHref(url);
        return href ? linkTag(href, label) : label;
      })
      .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, (m, pre, url) => pre + linkTag(url, url))
      .replace(/(^|[\s(])([\w.+-]+@[\w-]+\.[\w.]+)(?![^<]*<\/a>)/g, (m, pre, email) => pre + linkTag("mailto:" + email, email));
  }

  function renderMarkdown(text) {
    const blocks = text.trim().split(/\n{2,}/);
    return blocks
      .map((block) => {
        const lines = block.split("\n");
        const isList = lines.every((l) => /^\s*([-*•]|\d+[.)])\s+/.test(l));
        if (isList) {
          const ordered = /^\s*\d+[.)]/.test(lines[0]);
          const items = lines.map((l) => `<li>${inline(l.replace(/^\s*([-*•]|\d+[.)])\s+/, ""))}</li>`).join("");
          return ordered ? `<ol>${items}</ol>` : `<ul>${items}</ul>`;
        }
        return `<p>${lines.map(inline).join("<br>")}</p>`;
      })
      .join("");
  }
})();
