# Sania's Story Weaver

A children's story app. The child picks words from four categories, and an
original story gets woven around every one of them — then read page by page
with an illustration on each.

## Getting it running

```bash
cp .env.example .env     # then paste in your Anthropic API key
npm install
npm run dev              # server on :8787, client on :5173
```

Open http://localhost:5173. In dev, Vite proxies `/api` to the server, so the
browser only ever talks to one origin.

For production, one process serves both:

```bash
npm run build            # builds client/dist
npm start                # Express serves the API and the built client on :8787
```

## How it fits together

```
client/  Vite + React. No state library — the whole app is a handful of
         useState calls in App.jsx. Talks to exactly one endpoint.
server/  Express. Holds the API key, builds the prompt, calls the model,
         validates what comes back. Serves client/dist in production.
```

The API key never reaches the browser. Everything the client sends is
re-validated server-side in `server/src/lib/validate.js`, because the word
bank lives in client code and so cannot be trusted.

### The one endpoint

`POST /api/story` → `{ words, age, prompt }` → `{ title, pages[], age, words, usage }`

Each page is `{ text, scene }`. `scene` is a short literal description of what
is visible, and it is what drives the illustration.

Also: `GET /api/health` and `GET /api/age-bands`.

### Age-based length scaling

`server/src/lib/ageProfiles.js` is the single table that controls story length,
page count, token budget and voice guidance per age band. Change the band
there and all four move together. Adding a band means adding it both there and
to `AGE_BANDS` in `client/src/data/wordBank.js`.

### Illustrations

Nothing is image-generated. `client/src/data/illustrations.jsx` is a
hand-written SVG library in three tables — backdrops (400×300), subjects
(120×120) and props (60×60). For each page, `client/src/lib/sceneMatcher.js`
keyword-matches the `scene` string against those tables and layers one
backdrop plus up to two subjects and two props into a single SVG. That makes
illustration free, instant and offline, at the cost of a fixed vocabulary.

The weighting there is load-bearing: the page's own `scene` line decides what
gets drawn, and the child's chosen words only break ties. A subject or prop
has to earn a match against the scene line to appear at all — otherwise a
dragon the child picked swims past on the underwater page, and every page of
the book ends up as the same picture.

To extend the art: add an entry with `keywords` and `art` to the right table,
then point a word at it with `art: '<id>'` in `wordBank.js`. Words with no
`art` key work fine — they just do not contribute a layer.

## Conventions

- ES modules throughout, Node 20+.
- No TypeScript yet. If it goes in, start with the API boundary.
- Styling is plain CSS with custom properties in `client/src/styles.css`;
  dark mode comes from `prefers-color-scheme`.
- The server owns all model-facing prompt text (`server/src/lib/storyPrompt.js`).
  Keep prompt wording out of the client.

## Known gaps

- No persistence — stories vanish on refresh. Saving a story is the obvious
  next feature.
- No streaming; the reader waits for the whole story. Streaming the first page
  would cut perceived latency a lot.
- Rate limiting is in-memory and per-process (`server/src/lib/rateLimit.js`).
  Fine for one instance, needs Redis beyond that.
- No tests yet. `sceneMatcher.js` is the piece most worth covering first.
