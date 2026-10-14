import { useState } from 'react'
import { useData } from '../data'
import { formatDate, parseDate } from '../lib/date'
import AreaLogo from './AreaLogo'
import DateInput from './DateInput'
import DateShortcuts from './DateShortcuts'
import Sheet, { Confirm } from './Sheet'

export default function EditTaskSheet({ task, onClose }) {
  const { areas, subcategories, updateTask, deleteTask } = useData()
  const [title, setTitle] = useState(task.title)
  const [areaId, setAreaId] = useState(task.area_id)
  const [subId, setSubId] = useState(task.subcategory_id ?? '')
  const [date, setDate] = useState(formatDate(task.due_date))
  const [notes, setNotes] = useState(task.notes ?? '')
  const [error, setError] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const area = areas.find((a) => a.id === areaId)
  const subs = area?.has_subcategories ? subcategories.filter((s) => s.area_id === areaId) : []
  const dateCheck = parseDate(date)
  const dateInvalid = date.replace(/\D/g, '').length === 8 && !!dateCheck.error

  const save = () => {
    if (!title.trim()) return setError('Il titolo non può essere vuoto')
    if (dateCheck.error) return setError(dateCheck.error)
    updateTask(task.id, {
      title: title.trim(),
      area_id: areaId,
      subcategory_id: subs.some((s) => s.id === subId) ? subId : null,
      due_date: dateCheck.iso,
      notes: notes.trim() || null
    })
    onClose()
  }

  if (confirmDelete) {
    return (
      <Confirm
        message={`Eliminare la task "${task.title}"?`}
        confirmLabel="Elimina"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteTask(task.id)
          onClose()
        }}
      />
    )
  }

  return (
    <Sheet title="Modifica task" onClose={onClose}>
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
      >
        <label className="field">
          <span>Titolo</span>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <div className="field">
          <span>Area</span>
          <div className="area-picker">
            {areas.map((a) => (
              <button
                key={a.id}
                type="button"
                className={`area-pick ${areaId === a.id ? 'is-selected' : ''}`}
                style={{ '--ring': a.color }}
                onClick={() => setAreaId(a.id)}
                aria-label={a.name}
                aria-pressed={areaId === a.id}
              >
                <AreaLogo area={a} size={32} />
              </button>
            ))}
          </div>
        </div>
        {subs.length > 0 && (
          <label className="field">
            <span>Sottocategoria</span>
            <select value={subId} onChange={(e) => setSubId(e.target.value)}>
              <option value="">Nessuna</option>
              {subs.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
        )}
        <div className="field">
          <span>Data</span>
          <div className="date-row">
            <DateInput value={date} onChange={setDate} invalid={dateInvalid} className="date-input--wide" />
            <DateShortcuts value={date} onPick={setDate} />
          </div>
        </div>
        <label className="field">
          <span>Note</span>
          <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        {error && <p className="form-error">{error}</p>}
        <div className="sheet-actions sheet-actions--split">
          <button type="button" className="btn btn--danger-ghost" onClick={() => setConfirmDelete(true)}>
            Elimina
          </button>
          <div className="sheet-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Annulla</button>
            <button type="submit" className="btn btn--primary">Salva</button>
          </div>
        </div>
      </form>
    </Sheet>
  )
}
