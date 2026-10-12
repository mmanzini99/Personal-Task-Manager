import { useEffect } from 'react'

// Pannello modale: dal basso su telefono, centrato su PC.
export default function Sheet({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.classList.add('no-scroll')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('no-scroll')
    }
  }, [onClose])

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {title && <h2 className="sheet-title">{title}</h2>}
        {children}
      </div>
    </div>
  )
}

export function Confirm({ message, confirmLabel = 'Conferma', danger, onConfirm, onCancel }) {
  return (
    <Sheet onClose={onCancel}>
      <p className="confirm-message">{message}</p>
      <div className="sheet-actions">
        <button className="btn btn--ghost" onClick={onCancel}>Annulla</button>
        <button className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Sheet>
  )
}
