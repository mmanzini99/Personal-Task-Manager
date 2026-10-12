import { useEffect, useState } from 'react'
import { useData } from '../data'
import { formatDate } from '../lib/date'
import { IconCheck, IconPencil } from './Icons'

export default function TaskCard({
  task,
  area,
  showCompleted,
  selecting,
  selected,
  onToggleSelect,
  onOpen,
  dragProps,
  className = '',
  style
}) {
  const { toggleComplete } = useData()
  const [completing, setCompleting] = useState(false)
  const done = !!task.completed_at || completing
  const color = area?.color ?? '#888'

  useEffect(() => setCompleting(false), [task.completed_at])

  const onCircle = (e) => {
    e.stopPropagation()
    if (selecting) return onToggleSelect(task.id)
    if (task.completed_at) return toggleComplete(task)
    if (completing) return
    setCompleting(true)
    setTimeout(() => toggleComplete(task), 700)
  }

  const onCard = () => (selecting ? onToggleSelect(task.id) : onOpen(task))

  const leaving = completing && !showCompleted

  return (
    <div
      className={`task-card ${done ? 'is-done' : ''} ${leaving ? 'is-leaving' : ''} ${className}`}
      style={{ ...style, '--area': color }}
      onClick={onCard}
      {...dragProps}
    >
      {selecting ? (
        <button
          type="button"
          className={`select-box ${selected ? 'is-selected' : ''}`}
          onClick={onCircle}
          aria-label={selected ? 'Deseleziona' : 'Seleziona'}
          aria-pressed={selected}
        >
          {selected && <IconCheck width={16} height={16} strokeWidth={3} />}
        </button>
      ) : (
        <button
          type="button"
          className="check"
          onClick={onCircle}
          aria-label={task.completed_at ? 'Segna da fare' : 'Completa'}
        >
          <span className="check-circle">
            {done && <IconCheck width={16} height={16} strokeWidth={3} />}
          </span>
        </button>
      )}
      <div className="task-body">
        <div className="task-title">{task.title}</div>
        <div className="task-meta">
          <span className="pill">
            {area?.name}
            {task.due_date && <span className="pill-date">{formatDate(task.due_date)}</span>}
          </span>
          {task.notes && <IconPencil className="note-icon" width={16} height={16} aria-label="Con note" />}
        </div>
      </div>
    </div>
  )
}
