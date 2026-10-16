import { MAX_SELECTIONS } from '../data/wordBank.js';

/**
 * The live counter. It stays pinned at the bottom so the child can always see
 * how many words are in play and get rid of one without hunting back up the
 * page for the chip they tapped.
 */
export function SelectionTray({ selected, onRemove, onClear, onWeave, isLoading }) {
  const count = selected.length;
  const ready = count > 0 && !isLoading;

  return (
    <div className="tray" role="region" aria-label="Your chosen words">
      <div className="tray__inner">
        <div className="tray__counter" aria-live="polite">
          <span className="tray__count">{count}</span>
          <span className="tray__of">of {MAX_SELECTIONS} words</span>
        </div>

        <div className="tray__items">
          {count === 0 ? (
            <p className="tray__empty">Tap some words above to start.</p>
          ) : (
            selected.map((word) => (
              <button
                key={word.id}
                type="button"
                className="tray__chip"
                onClick={() => onRemove(word)}
                aria-label={`Remove ${word.label}`}
              >
                {word.label}
                <span aria-hidden="true">×</span>
              </button>
            ))
          )}
        </div>

        <div className="tray__actions">
          {count > 0 && (
            <button type="button" className="btn btn--ghost" onClick={onClear} disabled={isLoading}>
              Clear
            </button>
          )}
          <button type="button" className="btn btn--primary" onClick={onWeave} disabled={!ready}>
            {isLoading ? 'Weaving…' : 'Weave my story'}
          </button>
        </div>
      </div>
    </div>
  );
}
