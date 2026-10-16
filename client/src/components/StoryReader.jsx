import { useEffect, useState } from 'react';

import { Illustration } from './Illustration.jsx';

export function StoryReader({ story, selectedWords, onStartOver }) {
  const [page, setPage] = useState(0);
  const total = story.pages.length;

  // A freshly woven story always opens at page one.
  useEffect(() => {
    setPage(0);
  }, [story]);

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'ArrowRight') setPage((p) => Math.min(p + 1, total - 1));
      if (event.key === 'ArrowLeft') setPage((p) => Math.max(p - 1, 0));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [total]);

  const current = story.pages[page];

  return (
    <article className="reader">
      <header className="reader__head">
        <h2 className="reader__title">{story.title}</h2>
        <button type="button" className="btn btn--ghost" onClick={onStartOver}>
          New story
        </button>
      </header>

      <div className="reader__page" key={page}>
        <Illustration scene={current.scene} selectedWords={selectedWords} pageIndex={page} />
        <p className="reader__text">{current.text}</p>
      </div>

      <nav className="reader__nav" aria-label="Story pages">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          disabled={page === 0}
        >
          ← Back
        </button>

        <div className="reader__dots" aria-hidden="true">
          {story.pages.map((_, i) => (
            <span key={i} className="dot" data-active={i === page} />
          ))}
        </div>

        <span className="reader__count" aria-live="polite">
          Page {page + 1} of {total}
        </span>

        <button
          type="button"
          className="btn btn--primary"
          onClick={() => setPage((p) => Math.min(p + 1, total - 1))}
          disabled={page === total - 1}
        >
          Next →
        </button>
      </nav>
    </article>
  );
}
