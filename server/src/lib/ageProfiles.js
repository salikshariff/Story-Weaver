/**
 * Age-based story length scaling.
 *
 * The age band drives three things at once: how long the story runs, how many
 * illustrated pages it breaks into, and how the model is told to write. Keeping
 * them in one table means a single edit changes all three coherently.
 *
 * `maxTokens` is deliberately generous relative to `targetWords` — the model
 * should never be cut off mid-sentence, we just want it aiming at a length.
 */
export const AGE_PROFILES = {
  '3-4': {
    label: 'Ages 3–4',
    targetWords: 160,
    pages: 4,
    maxTokens: 900,
    sentenceGuidance:
      'Very short sentences, 5 to 8 words each. One idea per sentence. Lots of repetition and sound words. Vocabulary a three-year-old hears every day.',
  },
  '5-6': {
    label: 'Ages 5–6',
    targetWords: 320,
    pages: 5,
    maxTokens: 1400,
    sentenceGuidance:
      'Short, clear sentences. Simple cause and effect the child can follow. A small problem that gets solved. Occasional playful new word, explained by context.',
  },
  '7-8': {
    label: 'Ages 7–8',
    targetWords: 550,
    pages: 6,
    maxTokens: 2200,
    sentenceGuidance:
      'Fuller sentences with some variety in rhythm. A real beginning, middle and end, with a moment of genuine suspense. Dialogue is welcome. Richer vocabulary, still concrete.',
  },
  '9-10': {
    label: 'Ages 9–10',
    targetWords: 850,
    pages: 7,
    maxTokens: 3200,
    sentenceGuidance:
      'Varied sentence length and a clear narrative voice. Let the main character want something and change by the end. Figurative language is fine. Avoid anything that reads as babyish.',
  },
};

export const DEFAULT_AGE = '5-6';

export function getAgeProfile(age) {
  return AGE_PROFILES[age] ?? AGE_PROFILES[DEFAULT_AGE];
}
