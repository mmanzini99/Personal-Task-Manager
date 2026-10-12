import { useMemo, useState } from 'react'
import { useData } from '../data'
import { go } from '../lib/router'
import { useShowCompleted } from '../lib/useShowCompleted'
import Composer from '../components/Composer'
import EditTaskSheet from '../components/EditTaskSheet'
import ListControls from '../components/ListControls'
import { Confirm } from '../components/Sheet'
import TaskList from '../components/TaskList'
import { IconTrash } from '../components/Icons'
import { ViewHeader } from './AreaView'

export default function SubcategoryView({ area, sub, areasById }) {
  const { tasks, deleteSubcategory } = useData()
  const [showCompleted, setShowCompleted] = useShowCompleted()
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const all = useMemo(() => tasks.filter((t) => t.subcategory_id === sub.id), [tasks, sub.id])
  const visible = useMemo(() => all.filter((t) => showCompleted || !t.completed_at), [all, showCompleted])
  const back = `/area/${area.id}`

  return (
    <div className="page">
      <ViewHeader
        area={area}
        title={sub.name}
        onBack={() => go(back)}
        action={
          <button className="icon-btn icon-btn--danger" onClick={() => setConfirmDelete(true)} aria-label="Elimina sottocategoria">
            <IconTrash />
          </button>
        }
      />
      <ListControls visible={visible} showCompleted={showCompleted} setShowCompleted={setShowCompleted} />
      <TaskList tasks={visible} areasById={areasById} showCompleted={showCompleted} onOpen={setEditing} />
      <Composer key={sub.id} fixedArea={area} subcategoryId={sub.id} />

      {editing && <EditTaskSheet task={editing} onClose={() => setEditing(null)} />}
      {confirmDelete && (
        <Confirm
          message={
            all.length === 0
              ? `Eliminare ${sub.name}?`
              : `Eliminare ${sub.name} e ${all.length === 1 ? 'la sua task' : `le sue ${all.length} task`}?`
          }
          confirmLabel="Elimina"
          danger
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            deleteSubcategory(sub.id)
            go(back)
          }}
        />
      )}
    </div>
  )
}
