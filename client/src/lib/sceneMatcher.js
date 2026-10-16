import { BACKDROPS, SUBJECTS, PROPS, DEFAULT_BACKDROP } from '../data/illustrations.jsx';

/**
 * Turns a page's `scene` string (plus the words the child picked) into a
 * layered picture spec.
 *
 * Matching is deliberately simple keyword scoring rather than anything
 * clever: the art vocabulary is small and fixed, so the job is to pick the
 * least-wrong backdrop and a couple of sensible subjects, fast, in the
 * browser.
 *
 * Two pools, weighted very differently, and the gap matters:
 *   - the page's own scene line is what this page is about  → SCENE_WEIGHT
 *   - the child's picks are background context               → CONTEXT_WEIGHT
 *
 * Context is a tiebreaker only. Weight it too heavily and every page of a
 * story about a library gets drawn in the library, even the page set on a
 * mountain — the whole book ends up as one picture repeated.
 */

const SCENE_WEIGHT = 4;
const SCENE_PARTIAL_WEIGHT = 2;
const CONTEXT_WEIGHT = 1;

function tokenize(text) {
  return new Set(
    (text || '')
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 2),
  );
}

function matches(keyword, tokens) {
  if (tokens.has(keyword)) return 'exact';
  for (const token of tokens) {
    if (token.startsWith(keyword) || keyword.startsWith(token)) return 'partial';
  }
  return null;
}

function score(entry, id, { sceneTokens, contextTokens, contextArtIds }) {
  let sceneScore = 0;
  let contextScore = 0;

  for (const keyword of entry.keywords) {
    const sceneMatch = matches(keyword, sceneTokens);
    if (sceneMatch === 'exact') sceneScore += SCENE_WEIGHT;
    else if (sceneMatch === 'partial') sceneScore += SCENE_PARTIAL_WEIGHT;

    if (matches(keyword, contextTokens)) contextScore += CONTEXT_WEIGHT;
  }

  // A word the child actually tapped gets one nudge, not one per keyword.
  if (contextArtIds.has(id)) contextScore += CONTEXT_WEIGHT;

  return { sceneScore, total: sceneScore + contextScore };
}

/**
 * `requireScene` is what keeps chosen words from leaking onto pages they do
 * not belong on — a dragon the child picked should not swim past on the
 * underwater page unless that page's scene line actually puts it there.
 * Context still ranks the candidates that do qualify.
 */
function pickBest(table, context, { limit = 1, requireScene = true } = {}) {
  return Object.entries(table)
    .map(([id, entry]) => ({ id, ...score(entry, id, context) }))
    .filter((candidate) =>
      requireScene ? candidate.sceneScore >= SCENE_PARTIAL_WEIGHT : candidate.total >= CONTEXT_WEIGHT,
    )
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
    .map((candidate) => candidate.id);
}

/**
 * Subjects sit on a shallow arc across the lower third so two figures never
 * overlap. Props tuck into the corners.
 */
const SUBJECT_SLOTS = [
  { x: 118, y: 136, scale: 1.0 },
  { x: 248, y: 150, scale: 0.82 },
];

const PROP_SLOTS = [
  { x: 36, y: 206, scale: 1.0 },
  { x: 318, y: 196, scale: 0.86 },
];

export function composeScene({ scene, selectedWords = [], pageIndex = 0 }) {
  const sceneTokens = tokenize(scene);

  const contextTokens = new Set();
  for (const word of selectedWords) {
    for (const token of tokenize(word.label)) contextTokens.add(token);
  }

  const context = {
    sceneTokens,
    contextTokens,
    contextArtIds: new Set(selectedWords.map((word) => word.art).filter(Boolean)),
  };

  // The backdrop is the one layer that must always be present, so it falls
  // back rather than being dropped. Subjects and props may legitimately be
  // absent on a quiet page.
  const [backdropId = DEFAULT_BACKDROP] = pickBest(BACKDROPS, context, { limit: 1 });
  const subjectIds = pickBest(SUBJECTS, context, { limit: 2 });
  const propIds = pickBest(PROPS, context, { limit: 2 });

  return {
    backdropId,
    subjects: subjectIds.map((id, i) => ({ id, ...SUBJECT_SLOTS[i] })),
    props: propIds.map((id, i) => ({
      id,
      ...PROP_SLOTS[i],
      // Nudge props page to page so a repeated prop does not look pasted on.
      x: PROP_SLOTS[i].x + ((pageIndex % 3) - 1) * 10,
    })),
  };
}
