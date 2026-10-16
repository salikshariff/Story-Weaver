/**
 * The only network call the app makes. The API key lives on the server, so
 * the browser never holds a credential.
 */
export async function weaveStory({ words, age, prompt, signal }) {
  const response = await fetch('/api/story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      words: words.map((word) => ({ label: word.label, category: word.category })),
      age,
      prompt,
    }),
    signal,
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('The storyteller sent something we could not read.');
  }

  if (!response.ok) {
    throw new Error(payload?.error || 'Something went wrong weaving that story.');
  }

  return payload;
}
