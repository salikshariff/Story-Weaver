import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';

import { buildSystemPrompt, buildUserPrompt } from '../lib/storyPrompt.js';
import { parseStoryRequest, parseStoryResponse, BadRequestError } from '../lib/validate.js';
import { getAgeProfile } from '../lib/ageProfiles.js';
import { rateLimit } from '../lib/rateLimit.js';

const DEFAULT_MODEL = 'claude-sonnet-5-5';

// Created once at module load. The SDK reads ANTHROPIC_API_KEY from the
// environment; the key never leaves this process.
const client = new Anthropic();

export const storyRouter = Router();

storyRouter.post('/story', rateLimit, async (req, res) => {
  let request;
  try {
    request = parseStoryRequest(req.body);
  } catch (error) {
    if (error instanceof BadRequestError) {
      return res.status(400).json({ error: error.message });
    }
    throw error;
  }

  const profile = getAgeProfile(request.age);

  try {
    const message = await client.messages.create({
      model: process.env.STORY_MODEL || DEFAULT_MODEL,
      max_tokens: profile.maxTokens,
      temperature: 1,
      system: buildSystemPrompt(request.age),
      messages: [{ role: 'user', content: buildUserPrompt(request) }],
    });

    const rawText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('');

    const story = parseStoryResponse(rawText);

    res.json({
      ...story,
      age: request.age,
      words: request.words,
      usage: {
        inputTokens: message.usage?.input_tokens,
        outputTokens: message.usage?.output_tokens,
      },
    });
  } catch (error) {
    // Pass the model's own rate limiting and overload signals through rather
    // than flattening everything to a 500 — the client retries differently.
    const status = error?.status;
    if (status === 429 || status === 529) {
      return res.status(503).json({
        error: 'The storyteller is busy right now. Try again in a moment.',
      });
    }
    if (status === 401) {
      console.error('Anthropic rejected the API key.');
      return res.status(500).json({ error: 'The storyteller is not configured correctly.' });
    }

    console.error('Story generation failed:', error);
    res.status(500).json({ error: 'Something went wrong weaving that story. Try again?' });
  }
});
