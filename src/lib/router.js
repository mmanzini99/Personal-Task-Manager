import { useEffect, useState } from 'react'

// Rotte: #/  ·  #/area/<id>  ·  #/area/<id>/sub/<id>
export function useRoute() {
  const read = () => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  const [parts, setParts] = useState(read)
  useEffect(() => {
    const onHash = () => {
      setParts(read())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return {
    areaId: parts[0] === 'area' ? parts[1] : null,
    subId: parts[2] === 'sub' ? parts[3] : null
  }
}

export const go = (path) => {
  window.location.hash = path
}
