import { useEffect, useRef, useState } from 'react'
import { useData } from '../data'
import { parseDate } from '../lib/date'
import AreaLogo from './AreaLogo'
import DateInput from './DateInput'
import DateShortcuts from './DateShortcuts'
import { IconNote } from './Icons'

// Box di inserimento fisso in fondo alla schermata.
// Se `fixedArea` è indicata, le nuove task vanno in quell'area (e in `subcategoryId`).
export default function Composer({ fixedArea, subcategoryId = null }) {
  const { areas, addTask } = useData()
  const [title, setTitle] = useState('')
  const [areaId, setAreaId] = useState(null)
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [notesOpen, setNotesOpen] = useState(false)
  const [message, setMessage] = useState(null)
  const [areaMissing, setAreaMissing] = useState(false)
  const [dateFocused, setDateFocused] = useState(false)
  const boxRef = useRef(null)
  const titleRef = useRef(null)

  const dateCheck = parseDate(date)
  const dateComplete = date.replace(/\D/g, '').length === 8
  const dateInvalid = (dateComplete && !!dateCheck.error) || message?.field === 'date'

  // Comunica l'altezza del box per lasciare spazio in fondo alla lista
  // e lo mantiene sopra la tastiera di iOS.
  useEffect(() => {
    const box = boxRef.current
    const ro = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--composer-h', `${box.offsetHeight}px`)
    })
    ro.observe(box)
    const vv = window.visualViewport
    const onViewport = () => {
      const offset = vv ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0
      box.style.transform = offset ? `translateY(-${offset}px)` : ''
    }
    vv?.addEventListener('resize', onViewport)
    vv?.addEventListener('scroll', onViewport)
    return () => {
      ro.disconnect()
      vv?.removeEventListener('resize', onViewport)
      vv?.removeEventListener('scroll', onViewport)
    }
  }, [])

  const submit = () => {
    const text = title.trim()
    if (!text) return
    const chosen = fixedArea ? fixedArea.id : areaId
    if (!chosen) {
      setAreaMissing(true)
      setMessage({ field: 'area', text: 'Scegli un\'area' })
      return
    }
    if (dateCheck.error) {
      setMessage({ field: 'date', text: dateCheck.error })
      return
    }
    addTask({
      title: text,
      areaId: chosen,
      subcategoryId,
      dueDate: dateCheck.iso,
      notes: notes.trim() || null
    })
    setTitle('')
    setDate('')
    setNotes('')
    setNotesOpen(false)
    setMessage(null)
    if (!fixedArea) setAreaId(null)
  }

  const visibleMessage =
    message?.text || (dateComplete && dateCheck.error ? dateCheck.error : null)

  return (
    <div className="composer-wrap" ref={boxRef}>
      <div className="composer">
        <input
          ref={titleRef}
          className="composer-title"
          type="text"
          placeholder="Scrivi e premi Invio…"
          value={title}
          enterKeyHint="send"
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              e.preventDefault()
              submit()
            }
          }}
          aria-label="Nuova task"
        />
        <div className="composer-row">
          <div className={`composer-areas ${areaMissing ? 'shake' : ''}`} onAnimationEnd={() => setAreaMissing(false)}>
            {fixedArea ? (
              <span className="area-pick is-selected" style={{ '--ring': fixedArea.color }}>
                <AreaLogo area={fixedArea} size={32} />
              </span>
            ) : (
              areas.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`area-pick ${areaId === a.id ? 'is-selected' : ''} ${areaId ? '' : 'is-none'}`}
                  style={{ '--ring': a.color }}
                  onClick={() => {
                    setAreaId(areaId === a.id ? null : a.id)
                    if (message?.field === 'area') setMessage(null)
                  }}
                  aria-label={a.name}
                  aria-pressed={areaId === a.id}
                >
                  <AreaLogo area={a} size={32} />
                </button>
              ))
            )}
          </div>
          <DateInput
            value={date}
            onChange={(v) => {
              setDate(v)
              if (message?.field === 'date') setMessage(null)
            }}
            invalid={dateInvalid}
            onFocus={() => setDateFocused(true)}
            onBlur={() => setDateFocused(false)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), submit())}
          />
          <button
            type="button"
            className={`icon-btn ${notesOpen || notes ? 'is-active' : ''}`}
            onClick={() => setNotesOpen(!notesOpen)}
            aria-label="Note"
            aria-expanded={notesOpen}
          >
            <IconNote />
          </button>
        </div>
        {dateFocused && (
          <DateShortcuts
            value={date}
            onPick={(v) => {
              setDate(v)
              if (message?.field === 'date') setMessage(null)
              titleRef.current.focus()
            }}
          />
        )}
        {notesOpen && (
          <textarea
            className="composer-notes"
            placeholder="Note (facoltative)"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        )}
        {visibleMessage && <div className="composer-message">{visibleMessage}</div>}
      </div>
    </div>
  )
}
