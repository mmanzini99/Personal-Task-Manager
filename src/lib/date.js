// Maschera gg/mm/aaaa: accetta qualunque input e restituisce le sole cifre formattate.
export function maskDate(raw) {
  const d = raw.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
}

// Valida la data mascherata.
// Restituisce { iso: 'aaaa-mm-gg' | null, error: string | null }.
export function parseDate(masked) {
  const d = masked.replace(/\D/g, '')
  if (d.length === 0) return { iso: null, error: null }
  if (d.length < 8) return { iso: null, error: 'Data incompleta' }
  const day = Number(d.slice(0, 2))
  const month = Number(d.slice(2, 4))
  const year = Number(d.slice(4, 8))
  const dt = new Date(Date.UTC(year, month - 1, day))
  if (
    year < 1900 ||
    dt.getUTCFullYear() !== year ||
    dt.getUTCMonth() !== month - 1 ||
    dt.getUTCDate() !== day
  ) {
    return { iso: null, error: 'Data non valida' }
  }
  return { iso: `${d.slice(4, 8)}-${d.slice(2, 4)}-${d.slice(0, 2)}`, error: null }
}

// 'aaaa-mm-gg' -> 'gg/mm/aaaa'
export function formatDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function todayLabel() {
  const s = new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Data di oggi + `offset` giorni, già nel formato gg/mm/aaaa.
export function relativeDate(offset) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}
