/**
 * A deliberately small in-memory limiter. Story generation is the only
 * expensive route, and a single-process deployment is the assumed shape for
 * now. If this ever runs on more than one instance, swap the Map for Redis —
 * the interface is one function.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

const hits = new Map();

export function rateLimit(req, res, next) {
  const key = req.ip ?? 'unknown';
  const now = Date.now();

  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - timestamps[0])) / 1000);
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({
      error: 'Slow down a moment — too many stories at once.',
      retryAfter,
    });
  }

  timestamps.push(now);
  hits.set(key, timestamps);
  next();
}

// Keep the Map from growing without bound on a long-running process.
const sweep = setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of hits) {
    const live = timestamps.filter((t) => now - t < WINDOW_MS);
    if (live.length === 0) hits.delete(key);
    else hits.set(key, live);
  }
}, WINDOW_MS);

sweep.unref();
