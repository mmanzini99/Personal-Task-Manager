import { useState } from 'react'
import { useData } from '../data'
import { Confirm } from './Sheet'
import { IconSort } from './Icons'

export default function ListControls({ title, visible, showCompleted, setShowCompleted, extra }) {
  const { sortByDue } = useData()
  const [confirming, setConfirming] = useState(false)
  return (
    <div className="list-head">
      {title && <h2 className="section-title">{title}</h2>}
      <div className="list-controls">
        <button className="chip" onClick={() => setConfirming(true)} disabled={visible.length < 2}>
          <IconSort width={18} height={18} /> Ordina per scadenza
        </button>
        <label className="switch">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
          />
          <span className="switch-track" aria-hidden="true" />
          Mostra completate
        </label>
        {extra}
      </div>
      {confirming && (
        <Confirm
          message="Ordinare le task per scadenza? L'ordine manuale attuale verrà sovrascritto."
          confirmLabel="Ordina"
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false)
            sortByDue(visible)
          }}
        />
      )}
    </div>
  )
}
