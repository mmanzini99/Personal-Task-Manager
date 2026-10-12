import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from './supabase'

const DataContext = createContext(null)

export const useData = () => useContext(DataContext)

const byPosition = (a, b) => a.position - b.position

export function DataProvider({ children }) {
  const [areas, setAreas] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [tasks, setTasks] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(null)
  const tasksRef = useRef(tasks)
  tasksRef.current = tasks

  const reload = useCallback(async () => {
    const [a, s, t] = await Promise.all([
      supabase.from('areas').select('*').order('sort_order'),
      supabase.from('subcategories').select('*').order('created_at'),
      supabase.from('tasks').select('*').order('position')
    ])
    const err = a.error || s.error || t.error
    if (err) {
      setError('Impossibile caricare i dati. Controlla la connessione.')
      return
    }
    setAreas(a.data)
    setSubcategories(s.data)
    setTasks(t.data)
    setLoaded(true)
  }, [])

  // Caricamento iniziale, aggiornamento in tempo reale e al ritorno nell'app.
  useEffect(() => {
    reload()
    let timer
    const scheduleReload = () => {
      clearTimeout(timer)
      timer = setTimeout(reload, 400)
    }
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'areas' }, scheduleReload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subcategories' }, scheduleReload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, scheduleReload)
      .subscribe()
    const onVisible = () => document.visibilityState === 'visible' && reload()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearTimeout(timer)
      supabase.removeChannel(channel)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [reload])

  // Esegue la richiesta al server; in caso di errore avvisa e ricarica i dati reali.
  const run = useCallback(
    async (request) => {
      const { error: err } = await request
      if (err) {
        console.error(err)
        setError('Salvataggio non riuscito. Riprova.')
        reload()
        return false
      }
      return true
    },
    [reload]
  )

  const patchTasksLocal = (changes) =>
    setTasks((prev) =>
      prev.map((t) => (changes[t.id] ? { ...t, ...changes[t.id] } : t)).sort(byPosition)
    )

  const savePositions = (changes) =>
    Promise.all(
      Object.entries(changes).map(([id, c]) =>
        run(supabase.from('tasks').update(c).eq('id', id))
      )
    )

  const actions = useMemo(
    () => ({
      reload,
      clearError: () => setError(null),

      addTask: ({ title, areaId, subcategoryId = null, dueDate = null, notes = null }) => {
        const current = tasksRef.current
        const minPos = current.length ? Math.min(...current.map((t) => t.position)) : 0
        const task = {
          id: crypto.randomUUID(),
          area_id: areaId,
          subcategory_id: subcategoryId,
          title,
          notes,
          due_date: dueDate,
          completed_at: null,
          position: minPos - 1
        }
        setTasks((prev) => [task, ...prev].sort(byPosition))
        return run(supabase.from('tasks').insert(task))
      },

      updateTask: (id, patch) => {
        patchTasksLocal({ [id]: patch })
        return run(supabase.from('tasks').update(patch).eq('id', id))
      },

      deleteTask: (id) => {
        setTasks((prev) => prev.filter((t) => t.id !== id))
        return run(supabase.from('tasks').delete().eq('id', id))
      },

      toggleComplete: (task) => {
        const completed_at = task.completed_at ? null : new Date().toISOString()
        patchTasksLocal({ [task.id]: { completed_at } })
        return run(supabase.from('tasks').update({ completed_at }).eq('id', task.id))
      },

      // Sposta activeId nella posizione di overId all'interno della lista visibile.
      reorder: (visible, activeId, overId) => {
        const from = visible.findIndex((t) => t.id === activeId)
        const to = visible.findIndex((t) => t.id === overId)
        if (from < 0 || to < 0 || from === to) return
        const list = [...visible]
        const [moved] = list.splice(from, 1)
        list.splice(to, 0, moved)
        const prev = list[to - 1]
        const next = list[to + 1]
        let position
        if (!prev) position = next.position - 1
        else if (!next) position = prev.position + 1
        else position = (prev.position + next.position) / 2

        // Se lo spazio tra due posizioni si esaurisce, rinumera tutto.
        if (prev && next && (position === prev.position || position === next.position)) {
          const all = [...tasksRef.current].sort(byPosition)
          const without = all.filter((t) => t.id !== activeId)
          const anchor = next ? without.findIndex((t) => t.id === next.id) : without.length
          without.splice(anchor, 0, moved)
          const changes = {}
          without.forEach((t, i) => {
            if (t.position !== i) changes[t.id] = { position: i }
          })
          patchTasksLocal(changes)
          return savePositions(changes)
        }
        patchTasksLocal({ [activeId]: { position } })
        return run(supabase.from('tasks').update({ position }).eq('id', activeId))
      },

      // Riordina le task visibili per scadenza (senza data in fondo),
      // riutilizzando le loro posizioni attuali.
      sortByDue: (visible) => {
        const slots = visible.map((t) => t.position).sort((a, b) => a - b)
        const sorted = [...visible].sort((a, b) => {
          if (a.due_date && b.due_date) {
            return a.due_date < b.due_date ? -1 : a.due_date > b.due_date ? 1 : a.position - b.position
          }
          if (a.due_date) return -1
          if (b.due_date) return 1
          return a.position - b.position
        })
        const changes = {}
        sorted.forEach((t, i) => {
          if (t.position !== slots[i]) changes[t.id] = { position: slots[i] }
        })
        patchTasksLocal(changes)
        return savePositions(changes)
      },

      moveToSubcategory: (ids, subcategoryId) => {
        const changes = Object.fromEntries(ids.map((id) => [id, { subcategory_id: subcategoryId }]))
        patchTasksLocal(changes)
        return run(supabase.from('tasks').update({ subcategory_id: subcategoryId }).in('id', ids))
      },

      addSubcategory: (areaId, name) => {
        const sub = { id: crypto.randomUUID(), area_id: areaId, name }
        setSubcategories((prev) => [...prev, sub])
        return run(supabase.from('subcategories').insert(sub))
      },

      deleteSubcategory: (id) => {
        setSubcategories((prev) => prev.filter((s) => s.id !== id))
        setTasks((prev) => prev.filter((t) => t.subcategory_id !== id))
        return run(supabase.from('subcategories').delete().eq('id', id))
      },

      updateArea: (id, patch) => {
        setAreas((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
        return run(supabase.from('areas').update(patch).eq('id', id))
      },

      // Carica il logo (già ridimensionato) e restituisce l'URL pubblico.
      uploadLogo: async (areaId, blob) => {
        const path = `${areaId}-${Date.now()}.png`
        const { error: err } = await supabase.storage
          .from('logos')
          .upload(path, blob, { contentType: 'image/png' })
        if (err) {
          console.error(err)
          setError('Caricamento del logo non riuscito.')
          return null
        }
        return supabase.storage.from('logos').getPublicUrl(path).data.publicUrl
      },

      removeLogoFile: (url) => {
        const path = url?.split('/logos/')[1]
        if (path) supabase.storage.from('logos').remove([path])
      }
    }),
    [reload, run]
  )

  const value = { areas, subcategories, tasks, loaded, error, ...actions }
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
