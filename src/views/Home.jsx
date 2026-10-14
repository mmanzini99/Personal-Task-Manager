import { useMemo, useState } from 'react'
import { useData } from '../data'
import { go } from '../lib/router'
import { todayLabel } from '../lib/date'
import { useShowCompleted } from '../lib/useShowCompleted'
import AreaLogo from '../components/AreaLogo'
import Composer from '../components/Composer'
import EditTaskSheet from '../components/EditTaskSheet'
import ListControls from '../components/ListControls'
import SettingsSheet from '../components/SettingsSheet'
import TaskList from '../components/TaskList'
import { IconCheck, IconChevron, IconGear } from '../components/Icons'

export default function Home({ areasById }) {
  const { areas, tasks } = useData()
  const [showCompleted, setShowCompleted] = useShowCompleted()
  const [editing, setEditing] = useState(null)
  const [settings, setSettings] = useState(false)

  const visible = useMemo(
    () => tasks.filter((t) => showCompleted || !t.completed_at),
    [tasks, showCompleted]
  )
  const doneCount = tasks.filter((t) => t.completed_at).length
  const openCount = (areaId) => tasks.filter((t) => t.area_id === areaId && !t.completed_at).length

  return (
    <div className="page">
      <header className="home-head">
        <div>
          <h1 className="greeting">Ciao Massimiliano</h1>
          <p className="today">{todayLabel()}</p>
        </div>
        <button className="icon-btn" onClick={() => setSettings(true)} aria-label="Gestione aree">
          <IconGear />
        </button>
      </header>

      <div className="area-grid">
        {areas.map((a) => {
          const n = openCount(a.id)
          return (
            <button key={a.id} className="area-tile" style={{ background: a.color }} onClick={() => go(`/area/${a.id}`)}>
              <span className="tile-logo">
                <AreaLogo area={a} size={36} />
              </span>
              <span className="tile-foot">
                <span className="tile-name">{a.name}</span>
                <span className="tile-count">{n === 1 ? '1 da fare' : `${n} da fare`}</span>
              </span>
            </button>
          )
        })}
      </div>

      <button className="done-row" onClick={() => go('/svolte')}>
        <span className="done-icon">
          <IconCheck width={16} height={16} strokeWidth={3} />
        </span>
        <span className="done-name">Task svolte</span>
        <span className="sub-count">{doneCount}</span>
        <IconChevron width={18} height={18} />
      </button>

      <ListControls
        title="Tutte le task"
        visible={visible}
        showCompleted={showCompleted}
        setShowCompleted={setShowCompleted}
      />
      <TaskList
        tasks={visible}
        areasById={areasById}
        showCompleted={showCompleted}
        onOpen={setEditing}
      />

      <Composer />
      {editing && <EditTaskSheet task={editing} onClose={() => setEditing(null)} />}
      {settings && <SettingsSheet onClose={() => setSettings(false)} />}
    </div>
  )
}
