/**
 * The four categories the child picks from.
 *
 * `art` ties a word to a piece of the SVG library (see src/data/illustrations.jsx).
 * A word with no `art` key still works — it just will not contribute a layer to
 * the picture. Keep the ids stable: they are what the scene matcher looks up.
 */
export const CATEGORIES = [
  {
    id: 'characters',
    name: 'Who',
    hint: 'Who is the story about?',
    accent: 'var(--c-rose)',
    words: [
      { id: 'dragon', label: 'a small dragon', art: 'dragon' },
      { id: 'girl', label: 'a brave girl', art: 'child' },
      { id: 'boy', label: 'a curious boy', art: 'child' },
      { id: 'cat', label: 'a sleepy cat', art: 'cat' },
      { id: 'robot', label: 'a rusty robot', art: 'robot' },
      { id: 'owl', label: 'a wise owl', art: 'owl' },
      { id: 'whale', label: 'a singing whale', art: 'whale' },
      { id: 'grandma', label: 'a grandmother', art: 'child' },
      { id: 'mouse', label: 'a tiny mouse', art: 'mouse' },
      { id: 'astronaut', label: 'an astronaut', art: 'astronaut' },
    ],
  },
  {
    id: 'places',
    name: 'Where',
    hint: 'Where does it happen?',
    accent: 'var(--c-teal)',
    words: [
      { id: 'forest', label: 'a deep forest', art: 'forest' },
      { id: 'moon', label: 'the moon', art: 'moon' },
      { id: 'ocean', label: 'under the ocean', art: 'ocean' },
      { id: 'castle', label: 'an old castle', art: 'castle' },
      { id: 'library', label: 'a quiet library', art: 'library' },
      { id: 'mountain', label: 'a snowy mountain', art: 'mountain' },
      { id: 'desert', label: 'a golden desert', art: 'desert' },
      { id: 'city', label: 'a busy city', art: 'city' },
      { id: 'garden', label: 'a secret garden', art: 'garden' },
      { id: 'attic', label: 'a dusty attic', art: 'attic' },
    ],
  },
  {
    id: 'things',
    name: 'What',
    hint: 'What turns up in the story?',
    accent: 'var(--c-amber)',
    words: [
      { id: 'key', label: 'a golden key', art: 'key' },
      { id: 'map', label: 'a torn map', art: 'map' },
      { id: 'umbrella', label: 'a flying umbrella', art: 'umbrella' },
      { id: 'lantern', label: 'a lantern', art: 'lantern' },
      { id: 'seed', label: 'a magic seed', art: 'seed' },
      { id: 'boat', label: 'a paper boat', art: 'boat' },
      { id: 'telescope', label: 'a telescope', art: 'telescope' },
      { id: 'violin', label: 'a violin', art: 'violin' },
      { id: 'cookie', label: 'the last cookie', art: 'cookie' },
      { id: 'door', label: 'a door that was not there before', art: 'door' },
    ],
  },
  {
    id: 'feelings',
    name: 'How',
    hint: 'How does it feel?',
    accent: 'var(--c-violet)',
    words: [
      { id: 'brave', label: 'brave' },
      { id: 'silly', label: 'very silly' },
      { id: 'lonely', label: 'a little lonely' },
      { id: 'excited', label: 'wildly excited' },
      { id: 'sleepy', label: 'sleepy' },
      { id: 'curious', label: 'curious' },
      { id: 'lost', label: 'lost, then found' },
      { id: 'surprised', label: 'completely surprised' },
      { id: 'proud', label: 'proud' },
      { id: 'kind', label: 'kind' },
    ],
  },
];

export const AGE_BANDS = [
  { id: '3-4', label: 'Ages 3–4', blurb: 'Very short, lots of repetition' },
  { id: '5-6', label: 'Ages 5–6', blurb: 'A small problem, solved' },
  { id: '7-8', label: 'Ages 7–8', blurb: 'A real beginning, middle and end' },
  { id: '9-10', label: 'Ages 9–10', blurb: 'Longer, with a narrative voice' },
];

export const MAX_SELECTIONS = 8;

/** Flat lookup of every word by id — used when restoring a saved selection. */
export const WORDS_BY_ID = new Map(
  CATEGORIES.flatMap((category) =>
    category.words.map((word) => [word.id, { ...word, category: category.name }]),
  ),
);
