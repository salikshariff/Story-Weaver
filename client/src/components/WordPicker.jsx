import { CATEGORIES, MAX_SELECTIONS } from '../data/wordBank.js';

export function WordPicker({ selected, onToggle }) {
  const atLimit = selected.length >= MAX_SELECTIONS;

  return (
    <div className="picker">
      {CATEGORIES.map((category) => (
        <section
          key={category.id}
          className="category"
          style={{ '--accent': category.accent }}
        >
          <header className="category__head">
            <h2 className="category__name">{category.name}</h2>
            <p className="category__hint">{category.hint}</p>
          </header>

          <div className="chips" role="group" aria-label={category.hint}>
            {category.words.map((word) => {
              const isSelected = selected.some((s) => s.id === word.id);
              // A full tray should still let you deselect what you already picked.
              const isDisabled = atLimit && !isSelected;

              return (
                <button
                  key={word.id}
                  type="button"
                  className="chip"
                  aria-pressed={isSelected}
                  disabled={isDisabled}
                  onClick={() => onToggle({ ...word, category: category.name })}
                >
                  {word.label}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
