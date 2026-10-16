import { AGE_BANDS } from '../data/wordBank.js';

export function AgePicker({ value, onChange }) {
  return (
    <fieldset className="ages">
      <legend className="ages__legend">Who is this story for?</legend>
      <div className="ages__row">
        {AGE_BANDS.map((band) => (
          <label key={band.id} className="age" data-selected={value === band.id}>
            <input
              type="radio"
              name="age"
              value={band.id}
              checked={value === band.id}
              onChange={() => onChange(band.id)}
            />
            <span className="age__label">{band.label}</span>
            <span className="age__blurb">{band.blurb}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
