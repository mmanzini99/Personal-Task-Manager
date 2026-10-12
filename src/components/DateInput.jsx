import { maskDate } from '../lib/date'

export default function DateInput({ value, onChange, invalid, className = '', ...rest }) {
  return (
    <input
      className={`date-input ${invalid ? 'is-invalid' : ''} ${className}`}
      type="text"
      inputMode="numeric"
      pattern="[0-9/]*"
      autoComplete="off"
      placeholder="gg/mm/aaaa"
      maxLength={10}
      value={value}
      onChange={(e) => onChange(maskDate(e.target.value))}
      aria-label="Data"
      aria-invalid={invalid || undefined}
      {...rest}
    />
  )
}
