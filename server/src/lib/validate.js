import { AGE_PROFILES, DEFAULT_AGE } from './ageProfiles.js';

export class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BadRequestError';
    this.status = 400;
  }
}

const MAX_WORDS = 12;
const MAX_WORD_LENGTH = 40;
const MAX_PROMPT_LENGTH = 400;

/**
 * The client sends its own word bank entries, so the server treats the payload
 * as untrusted: shape, count and length are all checked here rather than
 * assumed. Anything that reaches the model has been through this function.
 */
export function parseStoryRequest(body) {
  if (!body || typeof body !== 'object') {
    throw new BadRequestError('Request body must be a JSON object.');
  }

  const { words, age, prompt } = body;

  if (!Array.isArray(words) || words.length === 0) {
    throw new BadRequestError('Pick at least one word before weaving a story.');
  }

  if (words.length > MAX_WORDS) {
    throw new BadRequestError(`That is a lot of words — pick ${MAX_WORDS} or fewer.`);
  }

  const cleanWords = words.map((word, index) => {
    const label = typeof word === 'string' ? word : word?.label;
    const category = typeof word === 'string' ? 'Words' : word?.category;

    if (typeof label !== 'string' || !label.trim()) {
      throw new BadRequestError(`Word ${index + 1} is missing its text.`);
    }
    if (label.length > MAX_WORD_LENGTH) {
      throw new BadRequestError(`"${label.slice(0, 20)}…" is too long to be a word.`);
    }

    return {
      label: label.trim(),
      category: typeof category === 'string' && category.trim() ? category.trim() : 'Words',
    };
  });

  if (age !== undefined && !Object.hasOwn(AGE_PROFILES, age)) {
    throw new BadRequestError(`Unknown age band "${age}".`);
  }

  if (prompt !== undefined && typeof prompt !== 'string') {
    throw new BadRequestError('The extra idea must be text.');
  }
  if (typeof prompt === 'string' && prompt.length > MAX_PROMPT_LENGTH) {
    throw new BadRequestError('That extra idea is a bit long — keep it under a couple of sentences.');
  }

  return {
    words: cleanWords,
    age: age ?? DEFAULT_AGE,
    prompt: prompt ?? '',
  };
}

/**
 * The model is asked for bare JSON, but a stray code fence or a line of
 * preamble should degrade to a readable story rather than a 500. Pull the
 * outermost JSON object out of whatever came back, then check its shape.
 */
export function parseStoryResponse(rawText) {
  const text = rawText.trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');

  if (start === -1 || end <= start) {
    throw new Error('Model response contained no JSON object.');
  }

  const parsed = JSON.parse(text.slice(start, end + 1));

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Model response was not an object.');
  }
  if (!Array.isArray(parsed.pages) || parsed.pages.length === 0) {
    throw new Error('Model response had no pages.');
  }

  return {
    title: typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim() : 'A New Story',
    pages: parsed.pages
      .map((page) => ({
        text: typeof page?.text === 'string' ? page.text.trim() : '',
        scene: typeof page?.scene === 'string' ? page.scene.trim() : '',
      }))
      .filter((page) => page.text),
  };
}
