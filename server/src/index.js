import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

import express from 'express';
import cors from 'cors';

import { storyRouter } from './routes/story.js';
import { AGE_PROFILES } from './lib/ageProfiles.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = path.resolve(__dirname, '../../client/dist');

const app = express();
const port = Number(process.env.PORT) || 8787;

app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));

// In dev the Vite server proxies /api, so no CORS is needed. CORS_ORIGINS is
// for the case where the client is deployed somewhere else entirely.
if (process.env.CORS_ORIGINS) {
  app.use(cors({ origin: process.env.CORS_ORIGINS.split(',').map((o) => o.trim()) }));
}

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    model: process.env.STORY_MODEL || 'claude-sonnet-5-5',
    keyConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
  });
});

// The client renders its own age picker, but serving the bands keeps the two
// from drifting apart as the profiles get tuned.
app.get('/api/age-bands', (req, res) => {
  res.json(
    Object.entries(AGE_PROFILES).map(([id, profile]) => ({
      id,
      label: profile.label,
      pages: profile.pages,
      targetWords: profile.targetWords,
    })),
  );
});

app.use('/api', storyRouter);

// In production the same process serves the built client, so there is one
// origin and one thing to deploy.
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(port, () => {
  console.log(`Story Weaver server listening on http://localhost:${port}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('ANTHROPIC_API_KEY is not set — /api/story will fail until it is.');
  }
});
