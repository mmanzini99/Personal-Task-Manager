import { useEffect, useMemo, useState } from 'react'
import { isConfigured, supabase } from './supabase'
import { DataProvider, useData } from './data'
import { go, useRoute } from './lib/router'
import Login from './Login'
import Home from './views/Home'
import AreaView from './views/AreaView'
import SubcategoryView from './views/SubcategoryView'

function Screens() {
  const { areas, subcategories, loaded, error, clearError } = useData()
  const { areaId, subId } = useRoute()
  const areasById = useMemo(() => Object.fromEntries(areas.map((a) => [a.id, a])), [areas])

  useEffect(() => {
    if (!error) return
    const t = setTimeout(clearError, 4000)
    return () => clearTimeout(t)
  }, [error, clearError])

  const area = areaId && areasById[areaId]
  const sub = subId && subcategories.find((s) => s.id === subId && s.area_id === areaId)

  useEffect(() => {
    // Indirizzo non valido (es. sottocategoria eliminata da un altro dispositivo).
    if (loaded && ((areaId && !area) || (subId && !sub))) go(area ? `/area/${area.id}` : '/')
  }, [loaded, areaId, subId, area, sub])

  let screen = null
  if (!loaded) screen = error ? null : <div className="splash" />
  else if (area && sub) screen = <SubcategoryView area={area} sub={sub} areasById={areasById} />
  else if (area && !subId) screen = <AreaView area={area} areasById={areasById} />
  else if (!areaId) screen = <Home areasById={areasById} />

  return (
    <>
      {screen}
      {error && (
        <div className="toast" role="alert" onClick={clearError}>
          {error}
        </div>
      )}
    </>
  )
}

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    if (!isConfigured) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  if (!isConfigured) {
    return (
      <div className="login">
        <div className="login-card">
          <h1 className="greeting">Configurazione mancante</h1>
          <p className="today">Mancano l'indirizzo e la chiave di Supabase (file .env).</p>
        </div>
      </div>
    )
  }
  if (session === undefined) return <div className="splash" />
  if (!session) return <Login />
  return (
    <DataProvider key={session.user.id}>
      <Screens />
    </DataProvider>
  )
}
