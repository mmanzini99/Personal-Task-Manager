import { useMemo, useState } from 'react'
import { useData } from '../data'
import { go } from '../lib/router'
import EditTaskSheet from '../components/EditTaskSheet'
import TaskCard from '../components/TaskCard'
import { IconBack } from '../components/Icons'

// Tutte le task completate, dalla più recente.
export default function DoneView({ areasById }) {
  const { tasks } = useData()
  const [editing, setEditing] = useState(null)
  const done = useMemo(
    () =>
      tasks
        .filter((t) => t.completed_at)
        .sort((a, b) => (a.completed_at < b.completed_at ? 1 : a.completed_at > b.completed_at ? -1 : 0)),
    [tasks]
  )

  return (
    <div className="page page--no-composer">
      <header className="view-head">
        <button className="icon-btn" onClick={() => go('/')} aria-label="Indietro">
          <IconBack />
        </button>
        <h1 className="view-title">Task svolte</h1>
      </header>
      <div className="task-list">
        {done.length === 0 && <p className="empty">Nessuna task svolta</p>}
        {done.map((t) => (
          <TaskCard key={t.id} task={t} area={areasById[t.area_id]} showCompleted onOpen={setEditing} />
        ))}
      </div>
      {editing && <EditTaskSheet task={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
