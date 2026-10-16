import { useRef, useState } from 'react';

import { WordPicker } from './components/WordPicker.jsx';
import { SelectionTray } from './components/SelectionTray.jsx';
import { AgePicker } from './components/AgePicker.jsx';
import { StoryReader } from './components/StoryReader.jsx';
import { MAX_SELECTIONS } from './data/wordBank.js';
import { weaveStory } from './lib/api.js';

export default function App() {
  const [selected, setSelected] = useState([]);
  const [age, setAge] = useState('5-6');
  const [extra, setExtra] = useState('');
  const [story, setStory] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Keeps a slow request from landing after the child has moved on.
  const inFlight = useRef(null);

  function toggleWord(word) {
    setSelected((current) => {
      const exists = current.some((w) => w.id === word.id);
      if (exists) return current.filter((w) => w.id !== word.id);
      if (current.length >= MAX_SELECTIONS) return current;
      return [...current, word];
    });
  }

  async function handleWeave() {
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const result = await weaveStory({
        words: selected,
        age,
        prompt: extra,
        signal: controller.signal,
      });
      setStory(result);
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message);
    } finally {
      if (inFlight.current === controller) {
        inFlight.current = null;
        setIsLoading(false);
      }
    }
  }

  function startOver() {
    inFlight.current?.abort();
    inFlight.current = null;
    setStory(null);
    setError(null);
    setIsLoading(false);
  }

  return (
    <div className="app">
      <header className="masthead">
        <h1 className="masthead__title">Sania&rsquo;s Story Weaver</h1>
        <p className="masthead__tagline">Pick your words. Get a story that uses every one.</p>
      </header>

      <main className="main">
        {story ? (
          <StoryReader story={story} selectedWords={selected} onStartOver={startOver} />
        ) : (
          <>
            <AgePicker value={age} onChange={setAge} />

            <WordPicker selected={selected} onToggle={toggleWord} />

            <div className="extra">
              <label className="extra__label" htmlFor="extra">
                Anything else? <span className="extra__optional">(optional)</span>
              </label>
              <input
                id="extra"
                className="extra__input"
                type="text"
                value={extra}
                maxLength={400}
                placeholder="e.g. it should happen on a rainy Tuesday"
                onChange={(event) => setExtra(event.target.value)}
              />
            </div>

            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
          </>
        )}
      </main>

      {!story && (
        <SelectionTray
          selected={selected}
          onRemove={toggleWord}
          onClear={() => setSelected([])}
          onWeave={handleWeave}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
