import { useRef, useState } from 'react'
import { useData } from '../data'
import { supabase } from '../supabase'
import { toSquarePng } from '../lib/image'
import AreaLogo from './AreaLogo'
import Sheet, { Confirm } from './Sheet'
import { IconChevron } from './Icons'

function AreaEditor({ area, onBack }) {
  const { updateArea, uploadLogo, removeLogoFile } = useData()
  const [name, setName] = useState(area.name)
  const [color, setColor] = useState(area.color)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const fileRef = useRef(null)

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const png = await toSquarePng(file)
      const url = await uploadLogo(area.id, png)
      if (url) {
        const old = area.logo_url
        await updateArea(area.id, { logo_url: url })
        removeLogoFile(old)
      }
    } catch {
      setError('Immagine non valida')
    }
    setBusy(false)
  }

  const save = () => {
    if (!name.trim()) return setError('Il nome non può essere vuoto')
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) return setError('Colore non valido (es. #2B54C8)')
    updateArea(area.id, { name: name.trim(), color: color.toUpperCase() })
    onBack()
  }

  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
    >
      <div className="logo-edit">
        <AreaLogo area={{ ...area, name: name || area.name, color }} size={72} />
        <div className="logo-edit-actions">
          <button type="button" className="btn btn--ghost" disabled={busy} onClick={() => fileRef.current.click()}>
            {busy ? 'Caricamento…' : area.logo_url ? 'Cambia logo' : 'Carica logo'}
          </button>
          {area.logo_url && (
            <button
              type="button"
              className="btn btn--danger-ghost"
              disabled={busy}
              onClick={() => {
                removeLogoFile(area.logo_url)
                updateArea(area.id, { logo_url: null })
              }}
            >
              Rimuovi logo
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
      </div>
      <label className="field">
        <span>Nome</span>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <div className="field">
        <span>Colore</span>
        <div className="color-row">
          <input type="color" value={/^#[0-9A-Fa-f]{6}$/.test(color) ? color : '#000000'} onChange={(e) => setColor(e.target.value.toUpperCase())} aria-label="Scegli colore" />
          <input type="text" value={color} maxLength={7} onChange={(e) => setColor(e.target.value)} aria-label="Codice colore" />
        </div>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="sheet-actions">
        <button type="button" className="btn btn--ghost" onClick={onBack}>Indietro</button>
        <button type="submit" className="btn btn--primary">Salva</button>
      </div>
    </form>
  )
}

export default function SettingsSheet({ onClose }) {
  const { areas } = useData()
  const [editingId, setEditingId] = useState(null)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const editing = areas.find((a) => a.id === editingId)

  if (confirmLogout) {
    return (
      <Confirm
        message="Vuoi uscire? Dovrai inserire di nuovo email e password su questo dispositivo."
        confirmLabel="Esci"
        danger
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => supabase.auth.signOut()}
      />
    )
  }

  return (
    <Sheet title={editing ? `Modifica ${editing.name}` : 'Gestione aree'} onClose={onClose}>
      {editing ? (
        <AreaEditor key={editing.id} area={editing} onBack={() => setEditingId(null)} />
      ) : (
        <>
          <div className="settings-list">
            {areas.map((a) => (
              <button key={a.id} className="settings-row" onClick={() => setEditingId(a.id)}>
                <AreaLogo area={a} size={36} />
                <span className="settings-name">{a.name}</span>
                <span className="swatch" style={{ background: a.color }} />
                <IconChevron width={18} height={18} />
              </button>
            ))}
          </div>
          <div className="sheet-actions sheet-actions--split">
            <button className="btn btn--danger-ghost" onClick={() => setConfirmLogout(true)}>Esci</button>
            <button className="btn btn--primary" onClick={onClose}>Chiudi</button>
          </div>
        </>
      )}
    </Sheet>
  )
}
