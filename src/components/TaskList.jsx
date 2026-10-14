import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useData } from '../data'
import TaskCard from './TaskCard'

// Blocca lo scorrimento della pagina su iOS solo mentre si trascina.
let dragging = false
if (typeof document !== 'undefined') {
  document.addEventListener('touchmove', (e) => dragging && e.cancelable && e.preventDefault(), {
    passive: false
  })
}

// Prima i bersagli "sottocategoria" sotto il dito, poi la lista ordinabile.
const collision = (args) => {
  const subs = args.droppableContainers.filter((c) => String(c.id).startsWith('sub:'))
  const hit = pointerWithin({ ...args, droppableContainers: subs })
  if (hit.length) return hit
  const items = args.droppableContainers.filter((c) => !String(c.id).startsWith('sub:'))
  return closestCenter({ ...args, droppableContainers: items })
}

function SortableCard({ task, disabled, lastDragEnd, onOpen, ...props }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled
  })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={isDragging ? 'sortable is-placeholder' : 'sortable'}
    >
      <TaskCard
        task={task}
        dragProps={{ ...attributes, ...listeners, role: undefined, tabIndex: undefined }}
        onOpen={(t) => Date.now() - lastDragEnd.current > 300 && onOpen(t)}
        {...props}
      />
    </div>
  )
}

export default function TaskList({
  tasks,
  areasById,
  onOpen,
  onDropOnSubcategory,
  selecting = false,
  selected,
  onToggleSelect,
  before,
  emptyText = 'Nessuna task'
}) {
  const { reorder } = useData()
  const [activeId, setActiveId] = useState(null)
  const [overSub, setOverSub] = useState(false)
  const lastDragEnd = useRef(0)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { delay: 250, tolerance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 300, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => () => (dragging = false), [])

  const finish = () => {
    dragging = false
    setActiveId(null)
    setOverSub(false)
    lastDragEnd.current = Date.now()
  }

  const onDragEnd = ({ active, over }) => {
    finish()
    if (!over) return
    const overId = String(over.id)
    if (overId.startsWith('sub:')) {
      onDropOnSubcategory?.(active.id, overId.slice(4))
    } else if (active.id !== over.id) {
      reorder(tasks, active.id, over.id)
    }
  }

  const activeTask = activeId && tasks.find((t) => t.id === activeId)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collision}
      onDragStart={({ active }) => {
        dragging = true
        setActiveId(active.id)
        navigator.vibrate?.(10)
      }}
      onDragOver={({ over }) => setOverSub(String(over?.id ?? '').startsWith('sub:'))}
      onDragEnd={onDragEnd}
      onDragCancel={finish}
    >
      {before}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="task-list">
          {tasks.length === 0 && <p className="empty">{emptyText}</p>}
          {tasks.map((t) => (
            <SortableCard
              key={t.id}
              task={t}
              area={areasById[t.area_id]}
              disabled={selecting}
              lastDragEnd={lastDragEnd}
              selecting={selecting}
              selected={selected?.has(t.id)}
              onToggleSelect={onToggleSelect}
              onOpen={onOpen}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeTask && (
          <TaskCard
            task={activeTask}
            area={areasById[activeTask.area_id]}
            className={`is-overlay ${overSub ? 'is-over-sub' : ''}`}
            onOpen={() => {}}
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}
