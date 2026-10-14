import { relativeDate } from '../lib/date'

const OPTIONS = [
  ['Oggi', 0],
  ['Domani', 1]
]

// Pulsanti rapidi per la data. Il pointerdown non toglie il focus al campo data,
// così la tastiera non si chiude prima del tocco.
export default function DateShortcuts({ value, onPick }) {
  return (
    <div className="date-shortcuts">
      {OPTIONS.map(([label, offset]) => {
        const masked = relativeDate(offset)
        return (
          <button
            key={label}
            type="button"
            className={`date-chip ${value === masked ? 'is-selected' : ''}`}
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => onPick(masked)}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
