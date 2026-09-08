# Mark Ruangrattham — Portfolio

Static portfolio site (vanilla HTML/CSS/JS) hosted on GitHub Pages at
https://markruangrattham.github.io/Portfolio/, plus a small serverless
function that powers the "Ask my AI" chat widget.

## How the chat works

```
browser (js/chat.js)  ──POST /api/chat──▶  Vercel function (api/chat.js)  ──▶  free LLM provider
        ▲                                        │
        └──────── streamed plain-text reply ─────┘
```

- `js/chat.js` — floating photo launcher + chat panel, streams the reply into
  the page, shows a "talk to the real me" card after two answers.
- `api/chat.js` — holds the API key, validates input, rate-limits, streams from
  any OpenAI-compatible endpoint (Groq by default).
- `api/_context.js` — "AI Mark": the first-person persona rules plus everything
  the bot knows (resume, projects, blog posts). Edit this when the resume or
  site changes.

Inspired by [santifer/cv-santiago](https://github.com/santifer/cv-santiago),
minus the paid parts (voice mode, vector search, tracing dashboard).

The static site stays on GitHub Pages. Only the `api/` function is deployed to
Vercel (`.vercelignore` excludes everything else), and it refuses any request
whose `Origin` isn't `https://markruangrattham.github.io`. Browsers can't forge
that header, so other sites can't piggyback on the key; the per-IP rate limit
covers scripted abuse.

## Setup (all free)

The API is deployed as the Vercel project **portfolio-chat**
(https://portfolio-chat-sooty.vercel.app). The widget already points at it.

1. **Get a free API key.** Groq is the default: create an account at
   https://console.groq.com, then copy a key from the API Keys page.
   No credit card needed on the free tier.

2. **Add the key to Vercel and redeploy.** From the repo root:

   ```bash
   vercel env add LLM_API_KEY production
   vercel --prod
   ```

   Optional env vars: `LLM_BASE_URL` and `LLM_MODEL` to switch providers
   (see the table at the top of `api/chat.js`), and `CHAT_ALLOWED_ORIGINS` for
   extra origins.

3. **Redeploy after changing `api/`.** GitHub Pages serves the static site on
   push; the Vercel function only updates when you run `vercel --prod`.

## Local development

```bash
npm run dev:mock   # UI work, canned streaming reply, no key needed
LLM_API_KEY=gsk_... npm run dev   # real replies
```

Then open http://localhost:3000.
