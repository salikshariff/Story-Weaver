import { useCallback, useEffect, useState } from 'react';

import { Illustration } from './Illustration.jsx';
import { useReadAloud, tokenize } from '../lib/speech.js';
import { useKokoroNarrator } from '../lib/kokoro.js';

// The published artifact build sets this off: its sandbox blocks fetching the
// model weights, so only the system voice can work there.
const KOKORO_ENABLED = import.meta.env.VITE_KOKORO !== 'off';

export function StoryReader({ story, selectedWords, onStartOver }) {
  const [page, setPage] = useState(0);
  const [engine, setEngine] = useState(KOKORO_ENABLED ? 'kokoro' : 'system');
  const total = story.pages.length;

  // A freshly woven story always opens at page one.
  useEffect(() => {
    setPage(0);
  }, [story]);

  const goToPage = useCallback(
    (next) => {
      setPage(Math.min(Math.max(next, 0), total - 1));
    },
    [total],
  );

  const system = useReadAloud({ pages: story.pages, page, goToPage, age: story.age });
  const kokoro = useKokoroNarrator({ pages: story.pages, page, goToPage, age: story.age });

  const useKokoro = KOKORO_ENABLED && kokoro.supported;
  const narrator = engine === 'kokoro' && useKokoro ? kokoro : system;
  const idle = engine === 'kokoro' && useKokoro ? system : kokoro;

  // Only one engine speaks at a time.
  function switchEngine(next) {
    narrator.stop();
    setEngine(next);
  }

  const turnTo = useCallback(
    (next) => {
      const target = Math.min(Math.max(next, 0), total - 1);
      if (target === page) return;
      goToPage(target);
      if (narrator.isPlaying()) narrator.speakPage(target);
    },
    [page, total, goToPage, narrator],
  );

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'ArrowRight') turnTo(page + 1);
      if (event.key === 'ArrowLeft') turnTo(page - 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [turnTo, page]);

  // Stop the engine that is not in use when the component unmounts.
  useEffect(() => () => idle.stop(), [idle]);

  const current = story.pages[page];
  const loading = engine === 'kokoro' && kokoro.status === 'loading';
  const failed = engine === 'kokoro' && kokoro.status === 'error';

  return (
    <article className="reader">
      <header className="reader__head">
        <h2 className="reader__title">{story.title}</h2>

        <div className="reader__tools">
          <button
            type="button"
            className="btn btn--speak"
            data-speaking={narrator.isSpeaking}
            onClick={narrator.toggle}
            aria-pressed={narrator.isSpeaking}
            disabled={loading}
          >
            <SpeakerIcon speaking={narrator.isSpeaking} />
            {narrator.isSpeaking ? 'Stop' : 'Read aloud'}
          </button>

          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              narrator.stop();
              onStartOver();
            }}
          >
            New story
          </button>
        </div>
      </header>

      <div className="narrator-bar">
        {useKokoro && (
          <div className="narrator-bar__engines" role="group" aria-label="Narrator engine">
            <button
              type="button"
              className="engine"
              data-on={engine === 'kokoro'}
              onClick={() => switchEngine('kokoro')}
            >
              Natural voice
            </button>
            <button
              type="button"
              className="engine"
              data-on={engine === 'system'}
              onClick={() => switchEngine('system')}
            >
              System voice
            </button>
          </div>
        )}

        {engine === 'kokoro' && useKokoro ? (
          <>
            {kokoro.status === 'ready' && kokoro.voices.length > 0 && (
              <label className="voice-pick">
                <span className="voice-pick__label">Narrator</span>
                <select
                  id="narrator-voice-kokoro"
                  className="voice-pick__select"
                  value={kokoro.voiceId}
                  onChange={(event) => {
                    kokoro.setVoiceId(event.target.value);
                    if (kokoro.isPlaying()) kokoro.speakPage(page);
                  }}
                >
                  {kokoro.voices.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} · {v.language === 'en-gb' ? 'British' : 'American'} · {v.grade}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {loading && (
              <span className="narrator-bar__note" role="status">
                Downloading the voice, once · {kokoro.progress}%
              </span>
            )}

            {failed && (
              <span className="narrator-bar__note narrator-bar__note--bad" role="alert">
                The natural voice could not load. Switch to the system voice.
              </span>
            )}

            {kokoro.status === 'idle' && (
              <span className="narrator-bar__note">
                First play downloads the voice, then it works offline.
              </span>
            )}
          </>
        ) : (
          system.voices.length > 1 && (
            <label className="voice-pick">
              <span className="voice-pick__label">Narrator</span>
              <select
                id="narrator-voice-system"
                className="voice-pick__select"
                value={system.voice?.voiceURI ?? ''}
                onChange={(event) => {
                  system.setChosenURI(event.target.value);
                  if (system.isPlaying()) system.speakPage(page);
                }}
              >
                {system.voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name}
                  </option>
                ))}
              </select>
            </label>
          )
        )}
      </div>

      <div className="reader__page" key={page}>
        <Illustration scene={current.scene} selectedWords={selectedWords} pageIndex={page} />
        <PageText text={current.text} highlight={narrator.highlight} />
      </div>

      <nav className="reader__nav" aria-label="Story pages">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => turnTo(page - 1)}
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
          onClick={() => turnTo(page + 1)}
          disabled={page === total - 1}
        >
          Next →
        </button>
      </nav>
    </article>
  );
}

/**
 * The system engine reports the word it is speaking, so that word is marked.
 * Kokoro returns audio with no timings, so the sentence is marked instead.
 * With nothing being spoken this stays a plain paragraph.
 */
function PageText({ text, highlight }) {
  if (!highlight) return <p className="reader__text">{text}</p>;

  if (highlight.kind === 'range') {
    const { start, end } = highlight;
    return (
      <p className="reader__text">
        {text.slice(0, start)}
        <mark className="spoken spoken--line">{text.slice(start, end)}</mark>
        {text.slice(end)}
      </p>
    );
  }

  const tokens = tokenize(text);
  return (
    <p className="reader__text">
      {tokens.map((token, i) => {
        const active = highlight.charIndex >= token.start && highlight.charIndex < token.end;
        return active ? (
          <mark key={i} className="spoken">
            {token.text}
          </mark>
        ) : (
          <span key={i}>{token.text}</span>
        );
      })}
    </p>
  );
}

function SpeakerIcon({ speaking }) {
  return (
    <svg className="speak-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path
        d="M11 3.5 6.5 7H3.5v6h3L11 16.5z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {speaking ? (
        <path
          d="M14 6.5a5 5 0 0 1 0 7M16.4 4.4a8 8 0 0 1 0 11.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M14 6.5a5 5 0 0 1 0 7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
