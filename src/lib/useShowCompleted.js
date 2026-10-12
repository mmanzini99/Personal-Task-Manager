import { useState } from 'react'

const KEY = 'showCompleted'

export function useShowCompleted() {
  const [value, setValue] = useState(() => {
    try {
      return localStorage.getItem(KEY) === '1'
    } catch {
      return false
    }
  })
  const set = (v) => {
    setValue(v)
    try {
      localStorage.setItem(KEY, v ? '1' : '0')
    } catch {
      // memoria locale non disponibile: la preferenza vale solo per questa sessione
    }
  }
  return [value, set]
}
