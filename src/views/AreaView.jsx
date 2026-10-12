import { useMemo, useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useData } from '../data'
import { go } from '../lib/router'
import { useShowCompleted } from '../lib/useShowCompleted'
import AreaLogo from '../components/AreaLogo'
import Composer from '../components/Composer'
import EditTaskSheet from '../components/EditTaskSheet'
import ListControls from '../components/ListControls'
import Sheet from '../components/Sheet'
import TaskList from '../components/TaskList'
import { IconBack, IconChevron, IconFolder, IconPlus } from '../components/Icons'

export function ViewHeader({ area, title, onBack, action }) {
  return (
    <header className="view-head">
      <button className="icon-btn" onClick={onBack} aria-label="Indietro">
        <IconBack />
      </button>
      <AreaLogo area={area} size={36} />
      <h1 className="view-title" style={{ color: area.color }}>{title}</h1>
      {action}
    </header>
  )
}

function SubcategoryRow({ sub, count, color }) {
  const { setNodeRef, isOver } = useDroppable({ id: `sub:${sub.id}` })
  return (
    <button
      ref={setNodeRef}
      className={`sub-row ${isOver ? 'is-over' : ''}`}
      style={{ '--area': color }}
      onClick={() => go(`/area/${sub.area_id}/sub/${sub.id}`)}
    >
      <IconFolder width={20} height={20} />
      <span className="sub-name">{sub.name}</span>
      <span className="sub-count">{count}</span>
      <IconChevron width={18} height={18} />
    </button>
  )
}

function NewSubcategory({ area, onClose }) {
  const { addSubcategory } = useData()
  const [name, setName] = useState('')
  return (
    <Sheet title="Nuova sottocategoria" onClose={onClose}>
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault()
          if (!name.trim()) return
          addSubcategory(area.id, name.trim())
          onClose()
        }}
      >
        <label className="field">
          <span>Nome</span>
          <input type="text" autoFocus placeholder="Es. Viaggio Lisbona" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <div className="sheet-actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>Annulla</button>
          <button type="submit" className="btn btn--primary" disabled={!name.trim()}>Crea</button>
        </div>
      </form>
    </Sheet>
  )
}

function MoveToSheet({ subs, count, onMove, onClose }) {
  return (
    <Sheet title={count === 1 ? 'Sposta 1 task in…' : `Sposta ${count} task in…`} onClose={onClose}>
      {subs.length === 0 ? (
        <p className="confirm-message">Crea prima una sottocategoria.</p>
      ) : (
        <div className="settings-list">
          {subs.map((s) => (
            <button key={s.id} className="settings-row" onClick={() => onMove(s.id)}>
              <IconFolder width={20} height={20} />
              <span className="settings-name">{s.name}</span>
              <IconChevron width={18} height={18} />
            </button>
          ))}
        </div>
      )}
      <div className="sheet-actions">
        <button className="btn btn--ghost" onClick={onClose}>Annulla</button>
      </div>
    </Sheet>
  )
}

export default function AreaView({ area, areasById }) {
  const { tasks, subcategories, moveToSubcategory } = useData()
  const [showCompleted, setShowCompleted] = useShowCompleted()
  const [editing, setEditing] = useState(null)
  const [newSub, setNewSub] = useState(false)
  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected] = useState(() => new Set())
  const [moving, setMoving] = useState(false)

  const withSubs = area.has_subcategories
  const subs = useMemo(
    () => (withSubs ? subcategories.filter((s) => s.area_id === area.id) : []),
    [withSubs, subcategories, area.id]
  )
  const visible = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.area_id === area.id &&
          (!withSubs || !t.subcategory_id) &&
          (showCompleted || !t.completed_at)
      ),
    [tasks, area.id, withSubs, showCompleted]
  )
  const openInSub = (subId) => tasks.filter((t) => t.subcategory_id === subId && !t.completed_at).length

  const toggleSelect = (id) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  const stopSelecting = () => {
    setSelecting(false)
    setSelected(new Set())
  }

  const subsSection = withSubs && (
    <section className="subs">
      <div className="subs-head">
        <h2 className="section-title">Sottocategorie</h2>
        <button className="chip" onClick={() => setNewSub(true)}>
          <IconPlus width={18} height={18} /> Nuova sottocategoria
        </button>
      </div>
      {subs.map((s) => (
        <SubcategoryRow key={s.id} sub={s} count={openInSub(s.id)} color={area.color} />
      ))}
    </section>
  )

  return (
    <div className="page">
      <ViewHeader area={area} title={area.name} onBack={() => go('/')} />

      <TaskList
        tasks={visible}
        areasById={areasById}
        showCompleted={showCompleted}
        onOpen={setEditing}
        onDropOnSubcategory={withSubs ? (taskId, subId) => moveToSubcategory([taskId], subId) : undefined}
        selecting={selecting}
        selected={selected}
        onToggleSelect={toggleSelect}
        before={
          <>
            {subsSection}
            <ListControls
              title={withSubs ? 'Task' : null}
              visible={visible}
              showCompleted={showCompleted}
              setShowCompleted={setShowCompleted}
              extra={
                withSubs &&
                !selecting && (
                  <button className="chip" onClick={() => setSelecting(true)} disabled={visible.length === 0}>
                    Seleziona
                  </button>
                )
              }
            />
          </>
        }
      />

      {selecting ? (
        <div className="composer-wrap">
          <div className="composer select-bar">
            <button className="btn btn--ghost" onClick={stopSelecting}>Annulla</button>
            <button className="btn btn--primary" disabled={selected.size === 0} onClick={() => setMoving(true)}>
              Sposta in…{selected.size > 0 && ` (${selected.size})`}
            </button>
          </div>
        </div>
      ) : (
        <Composer key={area.id} fixedArea={area} />
      )}

      {editing && <EditTaskSheet task={editing} onClose={() => setEditing(null)} />}
      {newSub && <NewSubcategory area={area} onClose={() => setNewSub(false)} />}
      {moving && (
        <MoveToSheet
          subs={subs}
          count={selected.size}
          onClose={() => setMoving(false)}
          onMove={(subId) => {
            moveToSubcategory([...selected], subId)
            setMoving(false)
            stopSelecting()
          }}
        />
      )}
    </div>
  )
}
